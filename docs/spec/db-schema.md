# DBスキーマ設計

## テーブル一覧

### users

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | integer | PK, AUTO | ユーザーID |
| username | varchar(50) | UNIQUE, NOT NULL | ログイン用ユーザー名 |
| hashed_password | varchar | NOT NULL | Argon2ハッシュ化済みパスワード |
| is_admin | boolean | NOT NULL, DEFAULT false | 管理者フラグ |
| is_active | boolean | NOT NULL, DEFAULT true | 有効フラグ |
| created_at | timestamp | NOT NULL, DEFAULT now() | 作成日時 |

### domains

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | integer | PK, AUTO | ドメインID |
| name | varchar(100) | UNIQUE, NOT NULL | ドメイン名（例: 製造、営業、経営） |
| description | text | | 説明 |
| created_at | timestamp | NOT NULL, DEFAULT now() | 作成日時 |

### tags

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | integer | PK, AUTO | タグID |
| name | varchar(100) | UNIQUE, NOT NULL | タグ名（例: SAP、CRM） |
| created_at | timestamp | NOT NULL, DEFAULT now() | 作成日時 |

### recipes

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | integer | PK, AUTO | レシピID |
| title | varchar(200) | NOT NULL | タイトル |
| description | text | | 説明・注意点 |
| sql_text | text | NOT NULL | SQLクエリ本文 |
| domain_id | integer | FK(domains.id), NOT NULL | ドメイン |
| created_by | integer | FK(users.id), NOT NULL | 作成者 |
| created_at | timestamp | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | timestamp | NOT NULL, DEFAULT now() | 更新日時 |

### recipe_tags（中間テーブル）

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| recipe_id | integer | FK(recipes.id) | レシピID |
| tag_id | integer | FK(tags.id) | タグID |

PRIMARY KEY: (recipe_id, tag_id)

### recipe_comments

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | integer | PK, AUTO | コメントID |
| recipe_id | integer | FK(recipes.id), NOT NULL | 対象レシピ |
| user_id | integer | FK(users.id), NOT NULL | 投稿者 |
| content | text | NOT NULL | コメント本文 |
| created_at | timestamp | NOT NULL, DEFAULT now() | 投稿日時 |
| updated_at | timestamp | NOT NULL, DEFAULT now() | 更新日時 |

## テーブル間リレーション

```
users ─────────────────┐
  │                     │
  │ 1:N                 │ 1:N
  v                     v
recipes ──── N:N ──── tags
  │      (recipe_tags)
  │ 1:N
  v
recipe_comments
  │
  └── N:1 ── users
```

- `recipes.domain_id` → `domains.id`（N:1）
- `recipes.created_by` → `users.id`（N:1）
- `recipes` と `tags` は `recipe_tags` を介して N:N
- `recipe_comments.recipe_id` → `recipes.id`（N:1）
- `recipe_comments.user_id` → `users.id`（N:1）
