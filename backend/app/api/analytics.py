from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_optional
from backend.app.models.entities import User, Profile, UserConceptMastery, Mistake
from backend.app.schemas.schemas import AnalyticsDashboardResponse, MistakeItem

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
async def get_analytics_dashboard(
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    if not current_user:
        # Default placeholder metrics for unauthenticated preview
        return AnalyticsDashboardResponse(
            streak_days=1,
            overall_mastery=0.0,
            total_time_hours=0.0,
            problems_solved=0,
            problems_attempted=0,
            hints_used=0,
            current_level="Absolute Beginner",
            current_stage=0,
            weak_concepts=[],
            strong_concepts=[],
            recent_mistakes=[],
            weekly_growth_summary={
                "python_growth": "0% -> 0%",
                "dsa_growth": "0% -> 0%",
                "problems_solved": 0,
                "strongest_area": "None",
                "needs_attention": "Get started with Stage 0!",
                "recommendation": "Complete your initial diagnostic assessment to generate your personalized learning plan."
            }
        )

    # Fetch profile
    prof_res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = prof_res.scalar_one_or_none()

    # Fetch masteries
    m_res = await db.execute(select(UserConceptMastery).where(UserConceptMastery.user_id == current_user.id))
    masteries = m_res.scalars().all()

    weak = [m.concept_name for m in masteries if m.status in ["Weak", "Needs Practice"]]
    strong = [m.concept_name for m in masteries if m.status == "Strong"]
    avg_mastery = (sum(m.score for m in masteries) / len(masteries)) if masteries else 0.0

    # Fetch recent mistakes
    mist_res = await db.execute(
        select(Mistake)
        .where(Mistake.user_id == current_user.id)
        .order_by(Mistake.created_at.desc())
        .limit(5)
    )
    mistakes = mist_res.scalars().all()
    mistake_items = [
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
        for m in mistakes
    ]

    time_hours = round((profile.total_time_spent_minutes if profile else 0) / 60.0, 1)

    strongest_display = strong[0] if strong else (masteries[0].concept_name if masteries else "Variables")
    needs_attn_display = weak[0] if weak else "None (Keep progressing!)"
    recommendation = (
        f"Spend 2 sessions revising {weak[0]} before tackling Stage {current_user.current_stage + 1}."
        if weak else
        f"You are progressing well in Stage {current_user.current_stage}! Solve 2 more challenge problems today."
    )

    return AnalyticsDashboardResponse(
        streak_days=profile.streak_days if profile else 1,
        overall_mastery=round(avg_mastery, 1),
        total_time_hours=time_hours,
        problems_solved=profile.total_problems_solved if profile else 0,
        problems_attempted=profile.total_problems_attempted if profile else 0,
        hints_used=profile.hints_used_count if profile else 0,
        current_level=current_user.current_level,
        current_stage=current_user.current_stage,
        weak_concepts=weak,
        strong_concepts=strong,
        recent_mistakes=mistake_items,
        weekly_growth_summary={
            "python_growth": f"{max(0, int(avg_mastery - 7))}% -> {int(avg_mastery)}%",
            "dsa_growth": f"{max(0, int(avg_mastery * 0.4))}% -> {min(100, int(avg_mastery * 0.6))}%",
            "problems_solved": profile.total_problems_solved if profile else 0,
            "strongest_area": strongest_display,
            "needs_attention": needs_attn_display,
            "recommendation": recommendation
        }
    )
