import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.entities import User, Mistake
from backend.app.schemas.schemas import MistakeItem

router = APIRouter(prefix="/mistakes", tags=["mistakes"])

class MistakeCreate(BaseModel):
    topic: str
    mistake_description: str
    correct_concept: str
    code_snippet: Optional[str] = ""
    error_message: Optional[str] = ""

class ReviewMistakeRequest(BaseModel):
    status: str = "Reviewed" # Reviewed, Mastered

@router.get("", response_model=List[MistakeItem])
async def get_mistakes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Mistake)
        .where(Mistake.user_id == current_user.id)
        .order_by(Mistake.created_at.desc())
    )
    items = result.scalars().all()
    return [
        MistakeItem(
            id=m.id,
            topic=m.topic,
            mistake_description=m.mistake_description,
            correct_concept=m.correct_concept,
            code_snippet=m.code_snippet,
            error_message=m.error_message,
            review_status=m.review_status,
            repetition_level=m.repetition_level,
            next_review_at=m.next_review_at,
            created_at=m.created_at
        )
        for m in items
    ]

@router.post("", response_model=MistakeItem)
async def create_mistake(
    payload: MistakeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    m = Mistake(
        user_id=current_user.id,
        topic=payload.topic,
        mistake_description=payload.mistake_description,
        correct_concept=payload.correct_concept,
        code_snippet=payload.code_snippet,
        error_message=payload.error_message,
        review_status="Needs Revision",
        repetition_level=1,
        next_review_at=datetime.datetime.utcnow() + datetime.timedelta(days=1),
        created_at=datetime.datetime.utcnow()
    )
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return MistakeItem(
        id=m.id,
        topic=m.topic,
        mistake_description=m.mistake_description,
        correct_concept=m.correct_concept,
        code_snippet=m.code_snippet,
        error_message=m.error_message,
        review_status=m.review_status,
        repetition_level=m.repetition_level,
        next_review_at=m.next_review_at,
        created_at=m.created_at
    )

@router.post("/{mistake_id}/review", response_model=MistakeItem)
async def review_mistake(
    mistake_id: int,
    payload: ReviewMistakeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Mistake).where(Mistake.id == mistake_id, Mistake.user_id == current_user.id)
    )
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Mistake entry not found")

    m.review_status = payload.status
    if payload.status == "Mastered":
        m.repetition_level += 1
        m.next_review_at = datetime.datetime.utcnow() + datetime.timedelta(days=30)
    else:
        m.repetition_level += 1
        m.next_review_at = datetime.datetime.utcnow() + datetime.timedelta(days=7)

    await db.commit()
    await db.refresh(m)
    return MistakeItem(
        id=m.id,
        topic=m.topic,
        mistake_description=m.mistake_description,
        correct_concept=m.correct_concept,
        code_snippet=m.code_snippet,
        error_message=m.error_message,
        review_status=m.review_status,
        repetition_level=m.repetition_level,
        next_review_at=m.next_review_at,
        created_at=m.created_at
    )
