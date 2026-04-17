from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session, select

from app.api.deps import get_admin_user
from app.core.security import hash_password
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import PasswordResetRequest, UserCreate, UserRead, UserUpdate

router = APIRouter()


@router.get("/", response_model=List[UserRead])
def list_users(
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
) -> List[User]:
    """全ユーザー一覧をユーザー名順で返す（管理者専用）"""
    return list(session.exec(select(User).order_by(User.username)).all())


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    body: UserCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
) -> User:
    """新規ユーザーを作成する（管理者専用）"""
    existing = session.exec(select(User).where(User.username == body.username)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="そのユーザー名は既に使用されています",
        )
    user = User(
        username=body.username,
        hashed_password=hash_password(body.password),
        is_admin=body.is_admin,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    body: UserUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
) -> User:
    """ユーザー情報を部分更新する（管理者専用）"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません",
        )
    # usernameを変更する場合は重複チェック
    updates = body.model_dump(exclude_unset=True)
    if "username" in updates and updates["username"] != user.username:
        existing = session.exec(
            select(User).where(User.username == updates["username"])
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="そのユーザー名は既に使用されています",
            )
    for field, value in updates.items():
        setattr(user, field, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/{user_id}/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(
    user_id: int,
    body: PasswordResetRequest,
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
) -> Response:
    """ユーザーのパスワードをリセットする（管理者専用）"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ユーザーが見つかりません",
        )
    user.hashed_password = hash_password(body.new_password)
    session.add(user)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
