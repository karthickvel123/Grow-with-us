from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user
from backend.app.models.entities import User
from backend.app.schemas.schemas import AssessmentResult, DiagnosticSubmission

router = APIRouter(prefix="/assessment", tags=["assessment"])

DIAGNOSTIC_QUESTIONS = [
    {
        "id": 1,
        "question": "Have you ever written code in any programming language before?",
        "options": [
            "No, I am completely new to programming",
            "A little bit (HTML, spreadsheets, or watched tutorials)",
            "Yes, I know basic syntax in another language (Java, C++, JS)",
            "Yes, I am experienced and want to specialize in Python & DSA"
        ],
        "difficulty": "General",
        "concept": "Prior Experience"
    },
    {
        "id": 2,
        "question": "What is a variable in Python?",
        "options": [
            "A permanent hardware chip inside the CPU",
            "A labeled name in memory that stores a data value",
            "A mathematical function that can never be modified",
            "A comment used to explain code to other humans"
        ],
        "correct": "A labeled name in memory that stores a data value",
        "difficulty": "Beginner",
        "concept": "Variables"
    },
    {
        "id": 3,
        "question": "What will `print(type(4.5))` output in Python?",
        "options": [
            "<class 'int'>",
            "<class 'float'>",
            "<class 'str'>",
            "<class 'decimal'>"
        ],
        "correct": "<class 'float'>",
        "difficulty": "Beginner",
        "concept": "Data Types"
    },
    {
        "id": 4,
        "question": "What sequence of numbers does `range(1, 4)` produce?",
        "options": [
            "[1, 2, 3, 4]",
            "[1, 2, 3]",
            "[0, 1, 2, 3]",
            "[2, 3, 4]"
        ],
        "correct": "[1, 2, 3]",
        "difficulty": "Elementary",
        "concept": "Loops & Sequences"
    },
    {
        "id": 5,
        "question": "What is the average time complexity of looking up a key in a Python dictionary?",
        "options": [
            "O(N)",
            "O(log N)",
            "O(1)",
            "O(N^2)"
        ],
        "correct": "O(1)",
        "difficulty": "Intermediate",
        "concept": "Hash Tables & Big-O"
    }
]

@router.get("/questions")
async def get_assessment_questions():
    return {
        "questions": DIAGNOSTIC_QUESTIONS,
        "coding_tasks": [
            {
                "key": "task_add",
                "title": "Mini Coding Task 1: Add Two Numbers",
                "instructions": "Write a function `def add(a, b):` that returns the sum of a and b.",
                "starter_code": "def add(a, b):\n    # Return a + b\n    pass\n"
            },
            {
                "key": "task_even",
                "title": "Mini Coding Task 2: Check Even",
                "instructions": "Write a function `def is_even(n):` that returns True if n is even, else False.",
                "starter_code": "def is_even(n):\n    # Return True if even, else False\n    pass\n"
            }
        ]
    }

@router.post("/submit", response_model=AssessmentResult)
async def submit_assessment(
    submission: DiagnosticSubmission,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    score_points = 0
    total_points = 5

    # Check question 2
    if submission.answers.get(2) == "A labeled name in memory that stores a data value":
        score_points += 1
    # Check question 3
    if submission.answers.get(3) == "<class 'float'>":
        score_points += 1
    # Check question 4
    if submission.answers.get(4) == "[1, 2, 3]":
        score_points += 1
    # Check question 5
    if submission.answers.get(5) == "O(1)":
        score_points += 1

    # Check coding task 1
    code_add = submission.code_solutions.get("task_add", "")
    if "return a + b" in code_add or "return a+b" in code_add:
        score_points += 1

    percentage = (score_points / total_points) * 100

    # Determine level and starting stage
    has_exp = not submission.has_programmed_before
    if percentage <= 20 or has_exp:
        assessed_level = "Absolute Beginner"
        recommended_stage = 0
        roadmap = "Start at Stage 0 (Programming Foundations). We will build your instincts from print(), variables, and data types with step-by-step analogies."
        strengths = ["Eager to learn", "Clean slate for best coding practices"]
        gaps = ["Python syntax", "Memory variables", "Control flow"]
    elif percentage <= 40:
        assessed_level = "Beginner"
        recommended_stage = 0
        roadmap = "Start at Stage 0 to solidify variables & type conversions, then advance smoothly into Stage 1 conditionals and loops."
        strengths = ["Understands fundamental concepts", "Recognizes basic data types"]
        gaps = ["Writing multi-line logic", "Functions and scope"]
    elif percentage <= 60:
        assessed_level = "Elementary"
        recommended_stage = 1
        roadmap = "Start at Stage 1 (Python Fundamentals). You understand basic syntax; now let's master lists, loops, dictionaries, and functions."
        strengths = ["Good grasp of primitive types and basic logic", "Can write simple expressions"]
        gaps = ["Dictionary hashing", "Loop edge cases", "Scope"]
    elif percentage <= 80:
        assessed_level = "Intermediate"
        recommended_stage = 2
        roadmap = "Start at Stage 2 (Intermediate Python & OOP). You are ready for list comprehensions, OOP design patterns, and Big-O complexity."
        strengths = ["Solid Python fundamentals", "Comfortable with loops and functions"]
        gaps = ["Algorithmic complexity", "Two pointers and recursion"]
    else:
        assessed_level = "Advanced"
        recommended_stage = 4
        roadmap = "Accelerate directly to Stage 4 (Data Structures & Algorithmic Patterns). Focus on FAANG-level problem solving, Big-O trade-offs, and mock interviews."
        strengths = ["Strong programming foundations", "Understands algorithmic complexity"]
        gaps = ["Advanced DP and Graph algorithms", "Interview communication pressure"]

    current_user.current_level = assessed_level
    current_user.current_stage = recommended_stage
    await db.commit()

    return AssessmentResult(
        assessed_level=assessed_level,
        recommended_stage=recommended_stage,
        score_percentage=percentage,
        strengths=strengths,
        gaps=gaps,
        personalized_roadmap_summary=roadmap
    )
