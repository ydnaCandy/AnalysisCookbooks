from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.api.deps import get_current_user
from app.db.session import get_session
from app.models.user import User
from app.models.recipe import Recipe
from app.models.comment import RecipeComment
from app.schemas.comment import CommentCreate, CommentRead, CommentUpdate

router = APIRouter()


@router.get("/recipes/{recipe_id}/comments", response_model=List[CommentRead])
def list_comments(
    recipe_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    recipe = session.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="レシピが見つかりません")
    comments = session.exec(
        select(RecipeComment)
        .where(RecipeComment.recipe_id == recipe_id)
        .order_by(RecipeComment.created_at.asc())
        .options(selectinload(RecipeComment.user))
    ).all()
    return comments


@router.post(
    "/recipes/{recipe_id}/comments",
    response_model=CommentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    recipe_id: int,
    body: CommentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    recipe = session.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="レシピが見つかりません")
    comment = RecipeComment(
        recipe_id=recipe_id,
        user_id=current_user.id,
        content=body.content,
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment


@router.put("/comments/{comment_id}", response_model=CommentRead)
def update_comment(
    comment_id: int,
    body: CommentUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    comment = session.get(RecipeComment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="コメントが見つかりません")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="編集できるのは投稿者本人のみです")
    comment.content = body.content
    comment.updated_at = datetime.utcnow()
    session.add(comment)
    session.commit()
    comment = session.exec(
        select(RecipeComment)
        .where(RecipeComment.id == comment_id)
        .options(selectinload(RecipeComment.user))
    ).first()
    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    comment = session.get(RecipeComment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="コメントが見つかりません")
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="削除権限がありません")
    session.delete(comment)
    session.commit()
