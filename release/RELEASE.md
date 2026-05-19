# リリース手順書

## 前提条件

- Docker Engine がインストール済みであること
- Docker Compose プラグイン（v2）がインストール済みであること

Ubuntu へのインストール:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
```

インストール後、一度ログアウト・再ログインしてグループ設定を反映すること。

## フォルダ構成

```
release/
  apps/
    frontend/    <- フロントエンドのビルド出力（frontend/dist/ の中身）
    backend/     <- バックエンドのコード（backend/ の中身）
  backup/        <- pg_dump出力先
  docker-compose.yml
  Dockerfile.backend
  nginx.conf
  .env           <- .env.exampleをコピーして設定（要作成）
  RELEASE.md     <- この手順書
  BACKUP.md      <- バックアップ手順書
```

## 公開ポート一覧

| ポート | サービス | 説明 |
|--------|----------|------|
| 28000  | nginx    | Webアプリ（フロントエンド + APIプロキシ） |
| 8000   | backend  | バックエンドAPI直接アクセス |
| 25432  | postgres | PostgreSQL外部接続用 |

## 初回セットアップ

### 1. フロントエンドをビルドしてapps/frontendに配置

リポジトリルートで実行:

```bash
docker build -f Dockerfile.build --output release/apps/frontend .
```

### 2. バックエンドをapps/backendに配置

```bash
rm -rf release/apps/backend/*
cp -r backend/* release/apps/backend/
```

### 3. releaseフォルダをサーバーに転送

```bash
scp -r release/ user@server-ip:/opt/analysis-cookbooks/
```

### 4. サーバーで環境変数を設定

```bash
cd /opt/analysis-cookbooks
cp .env.example .env
nano .env
```

以下を必ず変更:
- `POSTGRES_PASSWORD`: 任意のパスワードに変更（初期値: `your_password`）
- `SECRET_KEY`: 推測困難なランダム文字列に変更
  ```bash
  # 生成コマンド例
  openssl rand -hex 32
  ```
- `DATABASE_URL`: `POSTGRES_PASSWORD` と合わせること

**初期パスワードについて:**
`.env.example` の `POSTGRES_PASSWORD` は `your_password` というプレースホルダーになっている。
そのままでは危険なため、必ず変更してから起動すること。

### 5. 起動

```bash
docker compose up -d
```

初回起動時にAlembicマイグレーションが自動実行される。

### 6. 動作確認

```bash
# 全サービスの状態確認
docker compose ps

# ログ確認（エラーがないか）
docker compose logs --tail=50

# backendのログのみ確認
docker compose logs -f backend
```

ブラウザで `http://サーバーIP:28000` にアクセスして確認。

---

## アプリの更新

### フロントエンドのみ更新

リポジトリルートで実行:

```bash
docker build -f Dockerfile.build --output release/apps/frontend .
scp -r release/apps/frontend/* user@server-ip:/opt/analysis-cookbooks/apps/frontend/
```

nginxコンテナの再起動は不要（マウントファイルが自動反映される）。

### バックエンドのみ更新

ローカルで実行:

```bash
rm -rf release/apps/backend/*
cp -r backend/* release/apps/backend/
scp -r release/apps/backend/* user@server-ip:/opt/analysis-cookbooks/apps/backend/
```

サーバーで実行:

```bash
cd /opt/analysis-cookbooks
docker compose restart backend
```

コンテナ再起動時にDBマイグレーションが自動実行される。

### 両方を更新

```bash
# サーバーへ転送後
cd /opt/analysis-cookbooks
docker compose restart backend
```

---

## 停止・再起動

```bash
# 全サービス停止（DBデータは保持）
docker compose down

# 全サービス再起動
docker compose restart

# 個別再起動
docker compose restart backend
docker compose restart nginx
```

## DBデータを含めて完全削除（注意）

```bash
docker compose down -v
```

**警告:** `-v` オプションはDBデータが消える。バックアップを取ってから実行すること。

---

## よくあるトラブル

### `docker compose` コマンドが見つからない

Docker Compose v2 がインストールされていない。以下で確認:

```bash
docker compose version
```

v1（`docker-compose`）との混同に注意。本手順書はv2（`docker compose`）を前提とする。

### `permission denied` エラー（Dockerコマンド実行時）

`usermod -aG docker $USER` 後にログアウト・再ログインしていない。
再ログイン後に再実行すること。

### backendコンテナが起動しない

```bash
docker compose logs backend
```

でエラー内容を確認。DB接続エラーの場合は `.env` の `DATABASE_URL` と `POSTGRES_PASSWORD` が一致しているか確認すること。

### フロントエンドビルドが失敗する

```bash
docker build -f Dockerfile.build --output release/apps/frontend .
```

実行ディレクトリがリポジトリルート（`Dockerfile.build` がある場所）であることを確認すること。
