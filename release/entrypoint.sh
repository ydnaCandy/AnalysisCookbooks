#!/bin/bash
set -e

cd /app

# 依存関係のインストール
uv sync --no-dev

# DBマイグレーション
alembic upgrade head

# アプリ起動
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
