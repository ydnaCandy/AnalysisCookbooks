from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_admin_user
from app.db.session import get_session
from app.models.user import User
from app.models.domain import Domain
from app.schemas.domain import DomainCreate, DomainRead, DomainUpdate

router = APIRouter()


@router.get("", response_model=List[DomainRead])
def list_domains(
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return session.exec(select(Domain).order_by(Domain.name)).all()


@router.post("", response_model=DomainRead, status_code=status.HTTP_201_CREATED)
def create_domain(
    body: DomainCreate,
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
):
    domain = Domain(**body.model_dump())
    session.add(domain)
    session.commit()
    session.refresh(domain)
    return domain


@router.put("/{domain_id}", response_model=DomainRead)
def update_domain(
    domain_id: int,
    body: DomainUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
):
    domain = session.get(Domain, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="ドメインが見つかりません")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(domain, field, value)
    session.add(domain)
    session.commit()
    session.refresh(domain)
    return domain


@router.delete("/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_domain(
    domain_id: int,
    session: Session = Depends(get_session),
    _: User = Depends(get_admin_user),
):
    domain = session.get(Domain, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="ドメインが見つかりません")
    session.delete(domain)
    session.commit()
