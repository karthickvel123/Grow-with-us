import React, { useEffect, useState } from 'react';
import {
  Flame, Award, Clock, CheckCircle2, AlertTriangle, ArrowRight,
  Sparkles, BookOpen, Code2, Users, Building2, BookX, Target, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AnalyticsDashboard, DailySessionPlan } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: string, lessonId?: number, topic?: string) => void;
  onOpenDiagnostic: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenDiagnostic,
}) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailySessionPlan | null>(null);
  const [weakAreas, setWeakAreas] = useState<{ weak_concepts: string[]; recommendation: string } | null>(null);
  const [planSteps, setPlanSteps] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [anaData, planData, weakData] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getDailySession(),
        api.getWeakAreas(),
      ]);
      setAnalytics(anaData);
      setDailyPlan(planData);
      setPlanSteps(planData.steps || []);
      setWeakAreas(weakData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const toggleStep = (index: number) => {
    setPlanSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, completed: !step.completed } : step))
    );
  };

  const completedCount = planSteps.filter((s) => s.completed).length;
  const progressPct = planSteps.length > 0 ? Math.round((completedCount / planSteps.length) * 100) : 60;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Personalized Learning Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.full_name || 'Learner'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Target Track: <strong className="text-white font-semibold">{user?.target_company || 'Google'}</strong> • Current Level: <strong className="text-blue-300 font-semibold">{analytics?.current_level || 'Python Beginner'}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('learn')}
              className="flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              <span>Continue Stage {user?.current_stage ?? 0}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                const topic = weakAreas?.weak_concepts?.[0] || 'dictionaries';
                onNavigate('interview', undefined, topic);
              }}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Users className="h-4 w-4" />
              <span>🎙️ Today's Exit Interview</span>
            </button>

            <button
              onClick={onOpenDiagnostic}
              className="flex items-center space-x-2 rounded-xl border border-white/15 bg-slate-800/80 hover:bg-slate-700 px-4 py-3 text-xs font-semibold text-slate-200 transition"
            >
              <span>Diagnostic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weak Concept Immediate Revision Alert */}
      {weakAreas && weakAreas.weak_concepts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-slate-900/80 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center space-x-1.5">
                <span>Adaptive Recommendation: Weak Area Detected</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {weakAreas.recommendation}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('learn')}
            className="flex-shrink-0 flex items-center space-x-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            <Zap className="h-4 w-4 fill-current" />
            <span>Strengthen {weakAreas.weak_concepts[0]}</span>
          </button>
        </div>
      )}

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Learning Streak</span>
            <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.streak_days ?? 7} <span className="text-xs font-medium text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium mt-1">Keep it alive today!</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Overall Mastery</span>
            <Award className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.overall_mastery ?? 43}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analytics?.overall_mastery ?? 43}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Problems Solved</span>
            <Code2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.problems_solved ?? 14} <span className="text-xs font-medium text-slate-400">/ {analytics?.problems_attempted ?? 19}</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">
            {analytics?.problems_attempted ? Math.round(((analytics?.problems_solved || 0) / analytics.problems_attempted) * 100) : 74}% success rate
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Learning Hours</span>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {analytics?.total_time_hours ?? 4.0} <span className="text-xs font-medium text-slate-400">hrs</span>
          </div>
          <p className="text-[11px] text-purple-300 font-medium mt-1">Spaced Repetition active</p>
        </div>
      </div>

      {/* Main Grid: Today's Session Plan & Current Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Personalized Daily Session Plan */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-7 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Target className="h-4 w-4" />
                <span>Today's Adaptive Plan • 55 Min Total</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">Structured Daily Practice Session</h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span>Today's Progress:</span>
              <span className="font-mono font-bold text-blue-400">{progressPct}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-2 my-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Session Steps List */}
          <div className="space-y-3 mt-4">
            {planSteps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`group flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
                  step.completed
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-400'
                    : 'border-white/5 bg-slate-900/50 hover:border-blue-500/30 hover:bg-slate-800/50 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                      step.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-white/20 bg-slate-800 text-transparent group-hover:border-blue-400'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold ${step.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {step.title}
                      </span>
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                        {step.duration_minutes} min
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (step.type === 'learn') onNavigate('learn');
                    else if (step.type === 'code' || step.type === 'problem') onNavigate('practice');
                    else if (step.type === 'revision') onNavigate('revision');
                    else if (step.type === 'interview' || step.type === 'quiz' || step.type === 'assessment') {
                      const topic = weakAreas?.weak_concepts?.[0] || 'dictionaries';
                      onNavigate('interview', undefined, topic);
                    }
                    else onNavigate('learn');
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Today's Focus & Mistake Notebook Snapshot */}
        <div className="space-y-6">
          {/* Weak Concepts Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Weak Areas to Revise</span>
            </h3>
            {analytics?.weak_concepts && analytics.weak_concepts.length > 0 ? (
              <div className="space-y-2">
                {analytics.weak_concepts.map((wc, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-red-500/20 bg-red-950/20 text-xs">
                    <span className="font-semibold text-red-300 capitalize">{wc.replace('_', ' ')}</span>
                    <button
                      onClick={() => onNavigate('learn')}
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 underline"
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>All concepts are in Good or Strong status!</span>
              </div>
            )}
          </div>

          {/* Recent Mistakes Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <BookX className="h-4 w-4 text-purple-400" />
                <span>Mistake Notebook</span>
              </h3>
              <button
                onClick={() => onNavigate('mistakes')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                View All
              </button>
            </div>

            {analytics?.recent_mistakes && analytics.recent_mistakes.length > 0 ? (
              <div className="space-y-2.5">
                {analytics.recent_mistakes.slice(0, 2).map((m) => (
                  <div key={m.id} className="p-3 rounded-xl border border-white/5 bg-slate-900/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white capitalize">{m.topic}</span>
                      <span className="text-[10px] font-bold text-amber-400 rounded bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20">
                        {m.review_status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {m.mistake_description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No errors logged yet. Keep coding!</p>
            )}
          </div>

          {/* Quick Launchpad to Interview Mode */}
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 p-5 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Interview Simulator</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Test your technical communication and coding under simulated interview pressure.
            </p>
            <button
              onClick={() => onNavigate('interview')}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 px-3 text-xs font-bold text-white transition flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20"
            >
              <span>Launch Mock Interview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
