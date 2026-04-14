# API設計

## 基本方針

- ベースパス: `/api`
- 認証: JWT Bearer トークン（`Authorization: Bearer <token>`）
- レスポンス形式: JSON
- 認証なし: ログインエンドポイントのみ

## エンドポイント一覧

### 認証

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| POST | /api/auth/login | 不要 | ログイン → JWTトークン返却 |
| GET | /api/auth/me | 必要 | ログイン中ユーザー情報取得 |

### レシピ

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | /api/recipes | 必要 | 一覧取得（domain_id・tag_idでフィルタ可） |
| POST | /api/recipes | 必要 | 新規作成 |
| GET | /api/recipes/{id} | 必要 | 詳細取得 |
| PUT | /api/recipes/{id} | 必要 | 更新 |
| DELETE | /api/recipes/{id} | 必要 | 削除 |
| GET | /api/recipes/{id}/er | 必要 | SQLパース結果取得（テーブル名・JOINキー） |

### コメント

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | /api/recipes/{id}/comments | 必要 | コメント一覧（時系列昇順） |
| POST | /api/recipes/{id}/comments | 必要 | コメント追加 |
| PUT | /api/comments/{id} | 必要 | コメント編集（本人のみ） |
| DELETE | /api/comments/{id} | 必要 | コメント削除（本人 or 管理者） |

### ドメイン管理（管理者のみ）

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | /api/domains | 必要 | 一覧取得 |
| POST | /api/domains | 管理者 | 作成 |
| PUT | /api/domains/{id} | 管理者 | 更新 |
| DELETE | /api/domains/{id} | 管理者 | 削除 |

### タグ管理（管理者のみ）

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | /api/tags | 必要 | 一覧取得 |
| POST | /api/tags | 管理者 | 作成 |
| PUT | /api/tags/{id} | 管理者 | 更新 |
| DELETE | /api/tags/{id} | 管理者 | 削除 |

### ユーザー管理（管理者のみ）

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | /api/users | 管理者 | 一覧取得 |
| POST | /api/users | 管理者 | ユーザー作成 |
| PUT | /api/users/{id} | 管理者 | 情報更新 |
| POST | /api/users/{id}/reset-password | 管理者 | パスワードリセット（管理者が仮パスワードを設定） |

## ER図パースの仕様

`GET /api/recipes/{id}/er` のレスポンス形式:

```json
{
  "tables": ["sales", "customers", "regions"],
  "joins": [
    { "from_table": "sales", "to_table": "customers", "on": "sales.cust_id = customers.id" },
    { "from_table": "sales", "to_table": "regions",   "on": "sales.region_id = regions.id" }
  ]
}
```

- SQLパースは `node-sql-parser` をフロントエンドで実行
- このエンドポイントはSQLテキストを返すのみ（パース自体はフロント側）
- パース失敗時はエラーを表示、補正機能なし
