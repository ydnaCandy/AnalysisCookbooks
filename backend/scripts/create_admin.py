"""
初回管理者ユーザーを作成するスクリプト。
使い方: uv run python scripts/create_admin.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from app.db.session import engine
from app.models.user import User
from app.core.security import hash_password


def create_admin(username: str = "admin", password: str = "admin1234") -> None:
    with Session(engine) as session:
        existing = session.exec(select(User).where(User.username == username)).first()
        if existing:
            print(f"ユーザー '{username}' は既に存在します")
            return
        user = User(
            username=username,
            hashed_password=hash_password(password),
            is_admin=True,
        )
        session.add(user)
        session.commit()
        print(f"管理者ユーザーを作成しました: {username} / {password}")


if __name__ == "__main__":
    create_admin()
