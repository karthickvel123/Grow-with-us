import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_optional
from backend.app.models.entities import User, Lesson, Problem, Submission, Profile
from backend.app.schemas.schemas import CodeExecutionRequest, CodeExecutionResponse, TestCaseResult
from backend.app.services.sandbox import execute_student_code
from backend.app.services.mastery import update_user_mastery, record_student_mistake

router = APIRouter(prefix="/execution", tags=["execution"])

@router.post("/run", response_model=CodeExecutionResponse)
async def run_code(
    payload: CodeExecutionRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    test_cases = payload.test_cases or []
    concept_key = "General"

    # If lesson_id provided, fetch test cases from lesson if not passed
    if payload.lesson_id and not test_cases:
        l_res = await db.execute(select(Lesson).where(Lesson.id == payload.lesson_id))
        lesson = l_res.scalar_one_or_none()
        if lesson:
            concept_key = lesson.concept_key
            if payload.is_mastery_check and lesson.mastery_check_tests_json:
                try:
                    test_cases = json.loads(lesson.mastery_check_tests_json)
                except Exception:
                    test_cases = []
            elif lesson.test_cases_json:
                try:
                    test_cases = json.loads(lesson.test_cases_json)
                except Exception:
                    test_cases = []

    # If problem_id provided, fetch test cases from problem
    if payload.problem_id and not test_cases:
        p_res = await db.execute(select(Problem).where(Problem.id == payload.problem_id))
        problem = p_res.scalar_one_or_none()
        if problem and problem.test_cases_json:
            concept_key = problem.category
            try:
                test_cases = json.loads(problem.test_cases_json)
            except Exception:
                test_cases = []

    # Execute sandbox
    result = execute_student_code(payload.code, test_cases)

    # Format test results
    test_results_out = [
        TestCaseResult(
            test_index=tr.get("test_index", i + 1),
            input=str(tr.get("input", "")),
            expected=str(tr.get("expected", "")),
            actual=str(tr.get("actual", "")),
            passed=tr.get("passed", False),
            is_hidden=tr.get("is_hidden", False)
        )
        for i, tr in enumerate(result.get("test_results", []))
    ]

    all_passed = result.get("all_passed", False)
    status_str = result.get("status", "error")

    # If user is authenticated, update statistics, mastery, and mistakes
    if current_user:
        # Update profile problem count
        p_res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
        profile = p_res.scalar_one_or_none()
        if profile:
            profile.total_problems_attempted += 1
            if all_passed:
                profile.total_problems_solved += 1

        # Record submission
        submission = Submission(
            user_id=current_user.id,
            problem_id=payload.problem_id,
            lesson_id=payload.lesson_id,
            code=payload.code,
            status=status_str,
            passed_tests=result.get("passed_count", 0),
            total_tests=result.get("total_count", 0),
            execution_time_ms=result.get("execution_time_ms", 0.0),
            output=result.get("stdout", ""),
            error_message=result.get("stderr", "")
        )
        db.add(submission)

        # If passed, update concept mastery score
        if all_passed:
            await update_user_mastery(db, current_user.id, concept_key, passed=True)
        else:
            # Failure / error: update mastery down & auto-log mistake in Mistake Notebook
            await update_user_mastery(db, current_user.id, concept_key, passed=False)
            err_msg = result.get("error_message") or result.get("stderr") or "Output did not match expected test case."
            await record_student_mistake(
                db=db,
                user_id=current_user.id,
                topic=concept_key,
                mistake_description=f"Failed test cases on {concept_key}. {err_msg[:120]}",
                correct_concept=f"Verify logic for {concept_key} edge cases and correct return format.",
                code_snippet=payload.code[:400],
                error_message=err_msg[:250]
            )

        await db.commit()

    return CodeExecutionResponse(
        status=status_str,
        stdout=result.get("stdout", ""),
        stderr=result.get("stderr", ""),
        execution_time_ms=result.get("execution_time_ms", 0.0),
        all_passed=all_passed,
        passed_count=result.get("passed_count", 0),
        total_count=result.get("total_count", 0),
        test_results=test_results_out,
        error_type=result.get("error_type"),
        error_message=result.get("error_message")
    )
