# UIの改善: ズーム対応・SQLシンタックスハイライト 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ブラウザのズーム時にコンテンツが切れない挙動に修正し、SQLエディタにシンタックスハイライト・行番号を追加する。

**Architecture:** AppLayoutの`height`と`overflow`を1箇所変更してズーム対応。RecipeModalのSQLエリアのtextareaをCodeMirror 6コンポーネント（`@uiw/react-codemirror`）に差し替えてハイライト・行番号を追加。

**Tech Stack:** React 19, TypeScript, `@uiw/react-codemirror`, `@codemirror/lang-sql`

---

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `frontend/src/components/layout/AppLayout.tsx` | 修正 | `height: 100vh → 100dvh`, `overflow: hidden → auto` |
| `frontend/src/components/modals/RecipeModal.tsx` | 修正 | textarea → CodeMirrorコンポーネントに差し替え |
| `frontend/package.json` | 修正 | 依存パッケージ追加 |

---

### Task 1: AppLayoutのズーム対応

**Files:**
- Modify: `frontend/src/components/layout/AppLayout.tsx:12`

- [ ] **Step 1: ブランチを作成**

```bash
git checkout -b feat/ui-improvements
```

- [ ] **Step 2: AppLayout.tsxを修正**

`frontend/src/components/layout/AppLayout.tsx` の12行目を以下に変更:

変更前:
```tsx
<div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
```

変更後:
```tsx
<div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'auto' }}>
```

- [ ] **Step 3: devサーバーで動作確認**

```bash
cd frontend && npm run dev
```

ブラウザで `http://localhost:5173` を開いてズームイン（Ctrl + +）し、コンテンツが切れずスクロールバーが表示されることを確認。

- [ ] **Step 4: コミット**

```bash
git add frontend/src/components/layout/AppLayout.tsx
git commit -m "fix: ズームイン時にスクロール可能になるようAppLayoutのoverflowを修正"
```

---

### Task 2: CodeMirror 6インストール

**Files:**
- Modify: `frontend/package.json`（npm installで自動更新）

- [ ] **Step 1: パッケージをインストール**

```bash
cd frontend && npm install @uiw/react-codemirror @codemirror/lang-sql
```

期待出力例:
```
added N packages, and audited M packages in Xs
```

エラーがないことを確認。

- [ ] **Step 2: TypeScriptの型解決確認**

```bash
cd frontend && npx tsc --noEmit
```

期待: エラーなし（0件）

- [ ] **Step 3: コミット**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: @uiw/react-codemirror と @codemirror/lang-sql を追加"
```

---

### Task 3: RecipeModalのSQLエディタをCodeMirrorに置き換え

**Files:**
- Modify: `frontend/src/components/modals/RecipeModal.tsx`

現在のtextareaは265〜281行目付近にある（`<textarea style={{ flex: 1, background: '#1e1e1e', ...`）。

- [ ] **Step 1: importを追加**

`frontend/src/components/modals/RecipeModal.tsx` の先頭importブロック（現在1行目）に以下を追加:

```tsx
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
```

追加後のimportブロック:
```tsx
import { useState, useEffect, lazy, Suspense } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import type { Domain, Tag, Recipe } from '../../types'
import { useRecipeMutations } from '../../hooks/useRecipes'
import CommentThread from './CommentThread'
```

- [ ] **Step 2: textareaをCodeMirrorに置き換え**

以下のtextareaブロックを:

```tsx
<textarea
  style={{
    flex: 1,
    background: '#1e1e1e',
    color: '#d4d4d4',
    fontFamily: 'monospace',
    fontSize: 15,
    padding: 14,
    border: 'none',
    outline: 'none',
    resize: 'none',
    lineHeight: 1.7,
    textAlign: 'left',
    overflowY: 'auto',
  }}
  value={sqlText}
  onChange={(e) => setSqlText(e.target.value)}
  spellCheck={false}
/>
```

以下に置き換え（textareaをwrapperごと差し替え）:

```tsx
<div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
  <CodeMirror
    value={sqlText}
    onChange={(val) => setSqlText(val)}
    extensions={[sql()]}
    theme="dark"
    height="100%"
    basicSetup={{
      lineNumbers: true,
      foldGutter: false,
      autocompletion: false,
    }}
    style={{ position: 'absolute', inset: 0, fontSize: 15 }}
  />
</div>
```

- [ ] **Step 3: TypeScript型チェック**

```bash
cd frontend && npx tsc --noEmit
```

期待: エラーなし（0件）

- [ ] **Step 4: devサーバーで動作確認**

```bash
cd frontend && npm run dev
```

ブラウザで以下を確認:
1. レシピ一覧からレシピをクリックしてモーダルを開く
2. SQLエリアに行番号が表示されている
3. SQLキーワード（SELECT, FROM, WHERE等）が青く色付けされている
4. 文字列リテラルは橙色、コメントは緑色で表示されている
5. SQLを編集するとリアルタイムで反映される
6. ER図ボタン（[ ER ]）がSQLに応じて有効/無効になる

- [ ] **Step 5: コミット**

```bash
git add frontend/src/components/modals/RecipeModal.tsx
git commit -m "feat: SQLエディタにCodeMirror 6によるシンタックスハイライト・行番号を追加"
```

---

### Task 4: プロダクションビルド確認とmainマージ

**Files:**
- なし（確認のみ）

- [ ] **Step 1: プロダクションビルドを実行**

```bash
cd frontend && npm run build
```

期待出力例:
```
✓ built in Xs
dist/index.html     0.XX kB
dist/assets/...
```

TypeScriptエラー・ビルドエラーがないことを確認。

- [ ] **Step 2: mainにマージ**

```bash
git checkout main
git merge --no-ff feat/ui-improvements -m "Merge branch 'feat/ui-improvements'"
git branch -d feat/ui-improvements
```
