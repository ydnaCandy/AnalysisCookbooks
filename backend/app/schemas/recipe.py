from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel
from app.schemas.domain import DomainRead
from app.schemas.tag import TagRead
from app.schemas.user import UserRead


class RecipeCreate(SQLModel):
    title: str
    description: Optional[str] = None
    sql_text: str
    domain_id: int
    tag_ids: List[int] = []


class RecipeUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sql_text: Optional[str] = None
    domain_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None


class RecipeRead(SQLModel):
    id: int
    title: str
    description: Optional[str]
    sql_text: str
    domain_id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    domain: Optional[DomainRead]
    tags: List[TagRead]
    created_by_user: Optional[UserRead]
