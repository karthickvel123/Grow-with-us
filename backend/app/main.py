from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, AsyncSessionLocal
from backend.app.data.seed_data import seed_database
from backend.app.core.security import get_password_hash
from backend.app.models.entities import User, Profile, UserConceptMastery, Mistake
import datetime

# Import all API routers
from backend.app.api.auth import router as auth_router
from backend.app.api.curriculum import router as curriculum_router
from backend.app.api.assessment import router as assessment_router
from backend.app.api.execution import router as execution_router
from backend.app.api.teacher import router as teacher_router
from backend.app.api.mastery import router as mastery_router
from backend.app.api.mistakes import router as mistakes_router
from backend.app.api.revision import router as revision_router
from backend.app.api.interview import router as interview_router
from backend.app.api.companies import router as companies_router
from backend.app.api.analytics import router as analytics_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create database schema
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Seed curriculum & initial data
    async with AsyncSessionLocal() as session:
        await seed_database(session)

        # Ensure demo user exists with initial sample data
        demo_user = await session.execute(select(User).where(User.email == "student@codepath.ai"))
        if not demo_user.scalar_one_or_none():
            user = User(
                email="student@codepath.ai",
                hashed_password=get_password_hash("codepath123"),
                full_name="Karthick Vel",
                current_level="Beginner",
                current_stage=1
            )
            session.add(user)
            await session.flush()

            profile = Profile(
                user_id=user.id,
                target_company="Google",
                streak_days=7,
                total_time_spent_minutes=240,
                total_problems_solved=14,
                total_problems_attempted=19,
                hints_used_count=4
            )
            session.add(profile)

            # Seed a few realistic masteries
            mastery_samples = [
                ("variables", 95.0, "Strong", 5, 5),
                ("conditionals", 87.0, "Strong", 4, 4),
                ("loops", 64.0, "Needs Practice", 6, 3),
                ("functions", 82.0, "Strong", 5, 4),
                ("strings_lists", 91.0, "Strong", 4, 4),
                ("dictionaries", 38.0, "Weak", 4, 1),
                ("big_o", 45.0, "Needs Practice", 2, 1)
            ]
            for c_name, score, status, att, succ in mastery_samples:
                m = UserConceptMastery(
                    user_id=user.id,
                    concept_name=c_name,
                    score=score,
                    status=status,
                    attempts_count=att,
                    successful_attempts=succ,
                    last_practiced=datetime.datetime.utcnow()
                )
                session.add(m)

            # Seed sample mistake in Mistake Notebook
            mistake = Mistake(
                user_id=user.id,
                topic="dictionaries",
                mistake_description="Used integer index student[0] on dictionary instead of accessing by key student['name'].",
                correct_concept="Dictionaries are hash maps, not index-ordered arrays. Use key names or .get(key) for access.",
                code_snippet="student = {'name': 'Alex', 'grade': 90}\nprint(student[0])  # Raised KeyError",
                error_message="KeyError: 0",
                review_status="Needs Revision",
                repetition_level=1,
                next_review_at=datetime.datetime.utcnow() + datetime.timedelta(days=1)
            )
            session.add(mistake)

            await session.commit()

    yield

    # Clean shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Adaptive AI Programming Teacher: Zero to FAANG in Python & DSA",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(curriculum_router, prefix=settings.API_V1_STR)
app.include_router(assessment_router, prefix=settings.API_V1_STR)
app.include_router(execution_router, prefix=settings.API_V1_STR)
app.include_router(teacher_router, prefix=settings.API_V1_STR)
app.include_router(mastery_router, prefix=settings.API_V1_STR)
app.include_router(mistakes_router, prefix=settings.API_V1_STR)
app.include_router(revision_router, prefix=settings.API_V1_STR)
app.include_router(interview_router, prefix=settings.API_V1_STR)
app.include_router(companies_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "ai_engine": "Gemini 3.8 Flash (Active)" if settings.GEMINI_API_KEY else "Pedagogical Heuristic Engine (Active)"
    }
