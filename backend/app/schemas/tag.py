from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


class TagCreate(SQLModel):
    name: str


class TagRead(SQLModel):
    id: int
    name: str
    created_at: datetime


class TagUpdate(SQLModel):
    name: Optional[str] = None
