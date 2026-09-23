export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  current_level: string;
  current_stage: number;
  target_company: string;
  streak_days: number;
  total_time_spent_minutes: number;
  total_problems_solved: number;
  total_problems_attempted: number;
  hints_used_count: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  full_name: string;
  current_level: string;
  current_stage: number;
}

export interface LessonSummary {
  id: number;
  module_id: number;
  title: string;
  concept_key: string;
  order_index: number;
  completed?: boolean;
}

export interface ModuleData {
  id: number;
  stage_id: number;
  title: string;
  description: string;
  order_index: number;
  lessons: LessonSummary[];
}

export interface StageData {
  id: number;
  stage_number: number;
  title: string;
  description: string;
  badge_name: string;
  modules: ModuleData[];
}

export interface LessonDetail {
  id: number;
  module_id: number;
  stage_number: number;
  title: string;
  concept_key: string;
  concept_explanation: string;
  real_world_analogy: string;
  code_example: string;
  interactive_question: string;
  interactive_options: string[];
  coding_challenge: string;
  starter_code: string;
  test_cases: Array<{ input: string; expected: string; hidden?: boolean }>;
  total_hints: number;
  mastery_check_prompt: string;
  mastery_check_starter: string;
}

export interface TestCaseResult {
  test_index: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  is_hidden: boolean;
}

export interface CodeExecutionResult {
  status: "passed" | "failed" | "error" | "timeout";
  stdout: string;
  stderr: string;
  execution_time_ms: number;
  all_passed: boolean;
  passed_count: number;
  total_count: number;
  test_results: TestCaseResult[];
  error_type?: string;
  error_message?: string;
}

export interface CodeEvaluation {
  is_correct: boolean;
  what_was_correct: string;
  what_was_wrong: string;
  why_it_was_wrong: string;
  how_to_improve: string;
  socratic_hint: string;
  detected_misconception?: string;
}

export interface HintData {
  tier: number;
  tier_name: string;
  content: string;
  revealed_solution: boolean;
}

export interface ConceptMastery {
  concept_name: string;
  display_name: string;
  category: string;
  stage_number: number;
  score: number;
  status: "Strong" | "Good" | "Needs Practice" | "Weak" | "Not Learned";
  attempts_count: number;
  last_practiced?: string;
}

export interface MistakeItem {
  id: number;
  topic: string;
  mistake_description: string;
  correct_concept: string;
  code_snippet: string;
  error_message: string;
  review_status: string;
  repetition_level: number;
  next_review_at: string;
  created_at: string;
}

export interface RevisionItem {
  id: number;
  concept_name: string;
  stage_number: number;
  interval_days: number;
  due_date: string;
  is_overdue: boolean;
}

export interface DailySessionPlan {
  date: string;
  total_minutes: number;
  steps: Array<{
    step_number: number;
    title: string;
    duration_minutes: number;
    description: string;
    type: string;
    completed: boolean;
  }>;
  weak_areas_scheduled: string[];
}

export interface ProblemItem {
  id: number;
  title: string;
  slug: string;
  difficulty: "Beginner" | "Easy" | "Medium" | "Hard" | "Interview";
  category: string;
  stage_number: number;
  company_tags: string[];
  description: string;
  starter_code: string;
  solution_code?: string;
  test_cases: Array<{ input: string; expected: string; hidden?: boolean }>;
  hint_1?: string;
  hint_2?: string;
  hint_3?: string;
  hint_4?: string;
}

export interface InterviewSession {
  id: number;
  track: string;
  company_target: string;
  status: "in_progress" | "completed";
  score: number;
  messages: Array<{
    sender: "interviewer" | "candidate";
    text: string;
    code?: string;
    timestamp: string;
  }>;
  evaluation?: {
    overall_score: number;
    technical_accuracy: number;
    problem_solving: number;
    communication: number;
    code_quality: number;
    strengths: string[];
    improvements: string[];
    company_fit_verdict: string;
    detailed_feedback: string;
  };
}

export interface AnalyticsDashboard {
  streak_days: number;
  overall_mastery: number;
  total_time_hours: number;
  problems_solved: number;
  problems_attempted: number;
  hints_used: number;
  current_level: string;
  current_stage: number;
  weak_concepts: string[];
  strong_concepts: string[];
  recent_mistakes: MistakeItem[];
  weekly_growth_summary: {
    python_growth: string;
    dsa_growth: string;
    problems_solved: number;
    strongest_area: string;
    needs_attention: string;
    recommendation: string;
  };
}
