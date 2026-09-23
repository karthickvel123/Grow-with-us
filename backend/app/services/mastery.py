import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from backend.app.models.entities import UserConceptMastery, Mistake, RevisionSchedule, Profile, User

SPACED_INTERVALS = [1, 3, 7, 14, 30]

def compute_mastery_status(score: float) -> str:
    if score >= 80.0:
        return "Strong"
    elif score >= 65.0:
        return "Good"
    elif score >= 40.0:
        return "Needs Practice"
    elif score > 0.0:
        return "Weak"
    return "Not Learned"

async def update_user_mastery(
    db: AsyncSession,
    user_id: int,
    concept_name: str,
    passed: bool,
    hints_used: int = 0,
    revealed_solution: bool = False
) -> UserConceptMastery:
    """Updates mastery score based on performance and hint usage."""
    result = await db.execute(
        select(UserConceptMastery).where(
            and_(
                UserConceptMastery.user_id == user_id,
                UserConceptMastery.concept_name == concept_name
            )
        )
    )
    mastery = result.scalar_one_or_none()

    if not mastery:
        mastery = UserConceptMastery(
            user_id=user_id,
            concept_name=concept_name,
            score=0.0,
            status="Not Learned",
            attempts_count=0,
            successful_attempts=0,
            last_practiced=datetime.datetime.utcnow()
        )
        db.add(mastery)

    mastery.attempts_count += 1
    mastery.last_practiced = datetime.datetime.utcnow()

    if passed:
        mastery.successful_attempts += 1
        if revealed_solution:
            # If they just revealed the solution, set understanding baseline but don't give full credit
            mastery.score = min(mastery.score + 5.0, 45.0)
        elif hints_used == 0:
            mastery.score = min(mastery.score + 18.0, 100.0)
        elif hints_used <= 2:
            mastery.score = min(mastery.score + 12.0, 100.0)
        else:
            mastery.score = min(mastery.score + 6.0, 100.0)
    else:
        # Failure decreases score slightly and flags for revision
        mastery.score = max(mastery.score - 8.0, 10.0)

    mastery.status = compute_mastery_status(mastery.score)
    await db.commit()
    await db.refresh(mastery)
    return mastery

async def record_student_mistake(
    db: AsyncSession,
    user_id: int,
    topic: str,
    mistake_description: str,
    correct_concept: str,
    code_snippet: str = "",
    error_message: str = ""
) -> Mistake:
    """Logs a mistake into the student's personal Mistake Notebook."""
    mistake = Mistake(
        user_id=user_id,
        topic=topic,
        mistake_description=mistake_description,
        correct_concept=correct_concept,
        code_snippet=code_snippet,
        error_message=error_message,
        review_status="Needs Revision",
        repetition_level=1,
        next_review_at=datetime.datetime.utcnow() + datetime.timedelta(days=1),
        created_at=datetime.datetime.utcnow()
    )
    db.add(mistake)
    
    # Also create or advance a RevisionSchedule item
    rev_result = await db.execute(
        select(RevisionSchedule).where(
            and_(
                RevisionSchedule.user_id == user_id,
                RevisionSchedule.concept_name == topic
            )
        )
    )
    rev = rev_result.scalar_one_or_none()
    if not rev:
        rev = RevisionSchedule(
            user_id=user_id,
            concept_name=topic,
            interval_days=1,
            due_date=datetime.datetime.utcnow() + datetime.timedelta(days=1),
            completed=False
        )
        db.add(rev)
    else:
        # Reset to Day 1 because of mistake
        rev.interval_days = 1
        rev.due_date = datetime.datetime.utcnow() + datetime.timedelta(days=1)
        rev.completed = False

    await db.commit()
    await db.refresh(mistake)
    return mistake

async def advance_spaced_revision(db: AsyncSession, user_id: int, revision_id: int) -> Optional[RevisionSchedule]:
    """Advances spaced repetition interval when student successfully reviews."""
    result = await db.execute(
        select(RevisionSchedule).where(
            and_(
                RevisionSchedule.id == revision_id,
                RevisionSchedule.user_id == user_id
            )
        )
    )
    rev = result.scalar_one_or_none()
    if not rev:
        return None

    # Find next interval
    try:
        curr_idx = SPACED_INTERVALS.index(rev.interval_days)
        next_interval = SPACED_INTERVALS[min(curr_idx + 1, len(SPACED_INTERVALS) - 1)]
    except ValueError:
        next_interval = 3

    rev.interval_days = next_interval
    rev.due_date = datetime.datetime.utcnow() + datetime.timedelta(days=next_interval)
    rev.completed = False
    await db.commit()
    await db.refresh(rev)
    return rev

async def generate_daily_session_plan(db: AsyncSession, user_id: int) -> Dict[str, Any]:
    """Generates an adaptive daily 55-minute learning plan tailored to weak areas."""
    # Find weak concepts
    mastery_res = await db.execute(
        select(UserConceptMastery).where(
            and_(
                UserConceptMastery.user_id == user_id,
                UserConceptMastery.status.in_(["Weak", "Needs Practice"])
            )
        ).order_by(UserConceptMastery.score.asc())
    )
    weak_items = mastery_res.scalars().all()
    weak_concept_names = [w.concept_name for w in weak_items[:3]]

    # Get user level and stage
    user_res = await db.execute(select(User).where(User.id == user_id))
    user = user_res.scalar_one_or_none()
    stage = user.current_stage if user else 0

    weak_focus = weak_concept_names[0] if weak_concept_names else "Python Fundamentals"

    steps = [
        {
            "step_number": 1,
            "title": "Concept Learning",
            "duration_minutes": 10,
            "description": f"Learn core principles of Stage {stage} topics with real-world analogies.",
            "type": "learn",
            "completed": False
        },
        {
            "step_number": 2,
            "title": "Guided Coding",
            "duration_minutes": 15,
            "description": "Interactive coding challenges with step-by-step Socratic feedback.",
            "type": "code",
            "completed": False
        },
        {
            "step_number": 3,
            "title": "Problem Solving",
            "duration_minutes": 15,
            "description": "Dry-run and implement test cases for algorithmic thinking.",
            "type": "problem",
            "completed": False
        },
        {
            "step_number": 4,
            "title": "Weak-Area Revision",
            "duration_minutes": 10,
            "description": f"Targeted practice strengthening: {weak_focus}.",
            "type": "revision",
            "completed": False
        },
        {
            "step_number": 5,
            "title": "Daily Topic Exit Interview",
            "duration_minutes": 10,
            "description": f"Mandatory technical screen on today's concept ({weak_focus}) to test verbal explanation and edge case handling.",
            "type": "interview",
            "completed": False
        }
    ]

    return {
        "date": datetime.date.today().isoformat(),
        "total_minutes": 55,
        "steps": steps,
        "weak_areas_scheduled": weak_concept_names
    }
