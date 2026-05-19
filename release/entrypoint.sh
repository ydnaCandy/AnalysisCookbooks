#!/bin/bash
set -e

cd /app

# 依存関係のインストール
uv sync --no-dev

# DBマイグレーション
alembic upgrade head

# 初期データ投入（初回のみ管理者アカウントを作成）
uv run python -c "from app.core.seed import seed_initial_admin; seed_initial_admin()"

# アプリ起動
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
