import {
  AuthResponse, UserProfile, StageData, LessonDetail,
  CodeExecutionResult, CodeEvaluation, HintData, ConceptMastery,
  MistakeItem, RevisionItem, DailySessionPlan, ProblemItem,
  InterviewSession, AnalyticsDashboard
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('codepath_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('codepath_token', data.access_token);
    return data;
  },

  async register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('codepath_token', data.access_token);
    return data;
  },

  async demoLogin(): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Demo login failed');
    const data = await res.json();
    localStorage.setItem('codepath_token', data.access_token);
    return data;
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  logout() {
    localStorage.removeItem('codepath_token');
  },

  // Curriculum
  async getStages(): Promise<StageData[]> {
    const res = await fetch(`${API_BASE}/curriculum/stages`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch curriculum stages');
    return res.json();
  },

  async getLesson(lessonId: number): Promise<LessonDetail> {
    const res = await fetch(`${API_BASE}/curriculum/lessons/${lessonId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch lesson');
    return res.json();
  },

  async checkInteractive(lessonId: number, selectedOption: string): Promise<{ correct: boolean; explanation: string }> {
    const res = await fetch(`${API_BASE}/curriculum/lessons/interactive-check`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ lesson_id: lessonId, selected_option: selectedOption }),
    });
    if (!res.ok) throw new Error('Failed to check answer');
    return res.json();
  },

  async getProblems(difficulty?: string): Promise<ProblemItem[]> {
    const url = difficulty ? `${API_BASE}/curriculum/problems?difficulty=${encodeURIComponent(difficulty)}` : `${API_BASE}/curriculum/problems`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch problems');
    return res.json();
  },

  async getProblem(problemId: number): Promise<ProblemItem> {
    const res = await fetch(`${API_BASE}/curriculum/problems/${problemId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch problem');
    return res.json();
  },

  // Execution
  async executeCode(payload: {
    code: string;
    test_cases?: Array<{ input: string; expected: string; hidden?: boolean }>;
    lesson_id?: number;
    problem_id?: number;
    is_mastery_check?: boolean;
  }): Promise<CodeExecutionResult> {
    const res = await fetch(`${API_BASE}/execution/run`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Code execution request failed');
    return res.json();
  },

  // AI Teacher & Hints
  async evaluateCode(payload: {
    code: string;
    concept_key: string;
    challenge_description: string;
    error_message?: string;
    stdout?: string;
    attempt_number?: number;
  }): Promise<CodeEvaluation> {
    const res = await fetch(`${API_BASE}/teacher/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Evaluation request failed');
    return res.json();
  },

  async getHint(payload: {
    tier: number;
    concept_key: string;
    current_code?: string;
    lesson_id?: number;
    problem_id?: number;
  }): Promise<HintData> {
    const res = await fetch(`${API_BASE}/teacher/hint`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to fetch hint');
    return res.json();
  },

  async teacherChat(payload: {
    message: string;
    current_code?: string;
    concept_key?: string;
    history?: Array<{ role: string; content: string }>;
  }): Promise<{ reply: string; socratic_question?: string; suggested_action?: string }> {
    const res = await fetch(`${API_BASE}/teacher/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Teacher chat failed');
    return res.json();
  },

  // Assessment
  async getDiagnosticQuestions(): Promise<any> {
    const res = await fetch(`${API_BASE}/assessment/questions`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch assessment');
    return res.json();
  },

  async submitDiagnostic(payload: {
    has_programmed_before: boolean;
    answers: Record<number, string>;
    code_solutions: Record<string, string>;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/assessment/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  // Mastery & Knowledge Map
  async getMastery(): Promise<ConceptMastery[]> {
    const res = await fetch(`${API_BASE}/mastery`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch concept mastery');
    return res.json();
  },

  async getWeakAreas(): Promise<{ weak_concepts: string[]; recommendation: string }> {
    const res = await fetch(`${API_BASE}/mastery/weak-areas`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch weak areas');
    return res.json();
  },

  // Mistakes
  async getMistakes(): Promise<MistakeItem[]> {
    const res = await fetch(`${API_BASE}/mistakes`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch mistakes');
    return res.json();
  },

  async reviewMistake(mistakeId: number, status: string): Promise<MistakeItem> {
    const res = await fetch(`${API_BASE}/mistakes/${mistakeId}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to review mistake');
    return res.json();
  },

  // Revision & Daily Session
  async getRevisionSchedule(): Promise<RevisionItem[]> {
    const res = await fetch(`${API_BASE}/revision/schedule`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch revision schedule');
    return res.json();
  },

  async advanceRevision(revisionId: number): Promise<RevisionItem> {
    const res = await fetch(`${API_BASE}/revision/${revisionId}/advance`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to advance revision');
    return res.json();
  },

  async getDailySession(): Promise<DailySessionPlan> {
    const res = await fetch(`${API_BASE}/revision/daily-session`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch daily session');
    return res.json();
  },

  // Interview Mode
  async startInterview(track: string, companyTarget: string = 'General', topic?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/interview/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ track, company_target: companyTarget, topic: topic || undefined }),
    });
    if (!res.ok) throw new Error('Failed to start interview');
    return res.json();
  },

  async sendInterviewTurn(sessionId: number, response: string, code?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/interview/turn`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ session_id: sessionId, user_response: response, code_snippet: code }),
    });
    if (!res.ok) throw new Error('Failed to send interview turn');
    return res.json();
  },

  async evaluateInterview(sessionId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/interview/${sessionId}/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to evaluate interview');
    return res.json();
  },

  // Companies
  async getCompanyTracks(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/companies/tracks`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch company tracks');
    return res.json();
  },

  // Analytics
  async getDashboardAnalytics(): Promise<AnalyticsDashboard> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
  },
};
