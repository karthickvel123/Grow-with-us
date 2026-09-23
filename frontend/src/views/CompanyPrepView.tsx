import React, { useEffect, useState } from 'react';
import { Building2, Award, CheckCircle2, Lightbulb, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface CompanyPrepViewProps {
  onPracticeCompany?: (company: string) => void;
}

export const CompanyPrepView: React.FC<CompanyPrepViewProps> = ({ onPracticeCompany }) => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('Google');

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const data = await api.getCompanyTracks();
      setTracks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const activeTrack = tracks.find((t) => t.company === selectedCompany) || tracks[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
          <Building2 className="h-4 w-4" />
          <span>Stage 7 Company Track Hub</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Target Company Preparation Guides
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Grounded exclusively in publicly available engineering concepts, documented hiring rubrics, and industry interview patterns. (No confidential questions).
        </p>
      </div>

      {/* Company Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tracks.map((t) => {
          const isSelected = selectedCompany === t.company;
          return (
            <button
              key={t.company}
              onClick={() => setSelectedCompany(t.company)}
              className={`p-5 rounded-3xl border text-left transition ${
                isSelected
                  ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/10'
                  : 'border-white/10 bg-slate-900/50 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-black text-white">{t.company}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  t.company === 'Google'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : t.company === 'Amazon'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  Track
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{t.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* Active Track Deep Dive */}
      {activeTrack && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                {activeTrack.company} Interview Architecture & Rubrics
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeTrack.description}
              </p>
            </div>

            {/* Core Pillars */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Pillars & Weighting
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeTrack.core_pillars?.map((p: any, i: number) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{p.pillar}</span>
                      <span className="text-[10px] font-mono font-bold text-blue-400 rounded bg-blue-500/10 px-1.5 py-0.5 border border-blue-500/20">
                        {p.weight}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{p.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interview Rounds & Top Patterns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Award className="h-4 w-4 text-purple-400" />
                  <span>Documented Interview Loop</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {activeTrack.interview_rounds?.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <span>High-Frequency Algorithmic Patterns</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {activeTrack.top_patterns?.map((pat: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>{pat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Preparation Advice */}
            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5 space-y-2">
              <h4 className="text-xs font-bold text-blue-300 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>Senior Staff Preparation Tip</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                "{activeTrack.preparation_advice}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
