import React, { useEffect, useState } from 'react';
import { BookX, CheckCircle2, AlertTriangle, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { MistakeItem } from '../types';

interface MistakesViewProps {
  onPracticeTopic?: (topic: string) => void;
}

export const MistakesView: React.FC<MistakesViewProps> = ({ onPracticeTopic }) => {
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const data = await api.getMistakes();
      setMistakes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const updated = await api.reviewMistake(id, newStatus);
      setMistakes((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = mistakes.filter((m) => {
    if (filter === 'All') return true;
    return m.review_status === filter;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <BookX className="h-6 w-6 text-purple-500" />
            <span>Personalized Mistake Notebook</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automatically logs misconceptions and runtime errors for targeted spaced revision.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 rounded-xl border border-white/10 bg-slate-900/80 p-1 text-xs">
          {['All', 'Needs Revision', 'Reviewed', 'Mastered'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                filter === f
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Mistake Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 backdrop-blur-md space-y-4 hover:border-purple-500/30 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-300 border border-purple-500/20 capitalize font-mono">
                    {m.topic.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    Spaced Level {m.repetition_level}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      m.review_status === 'Mastered'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : m.review_status === 'Reviewed'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {m.review_status}
                  </span>
                </div>
              </div>

              {/* Mistake Description vs Correct Concept */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4 space-y-1">
                  <span className="text-xs font-bold text-red-400 flex items-center space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Your Error / Misconception:</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {m.mistake_description}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Correct Mental Model:</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {m.correct_concept}
                  </p>
                </div>
              </div>

              {/* Code Snippet & Error Output */}
              {m.code_snippet && (
                <div className="rounded-2xl border border-white/5 bg-[#0a0d14] p-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500">Recorded Snippet:</span>
                  <pre className="text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {m.code_snippet}
                  </pre>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
                <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Next scheduled review: {new Date(m.next_review_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {m.review_status !== 'Mastered' && (
                    <button
                      onClick={() => handleUpdateStatus(m.id, 'Mastered')}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-3 py-1.5 text-xs font-semibold transition"
                    >
                      Mark as Mastered
                    </button>
                  )}
                  {m.review_status === 'Needs Revision' && (
                    <button
                      onClick={() => handleUpdateStatus(m.id, 'Reviewed')}
                      className="rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-3 py-1.5 text-xs font-semibold transition"
                    >
                      Mark Reviewed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-12 text-center backdrop-blur-md">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white">No mistakes recorded under this filter</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When you encounter syntax or runtime errors during practice, CodePath AI automatically logs them here for your revision.
          </p>
        </div>
      )}
    </div>
  );
};
