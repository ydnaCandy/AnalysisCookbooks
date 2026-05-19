"""初回起動時の初期データ投入"""
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import engine
from app.models.user import User


def seed_initial_admin() -> None:
    """ユーザーが1件もない場合に管理者アカウントを作成する"""
    with Session(engine) as session:
        existing = session.exec(select(User)).first()
        if existing:
            return

        admin = User(
            username=settings.initial_admin_username,
            hashed_password=hash_password(settings.initial_admin_password),
            is_admin=True,
        )
        session.add(admin)
        session.commit()
        print(
            f"[seed] 管理者アカウントを作成: username={settings.initial_admin_username}"
        )
