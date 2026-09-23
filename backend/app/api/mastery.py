from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_optional
from backend.app.models.entities import User, Concept, UserConceptMastery
from backend.app.schemas.schemas import ConceptMasteryItem

router = APIRouter(prefix="/mastery", tags=["mastery"])

@router.get("", response_model=List[ConceptMasteryItem])
async def get_concept_mastery(
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # Fetch all concepts
    c_res = await db.execute(select(Concept).order_by(Concept.stage_number.asc(), Concept.id.asc()))
    concepts = c_res.scalars().all()

    user_mastery_map = {}
    if current_user:
        m_res = await db.execute(select(UserConceptMastery).where(UserConceptMastery.user_id == current_user.id))
        masteries = m_res.scalars().all()
        for m in masteries:
            user_mastery_map[m.concept_name] = m

    output = []
    for c in concepts:
        m = user_mastery_map.get(c.name)
        score = m.score if m else 0.0
        status = m.status if m else "Not Learned"
        attempts = m.attempts_count if m else 0
        last_pr = m.last_practiced if m else None

        output.append(ConceptMasteryItem(
            concept_name=c.name,
            display_name=c.display_name,
            category=c.category,
            stage_number=c.stage_number,
            score=round(score, 1),
            status=status,
            attempts_count=attempts,
            last_practiced=last_pr
        ))
    return output

@router.get("/weak-areas")
async def get_weak_areas(
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    if not current_user:
        return {"weak_concepts": [], "recommendation": "Login to view personalized weak area alerts."}

    m_res = await db.execute(
        select(UserConceptMastery)
        .where(
            UserConceptMastery.user_id == current_user.id,
            UserConceptMastery.status.in_(["Weak", "Needs Practice"])
        )
        .order_by(UserConceptMastery.score.asc())
    )
    items = m_res.scalars().all()
    names = [i.concept_name for i in items]

    if names:
        rec = f"You are currently struggling with {names[0]}. Before continuing to advanced stages, spend 15 minutes strengthening {names[0]}."
    else:
        rec = "No critical weak areas detected! All practiced concepts are in Good or Strong status."

    return {
        "weak_concepts": names,
        "recommendation": rec
    }
