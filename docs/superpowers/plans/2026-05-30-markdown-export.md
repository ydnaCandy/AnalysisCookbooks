# レシピMarkdownエクスポート 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** レシピ詳細モーダルに「MD出力」ボタンを追加し、レシピ内容をMarkdownファイルとしてダウンロードできるようにする。

**Architecture:** フロントエンド完結。`exportMarkdown.ts` ユーティリティでMarkdown生成・ダウンロードを担当し、`RecipeModal.tsx` からそれを呼び出す。バックエンド変更なし。

**Tech Stack:** TypeScript, React 19, Vite（ビルド確認用）

---

## ファイル構成

| 操作 | ファイル | 役割 |
|------|---------|------|
| 作成 | `frontend/src/utils/exportMarkdown.ts` | Markdown生成・ファイルダウンロードロジック |
| 修正 | `frontend/src/components/modals/RecipeModal.tsx` | MD出力ボタンの追加 |

---

### Task 1: exportMarkdown.ts を作成する

**Files:**
- Create: `frontend/src/utils/exportMarkdown.ts`

- [ ] **Step 1: ファイルを作成する**

`frontend/src/utils/exportMarkdown.ts` を以下の内容で作成する:

```typescript
import type { Recipe } from '../types'

export function generateExportFilename(recipe: Recipe): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const safeName = recipe.title.replace(/\s+/g, '_').replace(/[/\\:*?"<>|]/g, '')
  return `${yyyy}${mm}${dd}_${safeName}.md`
}

export function generateMarkdownContent(recipe: Recipe): string {
  const tags = recipe.tags.length > 0 ? recipe.tags.map((t) => t.name).join(', ') : 'なし'
  const domain = recipe.domain?.name ?? '未設定'
  const description = recipe.description?.trim() || 'なし'
  const createdBy = recipe.created_by_user?.username ?? '不明'

  const createdAt = new Date(recipe.created_at)
  const jst = new Date(createdAt.getTime() + 9 * 60 * 60 * 1000)
  const dateStr = jst.toISOString().slice(0, 16).replace('T', ' ')

  return `# ${recipe.title}

## 説明
${description}

## ドメイン
${domain}

## タグ
${tags}

## 作成者
${createdBy} / ${dateStr}

## SQL
\`\`\`sql
${recipe.sql_text}
\`\`\`
`
}

export function exportRecipeAsMarkdown(recipe: Recipe): void {
  const content = generateMarkdownContent(recipe)
  const filename = generateExportFilename(recipe)
  const blob = new Blob([content], { type: 'text/markdown; charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2: ビルドエラーがないか確認する**

```bash
cd /workspace/frontend && npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 3: コミットする**

```bash
git add frontend/src/utils/exportMarkdown.ts
git commit -m "feat: レシピMarkdownエクスポートユーティリティを追加"
```

---

### Task 2: RecipeModal.tsx に MD出力ボタンを追加する

**Files:**
- Modify: `frontend/src/components/modals/RecipeModal.tsx`

- [ ] **Step 1: import を追加する**

`RecipeModal.tsx` の先頭 import 群の末尾に追加する:

```typescript
import { exportRecipeAsMarkdown } from '../../utils/exportMarkdown'
```

現在の import 末尾はこの行:
```typescript
import CommentThread from './CommentThread'
```

変更後:
```typescript
import CommentThread from './CommentThread'
import { exportRecipeAsMarkdown } from '../../utils/exportMarkdown'
```

- [ ] **Step 2: ボタンを追加する**

`RecipeModal.tsx` のボタン群（`[ ER ]` ボタンの直後）に MD出力ボタンを追加する。

現在のコード（`[ ER ]` ボタン部分）:
```tsx
              <button
                style={{ ...btnBase, background: '#0984e3', color: '#fff', boxShadow: '3px 3px 0 #055a9a' }}
                onClick={() => setShowErModal(true)}
                disabled={!sqlText.trim()}
              >
                [ ER ]
              </button>
```

変更後:
```tsx
              <button
                style={{ ...btnBase, background: '#0984e3', color: '#fff', boxShadow: '3px 3px 0 #055a9a' }}
                onClick={() => setShowErModal(true)}
                disabled={!sqlText.trim()}
              >
                [ ER ]
              </button>
              {recipe && (
                <button
                  style={{ ...btnBase, background: '#2ecc71', color: '#fff', boxShadow: '3px 3px 0 #1a8a4a' }}
                  onClick={() => exportRecipeAsMarkdown(recipe)}
                >
                  [ MD ]
                </button>
              )}
```

- [ ] **Step 3: ビルドエラーがないか確認する**

```bash
cd /workspace/frontend && npx tsc --noEmit
```

期待: エラーなし

- [ ] **Step 4: 動作確認する**

```bash
cd /workspace/frontend && npm run dev
```

ブラウザで以下を確認:
1. 既存レシピのモーダルを開く → `[ MD ]` ボタンが表示される
2. `[ MD ]` ボタンをクリック → `YYYYMMDD_タイトル.md` がダウンロードされる
3. ダウンロードしたファイルをテキストエディタで開き、タイトル・説明・ドメイン・タグ・作成者・SQLが正しく含まれているか確認する
4. 新規作成モーダル（`NEW RECIPE`）を開く → `[ MD ]` ボタンが表示されないことを確認する

- [ ] **Step 5: コミットする**

```bash
git add frontend/src/components/modals/RecipeModal.tsx
git commit -m "feat: レシピ詳細モーダルにMD出力ボタンを追加"
```

---

### Task 3: ブランチをマージする

- [ ] **Step 1: mainブランチにno-ffマージする**

作業ブランチ名を確認してno-ffマージする:

```bash
git branch  # 現在のブランチ名を確認
git checkout main
git merge --no-ff <作業ブランチ名> -m "Merge branch '<作業ブランチ名>'"
```

