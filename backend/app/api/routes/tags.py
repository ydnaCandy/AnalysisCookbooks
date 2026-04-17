from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_admin_user
from app.db.session import get_session
from app.models.user import User
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagRead, TagUpdate

router = APIRouter()


@router.get("", response_model=List[TagRead])
def list_tags(
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return session.exec(select(Tag).order_by(Tag.name)).all()


@router.post("", response_model=TagRead, status_code=status.HTTP_201_CREATED)
def create_tag(
    body: TagCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
):
    tag = Tag(**body.model_dump())
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


@router.put("/{tag_id}", response_model=TagRead)
def update_tag(
    tag_id: int,
    body: TagUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
):
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="タグが見つかりません")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(tag, field, value)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
):
    tag = session.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="タグが見つかりません")
    session.delete(tag)
    session.commit()
