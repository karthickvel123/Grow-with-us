import React, { useEffect, useState } from 'react';
import {
  BookOpen, GitFork, CheckCircle2, Circle, AlertCircle,
  PlayCircle, ArrowRight, Award, Lock, Sparkles, ChevronDown, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { StageData, ConceptMastery } from '../types';

interface LearnViewProps {
  onSelectLesson: (lessonId: number) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ onSelectLesson }) => {
  const [stages, setStages] = useState<StageData[]>([]);
  const [masteries, setMasteries] = useState<ConceptMastery[]>([]);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'knowledge_map'>('roadmap');
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurriculum();
  }, []);

  const loadCurriculum = async () => {
    try {
      const [stagesData, masteryData] = await Promise.all([
        api.getStages(),
        api.getMastery(),
      ]);
      setStages(stagesData);
      setMasteries(masteryData);
    } catch (err) {
      console.error('Failed to load curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStage = (stageNum: number) => {
    setExpandedStages((prev) => ({ ...prev, [stageNum]: !prev[stageNum] }));
  };

  const getStatusBadge = (status: string, score: number) => {
    switch (status) {
      case 'Strong':
        return (
          <span className="flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
            <span>🟢 Strong ({score}%)</span>
          </span>
        );
      case 'Good':
        return (
          <span className="flex items-center space-x-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
            <span>🔵 Good ({score}%)</span>
          </span>
        );
      case 'Needs Practice':
        return (
          <span className="flex items-center space-x-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
            <span>🟡 Practice ({score}%)</span>
          </span>
        );
      case 'Weak':
        return (
          <span className="flex items-center space-x-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/20">
            <span>🔴 Weak ({score}%)</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-400 border border-white/5">
            <span>⚪ Not Started</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <span>Curriculum & Knowledge Map</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Structured Stage 0 through Stage 7 syllabus with concept mastery tracking.
          </p>
        </div>

        <div className="flex items-center rounded-xl border border-white/10 bg-slate-900/80 p-1">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'roadmap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Curriculum Roadmap</span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge_map')}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === 'knowledge_map'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitFork className="h-3.5 w-3.5" />
            <span>Visual Knowledge Map</span>
          </button>
        </div>
      </div>

      {/* ROADMAP VIEW */}
      {activeTab === 'roadmap' && (
        <div className="space-y-5">
          {stages.map((stage) => {
            const isExpanded = expandedStages[stage.stage_number] ?? true;
            return (
              <div
                key={stage.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a]/70 backdrop-blur-md transition"
              >
                {/* Stage Header */}
                <div
                  onClick={() => toggleStage(stage.stage_number)}
                  className="flex cursor-pointer items-center justify-between p-5 sm:p-6 bg-gradient-to-r from-slate-900/80 to-slate-900/40 hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold font-mono text-sm">
                      S{stage.stage_number}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold text-white">{stage.title}</h2>
                        {stage.badge_name && (
                          <span className="hidden sm:inline rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/20">
                            {stage.badge_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{stage.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      {stage.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons
                    </span>
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>

                {/* Modules & Lessons */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-5 sm:p-6 space-y-6">
                    {stage.modules?.map((mod) => (
                      <div key={mod.id} className="space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                          <span className="text-blue-400">❖</span>
                          <span>{mod.title}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mod.lessons?.map((lesson) => {
                            const masteryItem = masteries.find((m) => m.concept_name === lesson.concept_key);
                            const status = masteryItem?.status || 'Not Learned';
                            const score = masteryItem?.score || 0;

                            return (
                              <div
                                key={lesson.id}
                                className="group flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-slate-900/50 hover:border-blue-500/40 hover:bg-slate-800/40 transition"
                              >
                                <div className="space-y-1.5 pr-2">
                                  <div className="flex items-center space-x-2">
                                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition">
                                      {lesson.title}
                                    </h4>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getStatusBadge(status, score)}
                                    <span className="text-[10px] font-mono text-slate-500 capitalize">
                                      {lesson.concept_key.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => onSelectLesson(lesson.id)}
                                  className="flex-shrink-0 flex items-center space-x-1 rounded-xl bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition active:scale-95"
                                >
                                  <span>Learn</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VISUAL KNOWLEDGE MAP VIEW */}
      {activeTab === 'knowledge_map' && (
        <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Interactive Concept Knowledge Map</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every concept is continually evaluated through coding challenges and mastery checks.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center space-x-1.5">
                <span>🟢</span>
                <span className="text-slate-300">Strong (≥80%)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span>🟡</span>
                <span className="text-slate-300">Needs Practice (40-79%)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span>🔴</span>
                <span className="text-slate-300">Weak (&lt;40%)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span>⚪</span>
                <span className="text-slate-300">Not Started</span>
              </span>
            </div>
          </div>

          {/* Hierarchical Tree Map Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {masteries.map((concept) => (
              <div
                key={concept.concept_name}
                className="rounded-2xl border border-white/5 bg-slate-900/60 p-4 space-y-2.5 hover:border-white/20 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{concept.display_name}</span>
                  {getStatusBadge(concept.status, concept.score)}
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      concept.status === 'Strong'
                        ? 'bg-emerald-500'
                        : concept.status === 'Good'
                        ? 'bg-blue-500'
                        : concept.status === 'Needs Practice'
                        ? 'bg-amber-500'
                        : concept.status === 'Weak'
                        ? 'bg-red-500'
                        : 'bg-slate-700'
                    }`}
                    style={{ width: `${Math.max(concept.score, 4)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Stage {concept.stage_number} • {concept.category}</span>
                  <span>{concept.attempts_count} attempts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
