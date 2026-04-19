# ER図 Mermaid化 設計書

## 概要

現在のER図表示（`@xyflow/react` ReactFlow）をMermaid.jsに置き換え、見やすさを改善する。

**問題:** ReactFlowのノードとエッジラベルが重なって読みにくい。ズームコントロール・背景グリッドなどUIが煩雑。

**解決策:** Mermaidの `flowchart LR` 記法で自動レイアウトSVGを生成。テーブルとJOIN関係が重ならず、シンプルで読みやすい表示になる。

---

## スコープ

- 変更: カラーパレット・フォント以外のレイアウトは変更しない
- 変更: ER図モーダルの内側のみ（ヘッダー・クローズボタン・モーダル枠は維持）
- 削除: `@xyflow/react` パッケージ
- 追加: `mermaid` パッケージ

---

## アーキテクチャ

### ファイル一覧

| 操作 | ファイル |
|------|---------|
| 修正 | `frontend/src/components/modals/ErDiagramModal.tsx` |
| 修正 | `frontend/src/utils/sqlParser.ts` |
| 修正 | `frontend/package.json` |

---

## 詳細設計

### 1. sqlParser.ts — `erDataToMermaid()` 追加

既存の `parseSqlForEr()` は変更しない。`ErData` をMermaid記法文字列に変換するヘルパーを追加する。

```ts
export function erDataToMermaid(data: ErData): string
```

**出力形式:**

```
flowchart LR
  orders --> |user_id| users
  orders --> |product_id| products
```

**エッジラベル変換:**

JOIN条件 `orders.user_id = users.id` → `user_id`（ソーステーブル側のカラム名のみ、テーブルプレフィックスを除去）。

条件文字列のパース: `table.column = table.column` の形式から左辺のカラム部分を抽出。パースできない場合は条件文字列をそのまま使用。

**ノード名のクォート:**

テーブル名に英数字・アンダースコア以外の文字が含まれる場合、Mermaidの `["名前"]` 記法でクォートする。

**JOINなし（テーブル1つ）の場合:**

エッジがなくてもノードは表示する。単一ノードのflowchartを生成する。

```
flowchart LR
  orders
```

### 2. ErDiagramModal.tsx — Mermaidレンダリング

`@xyflow/react` の import を削除し、`mermaid` に置き換える。

**初期化:**

```ts
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  flowchart: { curve: 'basis' },
})
```

`startOnLoad: false` にして手動レンダリングを使用。`theme: 'neutral'` でMermaidのデフォルトクリーンスタイルを使用（アプリのテーマ切り替えとは独立）。

**レンダリング:**

```ts
useEffect(() => {
  if (!diagramText || !containerRef.current) return
  const id = `er-${Date.now()}`
  mermaid.render(id, diagramText).then(({ svg }) => {
    if (containerRef.current) containerRef.current.innerHTML = svg
  })
}, [diagramText])
```

`diagramText` は `erDataToMermaid(erData)` の結果。

**エラー処理:**

- `parseSqlForEr()` が `null` を返した場合: 「SQLのパースに失敗しました」テキスト表示（既存と同様）
- `erData.tables.length === 0` の場合: 「テーブルが検出されませんでした」テキスト表示（既存と同様）
- `mermaid.render()` が失敗した場合: `catch` でエラーを捕捉し「図の生成に失敗しました」を表示

**モーダル構造（変更なし）:**

ヘッダー・クローズボタン・モーダル枠はすべて現状維持。コンテンツエリア（`flex: 1` の div）の中身のみ変更。SVGはコンテンツエリアに `overflow: auto` でスクロール可能にして表示する。

### 3. package.json — 依存の更新

```
削除: @xyflow/react
追加: mermaid
```

`@xyflow/react/dist/style.css` のimportも `ErDiagramModal.tsx` から削除する。

---

## 制約・注意点

- MermaidのSVG内にはデフォルトのフォント・カラーが含まれる。アプリのCSS変数（`--theme-xxx`）はMermaid内部には適用されない（意図的）。
- `dangerouslySetInnerHTML` の代替として `containerRef.current.innerHTML = svg` を使用する（MermaidのSVG出力は信頼できるため問題なし）。
- テーブル数が多い場合（10以上）、MermaidのSVGが大きくなる可能性がある。`overflow: auto` でスクロール対応済み。
