from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select

from app.api.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.models.recipe import Recipe, RecipeTag
from app.models.tag import Tag
from app.schemas.recipe import RecipeCreate, RecipeRead, RecipeUpdate

router = APIRouter()


def _get_recipe_or_404(recipe_id: int, session: Session) -> Recipe:
    recipe = session.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="レシピが見つかりません")
    return recipe


def _sync_tags(recipe: Recipe, tag_ids: List[int], session: Session) -> None:
    """レシピのタグを tag_ids に合わせて更新する"""
    # 既存の recipe_tags を削除
    existing = session.exec(
        select(RecipeTag).where(RecipeTag.recipe_id == recipe.id)
    ).all()
    for rt in existing:
        session.delete(rt)
    # 新しいタグを追加
    for tag_id in tag_ids:
        tag = session.get(Tag, tag_id)
        if not tag:
            raise HTTPException(status_code=400, detail=f"タグID {tag_id} が見つかりません")
        session.add(RecipeTag(recipe_id=recipe.id, tag_id=tag_id))


@router.get("", response_model=List[RecipeRead])
def list_recipes(
    domain_id: Optional[int] = Query(default=None),
    tag_id: Optional[int] = Query(default=None),
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    query = select(Recipe)
    if domain_id:
        query = query.where(Recipe.domain_id == domain_id)
    if tag_id:
        query = query.join(RecipeTag).where(RecipeTag.tag_id == tag_id)
    recipes = session.exec(query.order_by(Recipe.updated_at.desc())).all()
    # Relationships をロード
    for recipe in recipes:
        session.refresh(recipe)
    return recipes


@router.post("", response_model=RecipeRead, status_code=status.HTTP_201_CREATED)
def create_recipe(
    body: RecipeCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    recipe = Recipe(
        title=body.title,
        description=body.description,
        sql_text=body.sql_text,
        domain_id=body.domain_id,
        created_by_id=current_user.id,
    )
    session.add(recipe)
    session.commit()
    session.refresh(recipe)
    _sync_tags(recipe, body.tag_ids, session)
    session.commit()
    session.refresh(recipe)
    return recipe


@router.get("/{recipe_id}", response_model=RecipeRead)
def get_recipe(
    recipe_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    recipe = _get_recipe_or_404(recipe_id, session)
    session.refresh(recipe)
    return recipe


@router.put("/{recipe_id}", response_model=RecipeRead)
def update_recipe(
    recipe_id: int,
    body: RecipeUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    recipe = _get_recipe_or_404(recipe_id, session)
    data = body.model_dump(exclude_unset=True)
    tag_ids = data.pop("tag_ids", None)
    for field, value in data.items():
        setattr(recipe, field, value)
    recipe.updated_at = datetime.utcnow()
    session.add(recipe)
    session.commit()
    if tag_ids is not None:
        _sync_tags(recipe, tag_ids, session)
        session.commit()
    session.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(
    recipe_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    recipe = _get_recipe_or_404(recipe_id, session)
    session.delete(recipe)
    session.commit()
