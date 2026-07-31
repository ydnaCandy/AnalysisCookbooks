# レシピセマンティックフィールド追加 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** レシピの`description`カラムを`usage_context`（業務での利用シーン）にリネームし、`data_notes`（データの使い方と注意点）を新規追加する。MD出力にも両フィールドを反映する。

**Architecture:** Alembicマイグレーションでカラムリネーム＋追加 → バックエンドのSQLModel・スキーマ更新 → フロントエンドの型・UI・MD出力を更新する。バックエンドとフロントエンドのフィールド名変更を同時にデプロイする必要がある。

**Tech Stack:** Python/FastAPI/SQLModel/Alembic（バックエンド）、TypeScript/React/TanStack Query（フロントエンド）

---

### Task 1: Alembicマイグレーションを作成する

**Files:**
- Create: `backend/alembic/versions/a1b2c3d4e5f6_rename_description_add_data_notes.py`

- [ ] **Step 1: マイグレーションファイルを作成する**

`backend/alembic/versions/a1b2c3d4e5f6_rename_description_add_data_notes.py` を以下の内容で作成する。

```python
"""rename description add data_notes

Revision ID: a1b2c3d4e5f6
Revises: 2f2b825726a8
Create Date: 2026-07-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '2f2b825726a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('recipes', 'description', new_column_name='usage_context')
    op.add_column('recipes', sa.Column('data_notes', sqlmodel.sql.sqltypes.AutoString(), nullable=True))


def downgrade() -> None:
    op.drop_column('recipes', 'data_notes')
    op.alter_column('recipes', 'usage_context', new_column_name='description')
```

- [ ] **Step 2: コミット**

```bash
git add backend/alembic/versions/a1b2c3d4e5f6_rename_description_add_data_notes.py
git commit -m "feat: descriptionをusage_contextにリネームしdata_notesを追加するマイグレーション"
```

---

### Task 2: バックエンドのモデルとスキーマを更新する

**Files:**
- Modify: `backend/app/models/recipe.py`
- Modify: `backend/app/schemas/recipe.py`

- [ ] **Step 1: `backend/app/models/recipe.py`を更新する**

`description: Optional[str] = None` を以下の2行に置き換える（28行目付近）。

```python
usage_context: Optional[str] = None
data_notes: Optional[str] = None
```

変更後のRecipeクラス全体：

```python
class Recipe(SQLModel, table=True):
    __tablename__ = "recipes"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    usage_context: Optional[str] = None
    data_notes: Optional[str] = None
    sql_text: str
    domain_id: int = Field(foreign_key="domains.id")
    created_by_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    domain: Optional["Domain"] = Relationship(back_populates="recipes")
    created_by_user: Optional["User"] = Relationship(back_populates="recipes")
    tags: List["Tag"] = Relationship(back_populates="recipes", link_model=RecipeTag)
    comments: List["RecipeComment"] = Relationship(back_populates="recipe")
```

- [ ] **Step 2: `backend/app/schemas/recipe.py`を更新する**

`description`を`usage_context`にリネームし、`data_notes`を追加する。ファイル全体を以下に置き換える。

```python
from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel
from app.schemas.domain import DomainRead
from app.schemas.tag import TagRead
from app.schemas.user import UserRead


class RecipeCreate(SQLModel):
    title: str
    usage_context: Optional[str] = None
    data_notes: Optional[str] = None
    sql_text: str
    domain_id: int
    tag_ids: List[int] = []


class RecipeUpdate(SQLModel):
    title: Optional[str] = None
    usage_context: Optional[str] = None
    data_notes: Optional[str] = None
    sql_text: Optional[str] = None
    domain_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None


class RecipeRead(SQLModel):
    id: int
    title: str
    usage_context: Optional[str]
    data_notes: Optional[str]
    sql_text: str
    domain_id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    domain: Optional[DomainRead]
    tags: List[TagRead]
    created_by_user: Optional[UserRead]
```

- [ ] **Step 3: コミット**

```bash
git add backend/app/models/recipe.py backend/app/schemas/recipe.py
git commit -m "feat: Recipeモデルとスキーマのdescriptionをusage_contextにリネームしdata_notesを追加"
```

---

### Task 3: フロントエンドの型定義を更新する

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/api/recipes.ts`

- [ ] **Step 1: `frontend/src/types/index.ts`のRecipeインターフェースを更新する**

`description: string | null` を以下の2行に置き換える（25行目付近）。

```typescript
export interface Recipe {
  id: number
  title: string
  usage_context: string | null
  data_notes: string | null
  sql_text: string
  domain_id: number
  created_by_id: number
  created_at: string
  updated_at: string
  domain: Domain | null
  tags: Tag[]
  created_by_user: User | null
}
```

- [ ] **Step 2: `frontend/src/api/recipes.ts`のAPIインターフェースを更新する**

`RecipeCreateInput`と`RecipeUpdateInput`の`description`を`usage_context`と`data_notes`に置き換える。ファイル全体を以下に置き換える。

```typescript
import { client } from './client'
import type { Recipe } from '../types'

export interface RecipeCreateInput {
  title: string
  usage_context?: string
  data_notes?: string
  sql_text: string
  domain_id: number
  tag_ids: number[]
}

export interface RecipeUpdateInput {
  title?: string
  usage_context?: string
  data_notes?: string
  sql_text?: string
  domain_id?: number
  tag_ids?: number[]
}

export const recipesApi = {
  list: (params?: { domain_id?: number; tag_id?: number }) => {
    const query = new URLSearchParams()
    if (params?.domain_id) query.set('domain_id', String(params.domain_id))
    if (params?.tag_id) query.set('tag_id', String(params.tag_id))
    const qs = query.toString()
    return client.get<Recipe[]>(`/recipes${qs ? `?${qs}` : ''}`)
  },
  get: (id: number) => client.get<Recipe>(`/recipes/${id}`),
  create: (data: RecipeCreateInput) => client.post<Recipe>('/recipes', data),
  update: (id: number, data: RecipeUpdateInput) => client.put<Recipe>(`/recipes/${id}`, data),
  delete: (id: number) => client.delete<void>(`/recipes/${id}`),
}
```

- [ ] **Step 3: コミット**

```bash
git add frontend/src/types/index.ts frontend/src/api/recipes.ts
git commit -m "feat: Recipe型とAPIインターフェースのdescriptionをusage_contextにリネームしdata_notesを追加"
```

---

### Task 4: RecipeModalのUIを更新する

**Files:**
- Modify: `frontend/src/components/modals/RecipeModal.tsx`

- [ ] **Step 1: stateとuseEffectを更新する**

50行目の `const [description, setDescription] = useState(recipe?.description ?? '')` を以下の2行に置き換える。

```typescript
const [usageContext, setUsageContext] = useState(recipe?.usage_context ?? '')
const [dataNotes, setDataNotes] = useState(recipe?.data_notes ?? '')
```

66行目の `setDescription(recipe.description ?? '')` を以下の2行に置き換える。

```typescript
setUsageContext(recipe.usage_context ?? '')
setDataNotes(recipe.data_notes ?? '')
```

- [ ] **Step 2: handleSaveのpayloadを更新する**

87行目と89行目の `description` を `usage_context` と `data_notes` に置き換える。

```typescript
// update（87行目）
await update.mutateAsync({
  id: recipe.id,
  data: {
    title,
    usage_context: usageContext,
    data_notes: dataNotes,
    sql_text: sqlText,
    domain_id: domainId,
    tag_ids: selectedTagIds,
  },
})

// create（89行目）
await create.mutateAsync({
  title,
  usage_context: usageContext,
  data_notes: dataNotes,
  sql_text: sqlText,
  domain_id: domainId,
  tag_ids: selectedTagIds,
})
```

- [ ] **Step 3: UIのtextareaを更新する**

214〜219行目の「DESCRIPTION / NOTES」セクションを以下に置き換える。

```tsx
<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={labelStyle}>USAGE CONTEXT</label>
    <textarea
      style={{ ...inputStyle, resize: 'none', minHeight: 80 }}
      value={usageContext}
      onChange={(e) => setUsageContext(e.target.value)}
      placeholder="業務での利用シーン（誰が・何の判断のために使うか）"
    />
  </div>
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={labelStyle}>DATA NOTES</label>
    <textarea
      style={{ ...inputStyle, resize: 'none', minHeight: 80 }}
      value={dataNotes}
      onChange={(e) => setDataNotes(e.target.value)}
      placeholder="データの使い方と注意点（粒度・カラムの定義・除外条件など）"
    />
  </div>
</div>
```

- [ ] **Step 4: コミット**

```bash
git add frontend/src/components/modals/RecipeModal.tsx
git commit -m "feat: RecipeModalにusage_contextとdata_notesの入力欄を追加"
```

---

### Task 5: MD出力を更新する

**Files:**
- Modify: `frontend/src/utils/exportMarkdown.ts`

- [ ] **Step 1: `generateMarkdownContent`関数を更新する**

ファイル全体を以下に置き換える。

```typescript
import type { Recipe, Comment } from '../types'

export function generateExportFilename(recipe: Recipe): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const safeName = recipe.title.replace(/\s+/g, '_').replace(/[/\\:*?"<>|]/g, '') || 'untitled'
  return `${yyyy}${mm}${dd}_${safeName}.md`
}

export function generateMarkdownContent(recipe: Recipe, comments?: Comment[]): string {
  const tags = recipe.tags.length > 0 ? recipe.tags.map((t) => t.name).join(', ') : 'なし'
  const domain = recipe.domain?.name ?? '未設定'
  const usageContext = recipe.usage_context?.trim() || 'なし'

  let content = `# ${recipe.title}

## 業務での利用シーン
${usageContext}

## ドメイン
${domain}

## タグ
${tags}

## SQL
\`\`\`sql
${recipe.sql_text}
\`\`\`
`

  if (recipe.data_notes?.trim()) {
    content += `\n## データの使い方と注意点\n${recipe.data_notes.trim()}\n`
  }

  if (comments && comments.length > 0) {
    const commentLines = comments.map((c) => {
      const createdAt = new Date(c.created_at)
      const jst = new Date(createdAt.getTime() + 9 * 60 * 60 * 1000)
      const dateStr = jst.toISOString().slice(0, 16).replace('T', ' ')
      return `- **${c.user?.username ?? '不明'}** (${dateStr})\n  ${c.content}`
    })
    content += `\n## コメント\n${commentLines.join('\n')}\n`
  }

  return content
}

export function exportRecipeAsMarkdown(recipe: Recipe, comments?: Comment[]): void {
  const content = generateMarkdownContent(recipe, comments)
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

- [ ] **Step 2: コミット**

```bash
git add frontend/src/utils/exportMarkdown.ts
git commit -m "feat: MD出力をusage_contextとdata_notesに対応"
```

---

### Task 6: マイグレーションを適用してデプロイ確認する

- [ ] **Step 1: マイグレーションを適用する**

DBが起動している状態で実行する。

```bash
cd backend
uv run alembic upgrade head
```

期待出力:
```
INFO  [alembic.runtime.migration] Running upgrade 2f2b825726a8 -> a1b2c3d4e5f6, rename description add data_notes
```

- [ ] **Step 2: バックエンドを再起動する**

```bash
# docker-compose環境の場合
docker-compose restart app
```

- [ ] **Step 3: フロントエンドをビルドして確認する**

```bash
cd frontend
npm run build
```

ビルドがエラーなく完了することを確認する。TypeScriptの型エラーがある場合は修正する。

- [ ] **Step 4: 動作確認**

ブラウザでアプリを開き、以下を確認する。
- レシピ詳細モーダルに「USAGE CONTEXT」「DATA NOTES」の入力欄が表示される
- 既存レシピを開いたとき、旧`description`の内容が「USAGE CONTEXT」欄に表示される
- 保存・編集が正常に動作する
- MD出力で「業務での利用シーン」「データの使い方と注意点（入力済みの場合）」が出力される

- [ ] **Step 5: mainにマージ**

```bash
git checkout main
git merge --no-ff feat/recipe-semantic-fields -m "feat: レシピにusage_contextとdata_notesフィールドを追加"
```
