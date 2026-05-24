# アーキテクチャ設計

## システム構成

```
[ブラウザ]
    |
    | HTTP/JSON  Authorization: Bearer <JWT>
    v
[FastAPI :8000]
    |
    | SQLModel / Alembic
    v
[PostgreSQL :5432]
```

## デプロイ構成

- docker-compose によるコンテナ構成
- サービス: `nginx`（リバースプロキシ）、`app`（FastAPI + uvicorn）、`db`（postgres:16）
- DBデータはホスト側にボリュームマウント

## 認証方式

- JWT（アクセストークン）
- ログイン成功時にトークンを返却、フロントは localStorage に保存
- 以降のリクエストは `Authorization: Bearer <token>` ヘッダーに付与
- トークン有効期限: 8時間（社内用途のため長め）

## ディレクトリ構成

```
/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # エンドポイントごとにファイル分割
│   │   ├── core/
│   │   │   ├── config.py        # 環境変数・設定
│   │   │   └── security.py      # JWT生成・検証、パスワードハッシュ
│   │   ├── db/
│   │   │   └── session.py       # DBセッション
│   │   ├── models/              # SQLModelモデル定義
│   │   └── schemas/             # リクエスト/レスポンスのPydanticスキーマ
│   ├── alembic/                 # マイグレーション
│   ├── scripts/
│   │   ├── create_admin.py      # 初回管理者ユーザー作成
│   │   └── seed_data.py         # サンプルデータ投入
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # APIクライアント（fetch wrapper）
│   │   ├── components/
│   │   │   ├── common/          # 汎用UIコンポーネント
│   │   │   ├── layout/          # サイドバー、ヘッダーなど
│   │   │   └── modals/          # レシピ詳細、ER図、管理者モーダル
│   │   ├── hooks/               # TanStack Query フック
│   │   ├── pages/               # ページコンポーネント
│   │   └── types/               # TypeScript型定義
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
└── release/                     # リリース手順
```

## 技術スタック

### バックエンド

| 用途 | ライブラリ | バージョン |
|------|-----------|-----------|
| APIフレームワーク | FastAPI | 0.135.1 |
| ORM | SQLModel | 0.0.38 |
| DBマイグレーション | Alembic | 1.18.4 |
| ASGIサーバー | uvicorn | 0.44.0 |
| JWT | PyJWT | 2.12.1 |
| パスワードハッシュ | pwdlib[argon2] | 0.3.0 |
| フォームデータ | python-multipart | 0.0.20 |

### フロントエンド

| 用途 | ライブラリ | バージョン |
|------|-----------|-----------|
| UIフレームワーク | React | 19.2.5 |
| 言語 | TypeScript | 6.x |
| ビルドツール | Vite | 8.x |
| CSSフレームワーク | @tailwindcss/vite | 4.2.2 |
| アイコン | lucide-react | 0.487.0 |
| データフェッチ・状態管理 | @tanstack/react-query | 5.97.0 |
| ルーティング | react-router | 7.14.0 |
| ER図描画 | mermaid | 11.14.0 |
| SQLエディタ | @uiw/react-codemirror + @codemirror/lang-sql | 4.25.10 / 6.x |
| SQLパース | node-sql-parser | 5.4.0 |
