# UIの改善: ズーム対応とSQLシンタックスハイライト

## 概要

ブラウザのズーム・リサイズ時のレイアウト崩れを修正し、SQLエディタにシンタックスハイライトと行番号を追加する。

## 変更1: ズーム・リサイズ対応

### 問題

`AppLayout.tsx` が `height: 100vh + overflow: hidden` で固定されているため、ズームインしたときにコンテンツが切れてアクセスできなくなる。

### 対応

`AppLayout.tsx` のルートdivを以下の通り変更する。

- `height: 100vh` → `height: 100dvh`
  - `dvh`（dynamic viewport height）はモバイルブラウザのUIバーを考慮した正確なビューポート高さ。`vh`はブラウザUIを含む場合があり、わずかにズレることがある。
- `overflow: hidden` → `overflow: auto`
  - ズームインやウィンドウ縮小でコンテンツがはみ出した際、スクロールバーが表示されコンテンツ全体にアクセスできる。

変更対象: `frontend/src/components/layout/AppLayout.tsx` の1行のみ。

## 変更2: SQLシンタックスハイライト

### 問題

`RecipeModal.tsx` のSQLエディタが素の `<textarea>` で、キーワードや文字列のハイライトがない。

### 対応

#### ライブラリ

- `@uiw/react-codemirror`: CodeMirror 6のReactラッパー
- `@codemirror/lang-sql`: SQL言語サポート

#### 機能

- SQLキーワード・文字列・コメントの色分け
- 行番号の表示
- オートコンプリートは含まない

#### 実装方針

- `RecipeModal.tsx` 内の `<textarea>` を `CodeMirror` コンポーネントに置き換える
- テーマ: `oneDark`（既存の `#1e1e1e` ダークスタイルと一致）
- `onChange` コールバックで既存の `sqlText` stateを更新する（現在のtextareaと同じデータフロー）
- フォント・フォントサイズ・パディングは既存に揃える

#### ファイル

- `frontend/package.json`: 依存関係追加
- `frontend/src/components/modals/RecipeModal.tsx`: textareaをCodeMirrorに置き換え
