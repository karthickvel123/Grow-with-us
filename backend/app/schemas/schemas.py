from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth & User ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = "Learner"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    current_level: str
    current_stage: int

class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    current_level: str
    current_stage: int
    target_company: str
    streak_days: int
    total_time_spent_minutes: int
    total_problems_solved: int
    total_problems_attempted: int
    hints_used_count: int

# --- Curriculum & Lessons ---
class LessonSummary(BaseModel):
    id: int
    module_id: int
    title: str
    concept_key: str
    order_index: int
    completed: bool = False

class ModuleResponse(BaseModel):
    id: int
    stage_id: int
    title: str
    description: str
    order_index: int
    lessons: List[LessonSummary]

class StageResponse(BaseModel):
    id: int
    stage_number: int
    title: str
    description: str
    badge_name: str
    modules: List[ModuleResponse]

class LessonDetailResponse(BaseModel):
    id: int
    module_id: int
    stage_number: int
    title: str
    concept_key: str
    concept_explanation: str
    real_world_analogy: str
    code_example: str
    interactive_question: str
    interactive_options: List[str]
    coding_challenge: str
    starter_code: str
    test_cases: List[Dict[str, Any]]
    total_hints: int = 4
    mastery_check_prompt: str
    mastery_check_starter: str

class InteractiveQuestionCheck(BaseModel):
    lesson_id: int
    selected_option: str

class InteractiveQuestionResult(BaseModel):
    correct: bool
    explanation: str

# --- Code Execution Sandbox ---
class CodeExecutionRequest(BaseModel):
    code: str
    test_cases: Optional[List[Dict[str, Any]]] = None
    problem_id: Optional[int] = None
    lesson_id: Optional[int] = None
    is_mastery_check: bool = False

class TestCaseResult(BaseModel):
    test_index: int
    input: str
    expected: str
    actual: str
    passed: bool
    is_hidden: bool = False

class CodeExecutionResponse(BaseModel):
    status: str  # "passed", "failed", "error", "timeout"
    stdout: str
    stderr: str
    execution_time_ms: float
    all_passed: bool
    passed_count: int
    total_count: int
    test_results: List[TestCaseResult]
    error_type: Optional[str] = None
    error_message: Optional[str] = None

# --- AI Teacher & Hint System ---
class CodeEvaluationRequest(BaseModel):
    code: str
    concept_key: str
    challenge_description: str
    error_message: Optional[str] = None
    stdout: Optional[str] = None
    attempt_number: int = 1

class CodeEvaluationResponse(BaseModel):
    is_correct: bool
    what_was_correct: str
    what_was_wrong: str
    why_it_was_wrong: str
    how_to_improve: str
    socratic_hint: str
    detected_misconception: Optional[str] = None

class HintRequest(BaseModel):
    lesson_id: Optional[int] = None
    problem_id: Optional[int] = None
    concept_key: str
    tier: int = Field(..., ge=1, le=5) # 1: Conceptual, 2: Approach, 3: Pseudo-code, 4: Partial code, 5: Full Solution
    current_code: str = ""

class HintResponse(BaseModel):
    tier: int
    tier_name: str # "Conceptual Hint", "Approach Hint", "Pseudo-code Hint", "Partial Code Hint", "Full Solution"
    content: str
    revealed_solution: bool = False

class AITeacherChatRequest(BaseModel):
    message: str
    current_code: Optional[str] = None
    concept_key: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None

class AITeacherChatResponse(BaseModel):
    reply: str
    socratic_question: Optional[str] = None
    suggested_action: Optional[str] = None

# --- Diagnostic Assessment ---
class DiagnosticQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    difficulty: str
    concept: str

class DiagnosticSubmission(BaseModel):
    has_programmed_before: bool
    answers: Dict[int, str] # question_id -> chosen option
    code_solutions: Dict[str, str] # test_key -> submitted code

class AssessmentResult(BaseModel):
    assessed_level: str # Absolute Beginner, Beginner, Elementary, Intermediate, Advanced
    recommended_stage: int
    score_percentage: float
    strengths: List[str]
    gaps: List[str]
    personalized_roadmap_summary: str

# --- Concept Mastery ---
class ConceptMasteryItem(BaseModel):
    concept_name: str
    display_name: str
    category: str
    stage_number: int
    score: float # 0 to 100
    status: str # Strong, Good, Needs Practice, Weak, Not Learned
    attempts_count: int
    last_practiced: Optional[datetime] = None

# --- Mistakes ---
class MistakeItem(BaseModel):
    id: int
    topic: str
    mistake_description: str
    correct_concept: str
    code_snippet: str
    error_message: str
    review_status: str
    repetition_level: int
    next_review_at: datetime
    created_at: datetime

# --- Revision & Daily Session ---
class RevisionItem(BaseModel):
    id: int
    concept_name: str
    stage_number: int
    interval_days: int
    due_date: datetime
    is_overdue: bool

class DailySessionPlan(BaseModel):
    date: str
    total_minutes: int = 55
    steps: List[Dict[str, Any]]
    weak_areas_scheduled: List[str]

# --- Interview Mode ---
class InterviewStartRequest(BaseModel):
    track: str = "Python Interview" # Python Interview, DSA Interview, Technical Interview, HR/Behavioral Interview, Mock Interview, Daily Topic Interview
    company_target: str = "General" # Google, Amazon, Microsoft, General
    topic: Optional[str] = None # e.g. "dictionaries", "variables", "loops", "two_pointers"

class InterviewMessageRequest(BaseModel):
    session_id: int
    user_response: str
    code_snippet: Optional[str] = None

class InterviewTurnResponse(BaseModel):
    session_id: int
    interviewer_reply: str
    follow_up_question: Optional[str] = None
    is_finished: bool = False
    turn_index: int

class InterviewEvaluationReport(BaseModel):
    session_id: int
    track: str
    overall_score: float # 0 to 100
    technical_accuracy: float
    problem_solving: float
    communication: float
    code_quality: float
    strengths: List[str]
    improvements: List[str]
    company_fit_verdict: str
    detailed_feedback: str

# --- Analytics ---
class AnalyticsDashboardResponse(BaseModel):
    streak_days: int
    overall_mastery: float
    total_time_hours: float
    problems_solved: int
    problems_attempted: int
    hints_used: int
    current_level: str
    current_stage: int
    weak_concepts: List[str]
    strong_concepts: List[str]
    recent_mistakes: List[MistakeItem]
    weekly_growth_summary: Dict[str, Any]
