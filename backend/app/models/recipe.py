from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.domain import Domain
    from app.models.tag import Tag
    from app.models.comment import RecipeComment


class RecipeTag(SQLModel, table=True):
    __tablename__ = "recipe_tags"

    recipe_id: Optional[int] = Field(
        default=None, foreign_key="recipes.id", primary_key=True
    )
    tag_id: Optional[int] = Field(
        default=None, foreign_key="tags.id", primary_key=True
    )


class Recipe(SQLModel, table=True):
    __tablename__ = "recipes"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    description: Optional[str] = None
    sql_text: str
    domain_id: int = Field(foreign_key="domains.id")
    created_by_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    domain: Optional["Domain"] = Relationship(back_populates="recipes")
    created_by_user: Optional["User"] = Relationship(back_populates="recipes")
    tags: List["Tag"] = Relationship(back_populates="recipes", link_model=RecipeTag)
    comments: List["RecipeComment"] = Relationship(back_populates="recipe")
