import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.entities import User, RevisionSchedule
from backend.app.schemas.schemas import RevisionItem, DailySessionPlan
from backend.app.services.mastery import advance_spaced_revision, generate_daily_session_plan

router = APIRouter(prefix="/revision", tags=["revision"])

@router.get("/schedule", response_model=List[RevisionItem])
async def get_revision_schedule(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(RevisionSchedule)
        .where(RevisionSchedule.user_id == current_user.id)
        .order_by(RevisionSchedule.due_date.asc())
    )
    items = result.scalars().all()
    now = datetime.datetime.utcnow()

    return [
        RevisionItem(
            id=r.id,
            concept_name=r.concept_name,
            stage_number=r.stage_number,
            interval_days=r.interval_days,
            due_date=r.due_date,
            is_overdue=(r.due_date <= now)
        )
        for r in items
    ]

@router.post("/{revision_id}/advance", response_model=RevisionItem)
async def advance_revision_item(
    revision_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    rev = await advance_spaced_revision(db, current_user.id, revision_id)
    if not rev:
        raise HTTPException(status_code=404, detail="Revision entry not found")

    now = datetime.datetime.utcnow()
    return RevisionItem(
        id=rev.id,
        concept_name=rev.concept_name,
        stage_number=rev.stage_number,
        interval_days=rev.interval_days,
        due_date=rev.due_date,
        is_overdue=(rev.due_date <= now)
    )

@router.get("/daily-session", response_model=DailySessionPlan)
async def get_daily_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan = await generate_daily_session_plan(db, current_user.id)
    return DailySessionPlan(**plan)
