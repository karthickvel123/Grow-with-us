import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from backend.app.models.entities import User, Profile
from backend.app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserProfileResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        current_level="Absolute Beginner",
        current_stage=0
    )
    db.add(new_user)
    await db.flush()

    new_profile = Profile(
        user_id=new_user.id,
        target_company="Google",
        streak_days=1,
        last_active_date=datetime.datetime.utcnow()
    )
    db.add(new_profile)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token(new_user.id)
    return TokenResponse(
        access_token=token,
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        current_level=new_user.current_level,
        current_stage=new_user.current_stage
    )

@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        current_level=user.current_level,
        current_stage=user.current_stage
    )

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(db: AsyncSession = Depends(get_db)):
    """One-click instant login for testing and evaluation."""
    demo_email = "student@codepath.ai"
    result = await db.execute(select(User).where(User.email == demo_email))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            email=demo_email,
            hashed_password=get_password_hash("codepath123"),
            full_name="Karthick (Student)",
            current_level="Beginner",
            current_stage=0
        )
        db.add(user)
        await db.flush()

        profile = Profile(
            user_id=user.id,
            target_company="Google",
            streak_days=7,
            total_time_spent_minutes=210,
            total_problems_solved=12,
            total_problems_attempted=16
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        current_level=user.current_level,
        current_stage=user.current_stage
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    prof_res = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = prof_res.scalar_one_or_none()
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        current_level=current_user.current_level,
        current_stage=current_user.current_stage,
        target_company=profile.target_company if profile else "Google",
        streak_days=profile.streak_days if profile else 1,
        total_time_spent_minutes=profile.total_time_spent_minutes if profile else 0,
        total_problems_solved=profile.total_problems_solved if profile else 0,
        total_problems_attempted=profile.total_problems_attempted if profile else 0,
        hints_used_count=profile.hints_used_count if profile else 0
    )
