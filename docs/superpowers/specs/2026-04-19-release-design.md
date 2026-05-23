# Ubuntuサーバー向けDocker Composeリリース構成 設計書

## 概要

社内Ubuntuサーバー上でDocker Composeを使用してアプリをデプロイするためのリリース構成。
フロントエンド（React）・バックエンド（FastAPI）・DB（PostgreSQL）の3サービス構成。

## アーキテクチャ

```
[ブラウザ] :28000（Web UI）
     |
  [nginx] ポート80（ホスト28000にマッピング）
     |-- / --> apps/frontend/ の静的ファイルを配信
     |-- /api/ --> [backend:8000] へプロキシ
                        |
                   [db:5432] PostgreSQL 16

[外部ツール] :28080 --> [backend:8000]（直接アクセス用）
[外部ツール] :25432 --> [db:5432]（DB直接接続用）
```

## フォルダ構成

```
release/
  apps/
    frontend/        ← frontend/dist/ の中身を手動コピー
    backend/         ← backend/ の中身を手動コピー
  backup/            ← pg_dump出力先（ホストマウント）
  docker-compose.yml
  Dockerfile.backend
  nginx.conf
  .env.example
  entrypoint.sh
  RELEASE.md
  BACKUP.md
```

## サービス定義

### nginx

- イメージ: `nginx:alpine`
- ホストポート: `28000:80`
- マウント:
  - `./apps/frontend:/usr/share/nginx/html:ro` — 静的ファイル配信
  - `./nginx.conf:/etc/nginx/conf.d/default.conf:ro` — nginx設定
- 依存: `backend`

### backend

- ビルド: `Dockerfile.backend`（`python:3.12-slim` + uv）
- マウント: `./apps/backend:/app`
- ホストポート: `28080:8000`（外部からFastAPIに直接アクセス可能）
- 起動フロー（entrypoint.sh）:
  1. `uv sync --no-dev` — 依存関係インストール
  2. `uv run alembic upgrade head` — DBマイグレーション自動実行
  3. 初期管理者ユーザー自動作成（後述）
  4. `uvicorn app.main:app --host 0.0.0.0 --port 8000` — アプリ起動
- 依存: `db`（ヘルスチェック通過後）

### db

- イメージ: `postgres:16`
- ホストポート: `25432:5432`（外部ツールからPostgreSQLに直接接続可能）
- マウント:
  - `postgres-data` ボリューム — データ永続化
  - `./backup:/backup` — バックアップ出力先
- 環境変数: `.env`から注入

## 環境変数

`.env`ファイル（`.env.example`をコピーして設定）:

| 変数名 | 説明 | 初期値 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL接続URL | — |
| `SECRET_KEY` | JWTトークン署名キー | 必ず変更（`openssl rand -hex 32`で生成） |
| `POSTGRES_USER` | PostgreSQLユーザー名 | — |
| `POSTGRES_PASSWORD` | PostgreSQLパスワード | 必ず変更 |
| `POSTGRES_DB` | データベース名 | `analysis_cookbooks` |
| `INITIAL_ADMIN_USERNAME` | 初期管理者ユーザー名 | `admin` |
| `INITIAL_ADMIN_PASSWORD` | 初期管理者パスワード | `changeme`（初回ログイン後に変更推奨） |

## 手順書

- **RELEASE.md** — 初回セットアップ・アプリ更新・停止/再起動手順
- **BACKUP.md** — pg_dumpによるバックアップ・pg_restoreによるリストア手順

## 初期管理者ユーザーの自動作成

初回起動時、`entrypoint.sh`がAlembicマイグレーション後に管理者ユーザーを自動作成する。
同名ユーザーが既に存在する場合はスキップ（冪等）。

- デフォルト: ユーザー名 `admin` / パスワード `changeme`
- 環境変数 `INITIAL_ADMIN_USERNAME` / `INITIAL_ADMIN_PASSWORD` でオーバーライド可能
- 初回ログイン後にパスワードを変更することを推奨

## フロントエンドAPIクライアント

- `frontend/src/api/client.ts` の `BASE_URL` は `/api`（相対パス）
- 本番環境: nginxが `/api/` をバックエンドにプロキシするため自動的に解決
- 開発環境: `frontend/vite.config.ts` に `/api` → `http://localhost:8000` のプロキシ設定が必要
  （`vite.config.ts`の`server.proxy`に設定済み）

## 制約・注意事項

- SSLなし（社内利用のため）
- フロント・バックのコードはホストマウント（Dockerイメージ再ビルド不要で更新可能）
- バックエンド更新時はコンテナ再起動が必要（マイグレーションも自動実行される）
- フロントエンド更新時はコンテナ再起動不要（マウントファイルが自動反映）
- `backend/pyproject.toml` のdev依存はPEP 735形式（`[dependency-groups] dev`）を使用
- バックエンド外部ポート28080・PostgreSQL外部ポート25432はデバッグ用途（本番運用では必要に応じてファイアウォール設定を検討）
