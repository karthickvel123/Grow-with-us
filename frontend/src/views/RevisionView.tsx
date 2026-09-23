import React, { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { RevisionItem } from '../types';

interface RevisionViewProps {
  onPracticeTopic?: (concept: string) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({ onPracticeTopic }) => {
  const [schedules, setSchedules] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await api.getRevisionSchedule();
      setSchedules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (id: number) => {
    try {
      const updated = await api.advanceRevision(id);
      setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
          <CalendarClock className="h-4 w-4" />
          <span>Ebbinghaus Spaced Repetition</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Automated Spaced Revision Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Concepts are automatically scheduled for re-testing at increasing intervals: Day 1 → Day 3 → Day 7 → Day 14 → Day 30 to guarantee permanent long-term memory.
        </p>
      </div>

      {/* Interval Progression Timeline Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-7 backdrop-blur-md space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          The 5-Interval Retention Cadence
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {[
            { day: 'Day 1', label: 'First Recall', icon: '⚡' },
            { day: 'Day 3', label: 'Consolidation', icon: '🧠' },
            { day: 'Day 7', label: 'Weekly Lock', icon: '🔒' },
            { day: 'Day 14', label: 'Deep Memory', icon: '💎' },
            { day: 'Day 30', label: 'Mastery Lock', icon: '🏆' },
          ].map((intv, idx) => (
            <div key={idx} className="rounded-2xl border border-white/5 bg-slate-900/60 p-3.5 space-y-1">
              <span className="text-xl block">{intv.icon}</span>
              <span className="text-xs font-bold text-white block">{intv.day}</span>
              <span className="text-[10px] text-slate-400 block">{intv.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Items List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Your Revision Queue ({schedules.length})
        </h3>

        {schedules.length > 0 ? (
          <div className="space-y-3">
            {schedules.map((s) => (
              <div
                key={s.id}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  s.is_overdue
                    ? 'border-red-500/30 bg-red-950/20'
                    : 'border-white/10 bg-[#0f172a]/80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-bold text-white capitalize">
                      {s.concept_name.replace('_', ' ')}
                    </span>
                    <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-300 border border-blue-500/20">
                      Stage {s.stage_number}
                    </span>
                    <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-500/20">
                      {s.interval_days}-Day Interval
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Due Date: {new Date(s.due_date).toLocaleDateString()}
                    {s.is_overdue && (
                      <strong className="text-red-400 ml-2 font-bold">• Overdue for review!</strong>
                    )}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAdvance(s.id)}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition active:scale-95"
                  >
                    <span>Practice & Advance</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-10 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2 opacity-80" />
            <p className="text-xs text-slate-300">
              No revisions currently due. As you practice and solve problems, CodePath AI will automatically build your spaced schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
