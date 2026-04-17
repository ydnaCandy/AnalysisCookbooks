from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

# RecipeTag は recipe.py で定義されているが、
# recipe.py は tag.py を TYPE_CHECKING のみで参照するため循環インポートにならない
from app.models.recipe import RecipeTag

if TYPE_CHECKING:
    from app.models.recipe import Recipe


class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    recipes: List["Recipe"] = Relationship(back_populates="tags", link_model=RecipeTag)
