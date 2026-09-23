import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from backend.app.core.database import get_db
from backend.app.models.entities import CourseStage, Module, Lesson, Problem
from backend.app.schemas.schemas import (
    StageResponse, ModuleResponse, LessonSummary, LessonDetailResponse,
    InteractiveQuestionCheck, InteractiveQuestionResult
)

router = APIRouter(prefix="/curriculum", tags=["curriculum"])

@router.get("/stages", response_model=List[StageResponse])
async def get_stages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CourseStage)
        .options(
            selectinload(CourseStage.modules).selectinload(Module.lessons)
        )
        .order_by(CourseStage.stage_number.asc())
    )
    stages = result.scalars().all()

    response = []
    for stage in stages:
        mods = []
        for m in sorted(stage.modules, key=lambda x: x.order_index):
            less = []
            for l in sorted(m.lessons, key=lambda x: x.order_index):
                less.append(LessonSummary(
                    id=l.id,
                    module_id=l.module_id,
                    title=l.title,
                    concept_key=l.concept_key,
                    order_index=l.order_index
                ))
            mods.append(ModuleResponse(
                id=m.id,
                stage_id=m.stage_id,
                title=m.title,
                description=m.description,
                order_index=m.order_index,
                lessons=less
            ))
        response.append(StageResponse(
            id=stage.id,
            stage_number=stage.stage_number,
            title=stage.title,
            description=stage.description,
            badge_name=stage.badge_name,
            modules=mods
        ))
    return response

@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
async def get_lesson(lesson_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Lesson).options(selectinload(Lesson.module).selectinload(Module.stage)).where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    try:
        options = json.loads(lesson.interactive_options_json)
    except Exception:
        options = []

    try:
        test_cases = json.loads(lesson.test_cases_json)
    except Exception:
        test_cases = []

    stage_num = lesson.module.stage.stage_number if lesson.module and lesson.module.stage else 0

    return LessonDetailResponse(
        id=lesson.id,
        module_id=lesson.module_id,
        stage_number=stage_num,
        title=lesson.title,
        concept_key=lesson.concept_key,
        concept_explanation=lesson.concept_explanation,
        real_world_analogy=lesson.real_world_analogy,
        code_example=lesson.code_example,
        interactive_question=lesson.interactive_question,
        interactive_options=options,
        coding_challenge=lesson.coding_challenge,
        starter_code=lesson.starter_code,
        test_cases=test_cases,
        total_hints=4,
        mastery_check_prompt=lesson.mastery_check_prompt,
        mastery_check_starter=lesson.mastery_check_starter
    )

@router.post("/lessons/interactive-check", response_model=InteractiveQuestionResult)
async def check_interactive_question(check: InteractiveQuestionCheck, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lesson).where(Lesson.id == check.lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    correct = (check.selected_option.strip() == lesson.interactive_answer.strip())
    if correct:
        explanation = f"Correct! {lesson.interactive_answer} is right on the mark."
    else:
        explanation = f"Not quite. Notice how Python evaluates this. Try reviewing the analogy again!"

    return InteractiveQuestionResult(
        correct=correct,
        explanation=explanation
    )

@router.get("/problems")
async def get_problems(difficulty: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    query = select(Problem)
    if difficulty:
        query = query.where(Problem.difficulty == difficulty)
    result = await db.execute(query.order_by(Problem.id.asc()))
    problems = result.scalars().all()
    
    output = []
    for p in problems:
        output.append({
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "difficulty": p.difficulty,
            "category": p.category,
            "stage_number": p.stage_number,
            "company_tags": p.company_tags.split(",") if p.company_tags else [],
            "description": p.description,
            "starter_code": p.starter_code,
            "test_cases": json.loads(p.test_cases_json) if p.test_cases_json else []
        })
    return output

@router.get("/problems/{problem_id}")
async def get_problem(problem_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Problem).where(Problem.id == problem_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")

    return {
        "id": p.id,
        "title": p.title,
        "slug": p.slug,
        "difficulty": p.difficulty,
        "category": p.category,
        "stage_number": p.stage_number,
        "company_tags": p.company_tags.split(",") if p.company_tags else [],
        "description": p.description,
        "starter_code": p.starter_code,
        "solution_code": p.solution_code,
        "test_cases": json.loads(p.test_cases_json) if p.test_cases_json else [],
        "hint_1": p.hint_1,
        "hint_2": p.hint_2,
        "hint_3": p.hint_3,
        "hint_4": p.hint_4
    }
