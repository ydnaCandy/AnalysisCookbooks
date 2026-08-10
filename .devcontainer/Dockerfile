FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 基本パッケージのインストール
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    sudo \
    ca-certificates \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Node.js (LTS) のインストール
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Python 3.12 のインストール
RUN apt-get update && apt-get install -y \
    python3.12 \
    python3.12-dev \
    python3.12-venv \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3.12 /usr/bin/python3 \
    && ln -sf /usr/bin/python3.12 /usr/bin/python

# uv のインストール（全ユーザーから使えるようにシステムワイドに配置）
RUN curl -LsSf https://astral.sh/uv/install.sh | UV_INSTALL_DIR=/usr/local/bin sh

# Claude Code のインストール（公式推奨方法）
RUN npm install -g @anthropic-ai/claude-code

# 非rootユーザーの作成
# uvキャッシュディレクトリを事前作成して所有権を設定（ボリュームマウント時のPermission denied対策）
RUN useradd -m -s /bin/bash vscode \
    && echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && mkdir -p /home/vscode/.cache/uv \
    && chown -R vscode:vscode /home/vscode/.cache

# Playwright CLI のインストール（Chromiumのみ）
RUN npm install -g playwright \
    && npx playwright install-deps chromium

WORKDIR /workspace
RUN chown -R vscode:vscode /workspace

# vscodeユーザーでPlaywrightブラウザをインストール
USER vscode
RUN npx playwright install chromium