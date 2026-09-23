import React, { useEffect, useState } from 'react';
import {
  Code2, Terminal, CheckCircle2, XCircle, Play, Lightbulb,
  Building2, Sparkles, Key, RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';
import { ProblemItem, CodeExecutionResult, CodeEvaluation } from '../types';
import confetti from 'canvas-confetti';

export const PracticeView: React.FC = () => {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [execResult, setExecResult] = useState<CodeExecutionResult | null>(null);
  const [evaluation, setEvaluation] = useState<CodeEvaluation | null>(null);
  const [currentHintTier, setCurrentHintTier] = useState<number>(0);
  const [revealedHint, setRevealedHint] = useState<string>('');

  useEffect(() => {
    loadProblems();
  }, [difficultyFilter]);

  const loadProblems = async () => {
    try {
      const data = await api.getProblems(difficultyFilter || undefined);
      setProblems(data);
      if (data.length > 0 && !selectedProblem) {
        selectProblem(data[0]);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    }
  };

  const selectProblem = async (p: ProblemItem) => {
    try {
      const fullProblem = await api.getProblem(p.id);
      setSelectedProblem(fullProblem);
      setCode(fullProblem.starter_code || '# Write solution:\n');
      setExecResult(null);
      setEvaluation(null);
      setCurrentHintTier(0);
      setRevealedHint('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRun = async () => {
    if (!selectedProblem) return;
    setIsRunning(true);
    try {
      const res = await api.executeCode({
        code,
        problem_id: selectedProblem.id,
      });
      setExecResult(res);

      if (res.all_passed) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }

      // Socratic AI Evaluation
      const evalRes = await api.evaluateCode({
        code,
        concept_key: selectedProblem.category,
        challenge_description: selectedProblem.description,
        error_message: res.stderr || res.error_message,
        stdout: res.stdout,
      });
      setEvaluation(evalRes);
    } catch (err) {
      console.error('Run failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleHint = async (tier: number) => {
    if (!selectedProblem) return;
    try {
      const hintObj = await api.getHint({
        tier,
        concept_key: selectedProblem.category,
        current_code: code,
        problem_id: selectedProblem.id,
      });
      setCurrentHintTier(tier);
      setRevealedHint(hintObj.content);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Code2 className="h-6 w-6 text-emerald-500" />
            <span>Problem Solving Arena</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curated problems mapped to Google, Amazon, and Microsoft interview patterns.
          </p>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex items-center space-x-1 rounded-xl border border-white/10 bg-slate-900/80 p-1 text-xs">
          {['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Interview'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                difficultyFilter === diff
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff || 'All Levels'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Problem Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Problem List & Problem Description */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-4 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Challenge Problems ({problems.length})
            </h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {problems.map((p) => {
                const isSelected = selectedProblem?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectProblem(p)}
                    className={`w-full p-3 rounded-2xl border text-left text-xs transition flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/20 text-white font-bold'
                        : 'border-white/5 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div>{p.title}</div>
                      <span className="text-[10px] text-slate-400 font-normal font-mono">
                        {p.category}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.difficulty === 'Easy' || p.difficulty === 'Beginner'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : p.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Problem Description */}
          {selectedProblem && (
            <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {selectedProblem.category}
                </span>
                <div className="flex items-center space-x-1">
                  {selectedProblem.company_tags?.map((c, i) => (
                    <span
                      key={i}
                      className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono font-semibold text-slate-300 border border-white/5"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="text-lg font-bold text-white">{selectedProblem.title}</h2>
              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedProblem.description}
              </p>

              {/* Hints Accordion */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <span>Hints</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleHint(t)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                          currentHintTier === t
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Tier {t}
                      </button>
                    ))}
                  </div>
                </div>

                {revealedHint && (
                  <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-950/20 text-xs font-mono text-amber-200 whitespace-pre-wrap leading-relaxed">
                    {revealedHint}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Code Editor, Terminal & Socratic Feedback */}
        <div className="lg:col-span-2 space-y-4">
          <CodeEditor
            code={code}
            onChange={setCode}
            onRun={handleRun}
            onReset={() => setCode(selectedProblem?.starter_code || '')}
            isRunning={isRunning}
            height="340px"
          />

          {/* Test Case Output Console */}
          <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Execution Results</span>
              </div>
              {execResult && (
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-slate-400">{execResult.execution_time_ms} ms</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      execResult.all_passed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {execResult.status} ({execResult.passed_count}/{execResult.total_count} Passed)
                  </span>
                </div>
              )}
            </div>

            {/* Test Results */}
            {execResult?.test_results && execResult.test_results.length > 0 && (
              <div className="space-y-2">
                {execResult.test_results.map((tr) => (
                  <div
                    key={tr.test_index}
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
                      tr.passed
                        ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-300'
                        : 'border-red-500/20 bg-red-950/20 text-red-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold mr-2">Test #{tr.test_index}:</span>
                      <span className="text-slate-400">Input: {tr.input}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Expected: {tr.expected}</span>
                      <span className="text-slate-500">|</span>
                      <span>Got: {tr.actual}</span>
                      {tr.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stdout / Stderr */}
            {execResult?.stdout && (
              <pre className="rounded-xl bg-slate-900/80 p-3 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap">
                {execResult.stdout}
              </pre>
            )}

            {execResult?.stderr && (
              <pre className="rounded-xl bg-red-950/30 p-3 text-xs font-mono text-red-300 overflow-x-auto whitespace-pre-wrap border border-red-500/20">
                {execResult.stderr}
              </pre>
            )}

            {/* Socratic Feedback Card */}
            {evaluation && (
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Teacher Feedback</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {evaluation.what_was_correct}
                </p>
                {!evaluation.is_correct && (
                  <p className="text-xs text-amber-300 italic">
                    💡 Hint: "{evaluation.socratic_hint}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
