import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Learner")
    role = Column(String(50), default="student")
    current_level = Column(String(50), default="Absolute Beginner")  # Absolute Beginner, Beginner, Elementary, Intermediate, Advanced
    current_stage = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    masteries = relationship("UserConceptMastery", back_populates="user", cascade="all, delete-orphan")
    mistakes = relationship("Mistake", back_populates="user", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")
    revisions = relationship("RevisionSchedule", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(String(500), default="")
    target_company = Column(String(100), default="Google")  # Google, Amazon, Microsoft, General
    streak_days = Column(Integer, default=1)
    last_active_date = Column(DateTime, default=datetime.datetime.utcnow)
    total_time_spent_minutes = Column(Integer, default=0)
    total_problems_solved = Column(Integer, default=0)
    total_problems_attempted = Column(Integer, default=0)
    hints_used_count = Column(Integer, default=0)

    user = relationship("User", back_populates="profile")

class CourseStage(Base):
    __tablename__ = "course_stages"

    id = Column(Integer, primary_key=True, index=True)
    stage_number = Column(Integer, unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    badge_name = Column(String(100), default="")

    modules = relationship("Module", back_populates="stage", cascade="all, delete-orphan")

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("course_stages.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    order_index = Column(Integer, default=0)

    stage = relationship("CourseStage", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String(255), nullable=False)
    concept_key = Column(String(100), index=True, default="general")
    concept_explanation = Column(Text, nullable=False)
    real_world_analogy = Column(Text, nullable=False)
    code_example = Column(Text, nullable=False)
    interactive_question = Column(Text, default="")
    interactive_options_json = Column(Text, default="[]")
    interactive_answer = Column(String(255), default="")
    coding_challenge = Column(Text, nullable=False)
    starter_code = Column(Text, default="")
    solution_code = Column(Text, nullable=False)
    test_cases_json = Column(Text, default="[]")
    
    # Hints progression
    hint_1 = Column(Text, default="")
    hint_2 = Column(Text, default="")
    hint_3 = Column(Text, default="")
    hint_4 = Column(Text, default="")
    
    mastery_check_prompt = Column(Text, default="")
    mastery_check_starter = Column(Text, default="")
    mastery_check_solution = Column(Text, default="")
    mastery_check_tests_json = Column(Text, default="[]")
    
    order_index = Column(Integer, default=0)

    module = relationship("Module", back_populates="lessons")

class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    stage_number = Column(Integer, default=0)
    category = Column(String(100), default="Python")
    description = Column(Text, default="")

class UserConceptMastery(Base):
    __tablename__ = "user_concept_mastery"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_name = Column(String(100), index=True, nullable=False)
    score = Column(Float, default=0.0)  # 0 to 100
    status = Column(String(50), default="Not Learned")  # Strong, Good, Needs Practice, Weak, Not Learned
    attempts_count = Column(Integer, default=0)
    successful_attempts = Column(Integer, default=0)
    last_practiced = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="masteries")

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    difficulty = Column(String(50), default="Beginner")  # Beginner, Easy, Medium, Hard, Interview
    category = Column(String(100), default="Foundations")
    stage_number = Column(Integer, default=0)
    description = Column(Text, nullable=False)
    starter_code = Column(Text, default="")
    solution_code = Column(Text, nullable=False)
    test_cases_json = Column(Text, default="[]")  # list of {"input": str, "expected": str, "hidden": bool}
    
    hint_1 = Column(Text, default="")
    hint_2 = Column(Text, default="")
    hint_3 = Column(Text, default="")
    hint_4 = Column(Text, default="")
    
    company_tags = Column(String(255), default="")  # e.g., "Google,Amazon,Microsoft"

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    code = Column(Text, nullable=False)
    status = Column(String(50), default="Passed")  # Passed, Failed, Error, Timeout
    passed_tests = Column(Integer, default=0)
    total_tests = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    output = Column(Text, default="")
    error_message = Column(Text, default="")
    hints_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="submissions")

class Mistake(Base):
    __tablename__ = "mistakes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(100), nullable=False)
    mistake_description = Column(Text, nullable=False)
    correct_concept = Column(Text, nullable=False)
    code_snippet = Column(Text, default="")
    error_message = Column(Text, default="")
    review_status = Column(String(50), default="Needs Revision")  # Needs Revision, Reviewed, Mastered
    repetition_level = Column(Integer, default=1)
    next_review_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="mistakes")

class RevisionSchedule(Base):
    __tablename__ = "revision_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_name = Column(String(100), nullable=False)
    stage_number = Column(Integer, default=0)
    interval_days = Column(Integer, default=1)  # 1, 3, 7, 14, 30
    due_date = Column(DateTime, default=datetime.datetime.utcnow)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="revisions")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_date = Column(DateTime, default=datetime.datetime.utcnow)
    duration_minutes = Column(Integer, default=0)
    plan_json = Column(Text, default="{}")
    completed_steps_json = Column(Text, default="[]")

    user = relationship("User", back_populates="study_sessions")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    track = Column(String(100), default="Python Interview")  # Python, DSA, Technical, HR/Behavioral, Mock
    company_target = Column(String(100), default="General")  # Google, Amazon, Microsoft, General
    status = Column(String(50), default="in_progress")  # in_progress, completed
    messages_json = Column(Text, default="[]")  # List of {sender: 'interviewer'|'candidate', text: str, timestamp: str}
    evaluation_json = Column(Text, default="{}")  # Overall score, strengths, areas for improvement, verdict
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="interviews")
