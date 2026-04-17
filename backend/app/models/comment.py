from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.recipe import Recipe
    from app.models.user import User


class RecipeComment(SQLModel, table=True):
    __tablename__ = "recipe_comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    recipe_id: int = Field(foreign_key="recipes.id")
    user_id: int = Field(foreign_key="users.id")
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    recipe: Optional["Recipe"] = Relationship(back_populates="comments")
    user: Optional["User"] = Relationship(back_populates="comments")
