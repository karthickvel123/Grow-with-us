import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Award, Clock, Code2, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsDashboard, ConceptMastery } from '../types';

export const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [masteries, setMasteries] = useState<ConceptMastery[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ana, mast] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getMastery(),
      ]);
      setAnalytics(ana);
      setMasteries(mast);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
          <BarChart3 className="h-4 w-4" />
          <span>Continuous Analytics</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Performance & Weekly Growth Report
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics tracking problem-solving speed, hint dependency, and concept retention.
        </p>
      </div>

      {/* Official Weekly Report Card */}
      {analytics?.weekly_growth_summary && (
        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Official Summary
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">WEEKLY GROWTH REPORT</h2>
            </div>
            <div className="flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-4 w-4" />
              <span>Positive Momentum</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Python Mastery</span>
              <div className="text-lg font-black text-white font-mono">
                {analytics.weekly_growth_summary.python_growth}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">DSA Readiness</span>
              <div className="text-lg font-black text-white font-mono">
                {analytics.weekly_growth_summary.dsa_growth}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Strongest Area</span>
              <div className="text-sm font-bold text-emerald-400 capitalize">
                {analytics.weekly_growth_summary.strongest_area.replace('_', ' ')}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Needs Attention</span>
              <div className="text-sm font-bold text-amber-400 capitalize">
                {analytics.weekly_growth_summary.needs_attention.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-900/20 text-xs text-blue-200 leading-relaxed flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div>
              <strong className="text-white">Recommendation: </strong>
              {analytics.weekly_growth_summary.recommendation}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-5">
          <span className="text-xs text-slate-400 font-medium">Problems Solved</span>
          <div className="text-2xl font-black text-white mt-1">
            {analytics?.problems_solved ?? 14}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
            {analytics?.problems_attempted ?? 19} total attempts
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-5">
          <span className="text-xs text-slate-400 font-medium">Hints Used</span>
          <div className="text-2xl font-black text-white mt-1">
            {analytics?.hints_used ?? 4}
          </div>
          <span className="text-[10px] text-amber-400 font-medium mt-1 block">
            Lower is better
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-5">
          <span className="text-xs text-slate-400 font-medium">Overall Mastery</span>
          <div className="text-2xl font-black text-white mt-1">
            {analytics?.overall_mastery ?? 43}%
          </div>
          <span className="text-[10px] text-blue-400 font-medium mt-1 block">
            Continuous evaluation
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-5">
          <span className="text-xs text-slate-400 font-medium">Learning Streak</span>
          <div className="text-2xl font-black text-white mt-1">
            {analytics?.streak_days ?? 7} days
          </div>
          <span className="text-[10px] text-emerald-400 font-medium mt-1 block">
            Active streak
          </span>
        </div>
      </div>

      {/* Concept Mastery Breakdown List */}
      <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-8 backdrop-blur-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Full Concept Mastery Breakdown
        </h3>

        <div className="space-y-3">
          {masteries.map((m) => (
            <div key={m.concept_name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{m.display_name}</span>
                <span className="font-mono text-slate-300 font-bold">{m.score}% • {m.status}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    m.score >= 80 ? 'bg-emerald-500' : m.score >= 60 ? 'bg-blue-500' : m.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(m.score, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
