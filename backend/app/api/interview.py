import json
import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.entities import User, InterviewSession
from backend.app.schemas.schemas import (
    InterviewStartRequest, InterviewMessageRequest,
    InterviewTurnResponse, InterviewEvaluationReport
)
from backend.app.services.ai_teacher import AITeacherService

router = APIRouter(prefix="/interview", tags=["interview"])

FIRST_QUESTIONS = {
    "Virtual Video Mock Interview": "Hello and welcome to your Virtual Technical Screen! I'm your technical interviewer today. Before we dive into the core coding and system challenges, please introduce yourself, tell me about your software background, and highlight a technical project you are proud of.",
    "Python Interview": "Welcome to your Python Technical Round! Let's start with a core architectural concept: Can you explain the difference between a mutable and an immutable object in Python, and what happens when you pass a list to a function?",
    "DSA Interview": "Welcome to your Data Structures & Algorithms round. Today we're looking at optimizing search and lookup. Given an unsorted array of integers, how would you find two numbers that sum up to a specific target in O(N) time? Walk me through your thought process before writing any code.",
    "Technical Interview": "Hello! In this technical round, we want to assess your problem breakdown skills. Suppose we need to design a service that deduplicates millions of streaming URL events in real-time. What data structures and trade-offs would you consider?",
    "HR/Behavioral Interview": "Welcome! Tell me about a challenging technical project you worked on where something went wrong or requirements suddenly shifted. Using the STAR framework, walk me through what happened.",
    "Mock Interview": "Hi, thanks for joining today's comprehensive technical screen. Let's start by discussing how Python handles memory management and the Global Interpreter Lock (GIL). What are the practical implications for CPU-bound tasks?",
    "Daily Topic Interview": "Welcome to your Daily Topic Interview! Let's test your deep conceptual retention on what you studied today."
}

TOPIC_QUESTIONS = {
    "dictionaries": "Welcome to your Daily Exit Interview on Dictionaries! You learned and coded dictionaries today. Can you explain why dictionary lookups are average O(1) compared to O(N) in a list, and what happens behind the scenes if you access a key that does not exist?",
    "variables": "Welcome to your Daily Exit Interview on Variables & Memory! What is the difference between an integer and string in memory, and why does Python raise a TypeError if you try to concatenate them with '+' without converting?",
    "conditionals": "Welcome to your Daily Exit Interview on Conditionals! How does Python's if/elif/else branching execute, and what is the critical difference between the '==' operator and the 'is' operator?",
    "loops": "Welcome to your Daily Exit Interview on Loops! Can you explain the difference between a for loop with range() versus a while loop, and how you ensure you avoid an infinite loop in production?",
    "functions": "Welcome to your Daily Exit Interview on Functions & Scope! Explain the difference between 'print()' and 'return' inside a function, and what happens to local variables after the function finishes running?",
    "strings_lists": "Welcome to your Daily Exit Interview on Strings & Lists! Why is indexing in Python 0-based, and what is the time complexity of slicing or appending to a list?",
    "list_comprehensions": "Welcome to your Daily Exit Interview on List Comprehensions! What are the performance and readability benefits of a list comprehension over a standard for loop, and how do you filter elements?",
    "oop": "Welcome to your Daily Exit Interview on Object-Oriented Programming! Explain the difference between a Class and an Object instance using an analogy, and what role 'self' plays inside method definitions?",
    "big_o": "Welcome to your Daily Exit Interview on Big-O Complexity! Why do tech companies like Google care so much about Big-O notation, and how does O(N) differ from O(N^2) as the input scales to a million records?",
    "hash_tables": "Welcome to your Daily Exit Interview on Hash Tables! Walk me through how the Two Sum problem can be solved in O(N) time using a hash map instead of the naive O(N^2) double loop.",
    "binary_search": "Welcome to your Daily Exit Interview on Binary Search! What is the strict prerequisite before you can apply binary search, and why does halving the search space achieve O(log N) runtime?",
    "two_pointers": "Welcome to your Daily Exit Interview on Two Pointers! Under what conditions should an engineer reach for the Two Pointers technique over brute-force searching?"
}

@router.post("/start")
async def start_interview(
    payload: InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if payload.topic and payload.topic in TOPIC_QUESTIONS:
        first_q = TOPIC_QUESTIONS[payload.topic]
        track_name = f"Daily Topic: {payload.topic.replace('_', ' ').title()}"
    elif payload.topic:
        first_q = f"Welcome to your Daily Exit Interview on {payload.topic.replace('_', ' ').title()}! You coded this topic today. Explain in your own words the core mechanism and what trade-offs you considered."
        track_name = f"Daily Topic: {payload.topic.replace('_', ' ').title()}"
    else:
        first_q = FIRST_QUESTIONS.get(payload.track, FIRST_QUESTIONS["Python Interview"])
        track_name = payload.track
    initial_messages = [
        {
            "sender": "interviewer",
            "text": first_q,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    ]

    session = InterviewSession(
        user_id=current_user.id,
        track=track_name,
        company_target=payload.company_target,
        status="in_progress",
        messages_json=json.dumps(initial_messages),
        score=0.0
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return {
        "session_id": session.id,
        "track": session.track,
        "topic": payload.topic,
        "company_target": session.company_target,
        "first_question": first_q,
        "messages": initial_messages
    }

@router.post("/turn", response_model=InterviewTurnResponse)
async def interview_turn(
    payload: InterviewMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == payload.session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    try:
        messages = json.loads(session.messages_json)
    except Exception:
        messages = []

    # Record candidate message
    candidate_msg = {
        "sender": "candidate",
        "text": payload.user_response,
        "code": payload.code_snippet,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    messages.append(candidate_msg)

    # Generate interviewer response
    interviewer_turn = AITeacherService.interview_turn(
        track=session.track,
        company_target=session.company_target,
        messages=messages,
        user_response=payload.user_response,
        code_snippet=payload.code_snippet
    )

    interviewer_text = interviewer_turn.get("interviewer_reply", "")
    follow_up = interviewer_turn.get("follow_up_question")
    if follow_up:
        interviewer_text += f"\n\n**Follow-up Question:** {follow_up}"

    interviewer_msg = {
        "sender": "interviewer",
        "text": interviewer_text,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
    messages.append(interviewer_msg)

    session.messages_json = json.dumps(messages)
    if interviewer_turn.get("is_finished", False):
        session.status = "completed"

    await db.commit()

    return InterviewTurnResponse(
        session_id=session.id,
        interviewer_reply=interviewer_text,
        follow_up_question=follow_up,
        is_finished=interviewer_turn.get("is_finished", False),
        turn_index=interviewer_turn.get("turn_index", 1)
    )

@router.post("/{session_id}/evaluate", response_model=InterviewEvaluationReport)
async def evaluate_interview(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    try:
        messages = json.loads(session.messages_json)
    except Exception:
        messages = []

    report_dict = AITeacherService.evaluate_interview(
        track=session.track,
        company_target=session.company_target,
        messages=messages
    )

    session.status = "completed"
    session.score = report_dict.get("overall_score", 80.0)
    session.evaluation_json = json.dumps(report_dict)
    await db.commit()

    return InterviewEvaluationReport(
        session_id=session.id,
        track=session.track,
        overall_score=report_dict.get("overall_score", 85.0),
        technical_accuracy=report_dict.get("technical_accuracy", 85.0),
        problem_solving=report_dict.get("problem_solving", 82.0),
        communication=report_dict.get("communication", 88.0),
        code_quality=report_dict.get("code_quality", 84.0),
        body_language_score=report_dict.get("body_language_score", 91.0),
        eye_contact_score=report_dict.get("eye_contact_score", 93.0),
        posture_score=report_dict.get("posture_score", 90.0),
        strengths=report_dict.get("strengths", [
            "Strong composure and clear vocal projection during technical explanation",
            "Maintained consistent eye contact while defending algorithm trade-offs",
            "Structured problem decomposition using the STAR framework"
        ]),
        improvements=report_dict.get("improvements", [
            "Keep hands still when transitioning between conceptual ideas",
            "State time and space complexity explicitly before writing code"
        ]),
        company_fit_verdict=report_dict.get("company_fit_verdict", "Strong Hire"),
        detailed_feedback=report_dict.get("detailed_feedback", "Demonstrated solid technical depth, calm executive presence, and natural verbal communication under pressure.")
    )

@router.get("/{session_id}")
async def get_interview(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    return {
        "id": session.id,
        "track": session.track,
        "company_target": session.company_target,
        "status": session.status,
        "score": session.score,
        "messages": json.loads(session.messages_json) if session.messages_json else [],
        "evaluation": json.loads(session.evaluation_json) if session.evaluation_json else {}
    }
