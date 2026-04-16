from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel
from app.schemas.user import UserRead


class CommentCreate(SQLModel):
    content: str


class CommentUpdate(SQLModel):
    content: str


class CommentRead(SQLModel):
    id: int
    recipe_id: int
    user_id: int
    content: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserRead]
