import React, { useState, useEffect } from 'react';
import {
  Users, Send, Bot, Award, CheckCircle2, AlertCircle,
  Building2, Sparkles, Loader2, ArrowRight, RotateCcw,
  Code2, HelpCircle, Check, BookOpen, Flame
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface InterviewViewProps {
  initialTopic?: string | null;
  initialTrack?: string;
  onClearTopic?: () => void;
  onReturnToDashboard?: () => void;
}

const COMMON_TOPICS = [
  { id: 'dictionaries', label: 'Dictionaries & Hash Maps' },
  { id: 'loops', label: 'Loops & Iterations' },
  { id: 'functions', label: 'Functions & Scope' },
  { id: 'variables', label: 'Variables & Data Types' },
  { id: 'oop', label: 'Object-Oriented Programming' },
  { id: 'lists', label: 'Lists & Array Operations' },
  { id: 'conditionals', label: 'Conditionals & Logic' },
  { id: 'big_o', label: 'Big-O & Time Complexity' },
  { id: 'recursion', label: 'Recursion & Call Stack' },
  { id: 'binary_search', label: 'Binary Search Algorithm' },
];

export const InterviewView: React.FC<InterviewViewProps> = ({
  initialTopic,
  initialTrack = 'Python Interview',
  onClearTopic,
  onReturnToDashboard,
}) => {
  const [track, setTrack] = useState<string>(initialTrack);
  const [companyTarget, setCompanyTarget] = useState<string>('Google');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(initialTopic || null);
  const [session, setSession] = useState<any | null>(null);
  const [userReply, setUserReply] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showCodeBox, setShowCodeBox] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  useEffect(() => {
    if (initialTopic) {
      setSelectedTopic(initialTopic);
      // Auto-configure track for topic exit interview
      setTrack('Python Interview');
    }
  }, [initialTopic]);

  const startInterview = async (overrideTopic?: string) => {
    setLoading(true);
    setEvaluation(null);
    const activeTopic = overrideTopic !== undefined ? overrideTopic : selectedTopic;
    try {
      const data = await api.startInterview(track, companyTarget, activeTopic || undefined);
      setSession(data);
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !userReply.trim() || loading) return;

    setLoading(true);
    try {
      const res = await api.sendInterviewTurn(
        session.session_id,
        userReply,
        codeSnippet || undefined
      );

      // Append candidate & interviewer messages locally
      const updatedMessages = [
        ...(session.messages || []),
        { sender: 'candidate', text: userReply, code: codeSnippet },
        { sender: 'interviewer', text: res.interviewer_reply },
      ];

      setSession((prev: any) => ({
        ...prev,
        messages: updatedMessages,
      }));

      setUserReply('');
      setCodeSnippet('');
      setShowCodeBox(false);

      if (res.is_finished) {
        // Fetch evaluation
        const evalReport = await api.evaluateInterview(session.session_id);
        setEvaluation(evalReport);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Failed turn:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSession(null);
    setEvaluation(null);
    setUserReply('');
    setCodeSnippet('');
    if (onClearTopic) onClearTopic();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Users className="h-6 w-6 text-blue-500" />
            <span>AI Technical Interview Simulator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time conversational mock interviews with live Socratic follow-ups, code critique, and rubric scoring.
          </p>
        </div>

        {session && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 rounded-xl border border-white/10 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>New Interview Round</span>
          </button>
        )}
      </div>

      {/* Screen 1: Configuration & Launch */}
      {!session && (
        <div className="space-y-6">
          {/* Prominent Daily Topic Exit Interview Banner if a topic is active */}
          {selectedTopic && (
            <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Today's Mandatory Daily Verification
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Topic Exit Interview:</span>
                  <span className="text-blue-300 underline decoration-blue-500/50 underline-offset-4">
                    {selectedTopic.replace('_', ' ').toUpperCase()}
                  </span>
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  You just coded and studied this topic today. Top tech companies (Google, Amazon, Microsoft) test whether you can clearly explain trade-offs and edge cases verbally. Complete this 5-minute exit interview to unlock today's mastery badge!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="rounded-xl border border-white/10 bg-slate-800/80 hover:bg-slate-700 px-3.5 py-3 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Clear Topic
                </button>
                <button
                  onClick={() => startInterview()}
                  disabled={loading}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4 fill-current" />}
                  <span>Attend Today's Exit Interview</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Topic Selection Row */}
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
                <BookOpen className="h-4 w-4" />
                <span>Interview Topic (Daily Exit & Focus Rounds)</span>
              </label>
              {selectedTopic && (
                <span className="text-[11px] font-mono text-emerald-400">
                  Active: {selectedTopic}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Select any concept you studied today or in past days to conduct a focused oral interview on that specific topic:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {COMMON_TOPICS.map((top) => {
                const isSelected = selectedTopic === top.id;
                return (
                  <button
                    key={top.id}
                    onClick={() => setSelectedTopic(isSelected ? null : top.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'border-white/10 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="inline h-3 w-3 mr-1 text-emerald-400" />}
                    {top.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode & Company Configuration */}
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-8 backdrop-blur-md space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-3">
                1. Select Interview Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'Python Interview', title: 'Python Core & OOP', desc: 'Syntax, mutability, decorators, GIL, and OOP' },
                  { id: 'DSA Interview', title: 'Data Structures & Algorithmic', desc: 'Two Pointers, Hash Maps, Trees, Big-O' },
                  { id: 'Technical Interview', title: 'System Architecture & CS', desc: 'OS, caching, DB indices, high-throughput' },
                  { id: 'HR/Behavioral Interview', title: 'Behavioral STAR Method', desc: 'Leadership, conflict, teamwork, results' },
                  { id: 'Mock Interview', title: 'Full Technical Screen', desc: 'Comprehensive multi-topic technical probe' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTrack(t.id)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      track === t.id
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-white/5 bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-1">{t.title}</div>
                    <div className="text-[11px] text-slate-400 leading-snug">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-3">
                2. Target Company Benchmark
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Google', 'Amazon', 'Microsoft', 'General'].map((comp) => (
                  <button
                    key={comp}
                    onClick={() => setCompanyTarget(comp)}
                    className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition flex items-center justify-center space-x-2 ${
                      companyTarget === comp
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-white/5 bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>{comp}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedTopic ? `Topic: ${selectedTopic} • ` : ''}Target: {companyTarget}
              </span>
              <button
                onClick={() => startInterview()}
                disabled={loading}
                className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-500/25 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                <span>Begin Live Technical Screen</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Active Interview Dialogue & Evaluation */}
      {session && (
        <div className="space-y-6">
          {/* Active Interview Banner */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{session.track}</span>
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    {session.company_target} Bar
                  </span>
                  {session.topic && (
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      Topic: {session.topic}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Explain your thought process out loud. Socratic follow-ups will test your understanding.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono text-emerald-400">Live Round #{session.session_id}</span>
            </div>
          </div>

          {/* Dialogue Thread */}
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/90 p-5 sm:p-6 backdrop-blur-md space-y-4 min-h-[380px] max-h-[560px] overflow-y-auto">
            {session.messages?.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'candidate' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {msg.sender === 'candidate' ? 'You (Candidate)' : `${session.company_target} Technical Interviewer`}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'candidate'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'border border-white/10 bg-slate-900/90 text-slate-200 shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.code && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-[#0c101c] p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                      <pre>{msg.code}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Interviewer is formulating follow-up question...</span>
              </div>
            )}
          </div>

          {/* Candidate Response Composer (if interview is not completed) */}
          {!evaluation && (
            <form onSubmit={handleSendResponse} className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-4 sm:p-5 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your Answer
                </span>
                <button
                  type="button"
                  onClick={() => setShowCodeBox(!showCodeBox)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition ${
                    showCodeBox
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>{showCodeBox ? 'Hide Code Box' : '+ Add Code Snippet'}</span>
                </button>
              </div>

              <textarea
                value={userReply}
                onChange={(e) => setUserReply(e.target.value)}
                rows={3}
                placeholder="Type your technical explanation here (e.g. 'I would use a hash map because lookups take O(1) average time...')"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
              />

              {showCodeBox && (
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={4}
                  placeholder="# Optional Python code implementation or pseudocode..."
                  className="w-full rounded-2xl border border-white/10 bg-[#0c101c] p-3 font-mono text-xs text-emerald-300 placeholder-slate-600 outline-none focus:border-emerald-500 transition"
                />
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!userReply.trim() || loading}
                  className="flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                >
                  <span>Submit Answer</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Final Comprehensive Rubric Evaluation Card */}
          {evaluation && (
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-[#0f172a] p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Official Interview Screen Evaluation
                    </span>
                    {session.topic && (
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                        {session.topic} Verified
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    Verdict: <span className="text-emerald-300">{evaluation.company_fit_verdict}</span>
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Overall Benchmark Score</span>
                  <div className="text-3xl font-black text-white font-mono">{evaluation.overall_score}%</div>
                </div>
              </div>

              {/* 4-Dimension Rubric Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Technical Accuracy', score: evaluation.technical_accuracy },
                  { label: 'Problem Solving', score: evaluation.problem_solving },
                  { label: 'Communication', score: evaluation.communication },
                  { label: 'Code Quality', score: evaluation.code_quality },
                ].map((dim, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-center">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">{dim.label}</span>
                    <span className="text-lg font-black text-white font-mono">{dim.score}%</span>
                  </div>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Candidate Strengths</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {evaluation.strengths?.map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                    <AlertCircle className="h-4 w-4" />
                    <span>Areas for Improvement</span>
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {evaluation.improvements?.map((imp: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-1.5">
                <h4 className="text-xs font-bold text-blue-400">Interviewer Summary:</h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {evaluation.detailed_feedback}
                </p>
              </div>

              {/* Action Buttons to celebrate or return */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                  <Award className="h-4 w-4" />
                  <span>Daily Topic Exit Requirement Met! Retention Logged.</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition"
                  >
                    Start Another Interview Round
                  </button>
                  {onReturnToDashboard && (
                    <button
                      onClick={onReturnToDashboard}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition"
                    >
                      Return to Dashboard →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
