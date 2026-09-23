from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_optional
from backend.app.models.entities import User, Lesson, Problem, Profile
from backend.app.schemas.schemas import (
    CodeEvaluationRequest, CodeEvaluationResponse,
    HintRequest, HintResponse,
    AITeacherChatRequest, AITeacherChatResponse
)
from backend.app.services.ai_teacher import AITeacherService
from backend.app.services.mastery import update_user_mastery

router = APIRouter(prefix="/teacher", tags=["teacher"])

@router.post("/evaluate", response_model=CodeEvaluationResponse)
async def evaluate_code(
    payload: CodeEvaluationRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    feedback = AITeacherService.evaluate_code(
        code=payload.code,
        concept_key=payload.concept_key,
        challenge_description=payload.challenge_description,
        error_message=payload.error_message,
        stdout=payload.stdout,
        attempt_number=payload.attempt_number
    )
    return CodeEvaluationResponse(**feedback)

@router.post("/hint", response_model=HintResponse)
async def get_hint(
    payload: HintRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    lesson_data = None
    if payload.lesson_id:
        l_res = await db.execute(select(Lesson).where(Lesson.id == payload.lesson_id))
        lesson = l_res.scalar_one_or_none()
        if lesson:
            lesson_data = {
                "hint_1": lesson.hint_1,
                "hint_2": lesson.hint_2,
                "hint_3": lesson.hint_3,
                "hint_4": lesson.hint_4,
                "solution_code": lesson.solution_code
            }
    elif payload.problem_id:
        p_res = await db.execute(select(Problem).where(Problem.id == payload.problem_id))
        problem = p_res.scalar_one_or_none()
        if problem:
            lesson_data = {
                "hint_1": problem.hint_1,
                "hint_2": problem.hint_2,
                "hint_3": problem.hint_3,
                "hint_4": problem.hint_4,
                "solution_code": problem.solution_code
            }

    hint_obj = AITeacherService.get_hint(
        tier=payload.tier,
        concept_key=payload.concept_key,
        current_code=payload.current_code,
        lesson_data=lesson_data
    )

    # Track hint usage in user profile
    if current_user:
        p_res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
        profile = p_res.scalar_one_or_none()
        if profile:
            profile.hints_used_count += 1
            await db.commit()

        # If they revealed full solution, cap mastery for this session
        if hint_obj.get("revealed_solution"):
            await update_user_mastery(
                db, current_user.id, payload.concept_key,
                passed=False, hints_used=5, revealed_solution=True
            )

    return HintResponse(**hint_obj)

@router.post("/chat", response_model=AITeacherChatResponse)
async def chat_teacher(payload: AITeacherChatRequest):
    result = AITeacherService.chat_with_teacher(
        message=payload.message,
        current_code=payload.current_code,
        concept_key=payload.concept_key,
        history=payload.history
    )
    return AITeacherChatResponse(**result)
