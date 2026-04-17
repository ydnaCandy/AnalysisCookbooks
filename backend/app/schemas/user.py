from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel


class UserCreate(SQLModel):
    username: str
    password: str
    is_admin: bool = False


class UserRead(SQLModel):
    id: int
    username: str
    is_admin: bool
    is_active: bool
    created_at: datetime


class UserUpdate(SQLModel):
    username: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None


class PasswordResetRequest(SQLModel):
    new_password: str
