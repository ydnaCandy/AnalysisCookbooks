from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel
from pydantic import field_validator


class UserCreate(SQLModel):
    username: str
    password: str
    is_admin: bool = False

    @field_validator('username', 'password')
    @classmethod
    def not_blank(cls, v: str, info) -> str:
        if not v or not v.strip():
            raise ValueError(f'{info.field_name}は空白にできません')
        return v


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

    @field_validator('new_password')
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('パスワードは空白にできません')
        return v
