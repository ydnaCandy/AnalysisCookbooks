from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel


class DomainCreate(SQLModel):
    name: str
    description: Optional[str] = None


class DomainRead(SQLModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime


class DomainUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
