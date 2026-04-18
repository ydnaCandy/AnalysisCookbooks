# ER図 Mermaid化 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@xyflow/react` を廃止し Mermaid.js でER図を再レンダリングすることで、ノードとエッジラベルの重なりを解消し見やすさを向上させる。

**Architecture:** SQLパーサーの出力（`ErData`）を `erDataToMermaid()` で Mermaid `flowchart LR` 記法に変換し、`mermaid.render()` でSVGを生成してモーダルのコンテンツエリアに表示する。モーダルの枠・ヘッダー・クローズボタンは変更しない。

**Tech Stack:** React 18, TypeScript, mermaid（新規追加）、node-sql-parser（既存）

---

## ファイル一覧

| 操作 | ファイル |
|------|---------|
| 修正 | `frontend/package.json` |
| 修正 | `frontend/src/utils/sqlParser.ts` |
| 修正 | `frontend/src/components/modals/ErDiagramModal.tsx` |

---

## Task 1: 依存パッケージの入れ替え

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: mermaid を追加し @xyflow/react を削除する**

```bash
cd /workspace/frontend
npm install mermaid
npm uninstall @xyflow/react
```

- [ ] **Step 2: package.json の内容を確認する**

```bash
grep -E '"mermaid"|"@xyflow"' package.json
```

期待結果: `"mermaid": "..."` が存在し `@xyflow/react` が存在しない

- [ ] **Step 3: TypeScript 型定義の確認**

```bash
./node_modules/.bin/tsc --noEmit 2>&1 | head -20
```

この時点では `ErDiagramModal.tsx` が `@xyflow/react` を import しているためエラーが出る。次タスクで解消する。

---

## Task 2: sqlParser.ts に erDataToMermaid() を追加

**Files:**
- Modify: `frontend/src/utils/sqlParser.ts`

現在の `sqlParser.ts` 末尾に以下を追記する（既存コードは一切変更しない）。

- [ ] **Step 1: `erDataToMermaid` と補助関数を追記する**

ファイル末尾に追加するコード：

```ts
function extractFkColumn(on: string): string {
  // "orders.user_id = users.id" → "user_id"
  const match = on.match(/^[\w]+\.([\w]+)\s*=/)
  return match ? match[1] : on
}

function quoteMermaidNode(name: string): string {
  // 英数字・アンダースコア以外を含む場合はクォート
  return /^[a-zA-Z0-9_]+$/.test(name) ? name : `["${name}"]`
}

export function erDataToMermaid(data: ErData): string {
  const lines: string[] = ['flowchart LR']

  if (data.joins.length === 0) {
    // JOINなし：テーブルをノードとして列挙
    data.tables.forEach((t) => lines.push(`  ${quoteMermaidNode(t)}`))
  } else {
    data.joins.forEach((join) => {
      const label = extractFkColumn(join.on)
      const from = quoteMermaidNode(join.from)
      const to = quoteMermaidNode(join.to)
      lines.push(`  ${from} --> |${label}| ${to}`)
    })
  }

  return lines.join('\n')
}
```

- [ ] **Step 2: TypeScript エラーがないことを確認する**

```bash
cd /workspace/frontend && ./node_modules/.bin/tsc --noEmit 2>&1 | grep sqlParser
```

期待結果: 出力なし（sqlParser.ts のエラーなし）

---

## Task 3: ErDiagramModal.tsx を Mermaid に書き換える

**Files:**
- Modify: `frontend/src/components/modals/ErDiagramModal.tsx`

- [ ] **Step 1: ErDiagramModal.tsx を以下の内容に書き換える**

```tsx
import { useMemo, useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { parseSqlForEr, erDataToMermaid } from '../../utils/sqlParser'

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  flowchart: { curve: 'basis' },
})

interface Props {
  sqlText: string
  onClose: () => void
}

export default function ErDiagramModal({ sqlText, onClose }: Props) {
  const erData = useMemo(() => parseSqlForEr(sqlText), [sqlText])
  const diagramText = useMemo(
    () => (erData && erData.tables.length > 0 ? erDataToMermaid(erData) : null),
    [erData]
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const [renderError, setRenderError] = useState(false)

  useEffect(() => {
    if (!diagramText || !containerRef.current) return
    setRenderError(false)
    const id = `er-${Date.now()}`
    mermaid
      .render(id, diagramText)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      })
      .catch(() => setRenderError(true))
  }, [diagramText])

  const errorMsg =
    !erData ? 'SQLのパースに失敗しました' :
    erData.tables.length === 0 ? 'テーブルが検出されませんでした' :
    renderError ? '図の生成に失敗しました' :
    null

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200 }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 201,
          width: '95vw',
          height: '90vh',
          background: 'var(--theme-bg-surface)',
          border: '3px solid var(--theme-border)',
          boxShadow: '6px 6px 0 var(--theme-shadow)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            background: 'var(--theme-header-bg)',
            color: 'var(--theme-header-text)',
            fontFamily: 'var(--theme-font-display)',
            fontSize: 14,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span>ER DIAGRAM</span>
          <span style={{ cursor: 'pointer', color: '#d63031' }} onClick={onClose}>[ X ]</span>
        </div>

        {/* コンテンツ */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#fff',
          }}
        >
          {errorMsg ? (
            <div
              style={{
                fontFamily: 'var(--theme-font-display)',
                fontSize: 14,
                color: errorMsg === 'テーブルが検出されませんでした'
                  ? 'var(--theme-border-soft)'
                  : '#d63031',
              }}
            >
              {errorMsg}
            </div>
          ) : (
            <div ref={containerRef} style={{ maxWidth: '100%' }} />
          )}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: TypeScript エラーがないことを確認する**

```bash
cd /workspace/frontend && ./node_modules/.bin/tsc --noEmit 2>&1 | head -20
```

期待結果: 出力なし（エラーなし）

- [ ] **Step 3: ビルドが通ることを確認する**

```bash
cd /workspace/frontend && npm run build 2>&1 | tail -10
```

期待結果: `built in` で終わる成功メッセージ

- [ ] **Step 4: コミットする**

```bash
cd /workspace && git add frontend/package.json frontend/package-lock.json frontend/src/utils/sqlParser.ts frontend/src/components/modals/ErDiagramModal.tsx
git commit -m "feat: ER図をMermaid.jsに置き換え（@xyflow/react廃止）"
```

---

## Task 4: 動作確認

- [ ] **Step 1: dev server を起動する**

```bash
cd /workspace/frontend && npm run dev -- --host 0.0.0.0 2>&1 &
sleep 4 && echo "ready"
```

- [ ] **Step 2: バックエンドを起動する**

```bash
cd /workspace/backend && .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
sleep 2 && echo "ready"
```

- [ ] **Step 3: ブラウザで動作確認する**

以下のシナリオを順番に確認する：

1. ログインしてレシピ一覧を表示
2. JOINを含むSQLを持つレシピを開く（または新規作成でJOIN SQLを入力）
3. `[ ER ]` ボタンをクリック
4. Mermaidのクリーンなフローチャートが表示されること
5. テーブルとエッジラベルが重ならないこと
6. ER図モーダルのヘッダー・クローズボタンが正常に動作すること

確認用SQLの例：
```sql
SELECT o.id, u.name, p.title
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN products p ON o.product_id = p.id
```

- [ ] **Step 4: サーバーを停止する**

```bash
pkill -f uvicorn; pkill -f vite
```
