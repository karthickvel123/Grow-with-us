import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Lightbulb, HelpCircle, CheckCircle2, XCircle,
  Play, Terminal, Sparkles, BookOpen, Key, AlertTriangle, ShieldCheck,
  ChevronRight, Award, Lock
} from 'lucide-react';
import { api } from '../services/api';
import { CodeEditor } from '../components/CodeEditor';
import { LessonDetail, CodeExecutionResult, CodeEvaluation, HintData } from '../types';
import confetti from 'canvas-confetti';

interface LessonStudioViewProps {
  lessonId: number;
  onBack: () => void;
  onCompleteLesson?: () => void;
  onStartTopicInterview?: (topic: string, track?: string) => void;
}

export const LessonStudioView: React.FC<LessonStudioViewProps> = ({
  lessonId,
  onBack,
  onCompleteLesson,
  onStartTopicInterview,
}) => {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'explanation' | 'hints' | 'feedback' | 'mastery'>('explanation');
  
  // Interactive question state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [interactiveResult, setInteractiveResult] = useState<{ correct: boolean; explanation: string } | null>(null);

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [execResult, setExecResult] = useState<CodeExecutionResult | null>(null);
  const [evaluation, setEvaluation] = useState<CodeEvaluation | null>(null);

  // Hint state
  const [currentTier, setCurrentTier] = useState<number>(0);
  const [revealedHints, setRevealedHints] = useState<Record<number, HintData>>({});
  const [loadingHint, setLoadingHint] = useState<boolean>(false);

  // Mastery Check state
  const [masteryCode, setMasteryCode] = useState<string>('');
  const [masteryPassed, setMasteryPassed] = useState<boolean>(false);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const data = await api.getLesson(lessonId);
      setLesson(data);
      setCode(data.starter_code || '# Write your solution below:\n');
      setMasteryCode(data.mastery_check_starter || '# Mastery check:\n');
      setSelectedOption(null);
      setInteractiveResult(null);
      setExecResult(null);
      setEvaluation(null);
      setCurrentTier(0);
      setRevealedHints({});
      setMasteryPassed(false);
      setActiveTab('explanation');
    } catch (err) {
      console.error('Failed to load lesson:', err);
    }
  };

  const handleCheckInteractive = async (opt: string) => {
    if (!lesson) return;
    setSelectedOption(opt);
    try {
      const res = await api.checkInteractive(lesson.id, opt);
      setInteractiveResult(res);
      if (res.correct) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunCode = async (isMastery = false) => {
    if (!lesson) return;
    setIsRunning(true);
    const activeCode = isMastery ? masteryCode : code;

    try {
      const res = await api.executeCode({
        code: activeCode,
        lesson_id: lesson.id,
        is_mastery_check: isMastery,
      });
      setExecResult(res);

      if (res.all_passed) {
        if (isMastery) {
          setMasteryPassed(true);
        }
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }

      // Automatically request Socratic AI evaluation
      const evalRes = await api.evaluateCode({
        code: activeCode,
        concept_key: lesson.concept_key,
        challenge_description: isMastery ? lesson.mastery_check_prompt : lesson.coding_challenge,
        error_message: res.stderr || res.error_message,
        stdout: res.stdout,
      });
      setEvaluation(evalRes);
      if (!res.all_passed) {
        setActiveTab('feedback');
      }
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleUnlockHint = async (tier: number) => {
    if (!lesson) return;
    setLoadingHint(true);
    try {
      const hint = await api.getHint({
        tier,
        concept_key: lesson.concept_key,
        current_code: code,
        lesson_id: lesson.id,
      });
      setRevealedHints((prev) => ({ ...prev, [tier]: hint }));
      setCurrentTier(tier);
      setActiveTab('hints');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHint(false);
    }
  };

  if (!lesson) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400 text-xs">
        Loading CodePath Lesson Studio...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Curriculum</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                Stage {lesson.stage_number}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] text-slate-400 font-mono capitalize">
                {lesson.concept_key.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{lesson.title}</h1>
          </div>
        </div>

        {/* Tab Navigation for Left Panel */}
        <div className="flex items-center space-x-1 rounded-xl border border-white/10 bg-slate-900/80 p-1 text-xs">
          <button
            onClick={() => setActiveTab('explanation')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === 'explanation' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`relative rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === 'feedback' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Feedback
            {evaluation && !evaluation.is_correct && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('hints')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === 'hints' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hints ({currentTier}/4)
          </button>
          <button
            onClick={() => setActiveTab('mastery')}
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${
              activeTab === 'mastery' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mastery Check
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT PANEL: Concept Explanation / Analogy / Hints / Feedback */}
        <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-6 sm:p-7 backdrop-blur-md space-y-6 overflow-y-auto max-h-[750px]">
          {/* TAB 1: Concept Explanation & Analogy */}
          {activeTab === 'explanation' && (
            <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300">
              {/* Concept Text */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>Concept Explanation</span>
                </h3>
                <p className="text-slate-200 leading-relaxed font-normal">
                  {lesson.concept_explanation}
                </p>
              </div>

              {/* Real-World Analogy Card */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-slate-900/60 p-4 sm:p-5 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Lightbulb className="h-4 w-4" />
                  <span>Real-World Analogy</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm italic leading-relaxed">
                  "{lesson.real_world_analogy}"
                </p>
              </div>

              {/* Code Example */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Python Code Demonstration
                </span>
                <pre className="rounded-2xl border border-white/10 bg-[#0a0d14] p-4 font-mono text-xs text-blue-300 overflow-x-auto leading-5">
                  {lesson.code_example}
                </pre>
              </div>

              {/* Interactive Check Question */}
              {lesson.interactive_question && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
                  <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
                    <HelpCircle className="h-4 w-4" />
                    <span>Quick Comprehension Check</span>
                  </div>
                  <p className="text-xs font-semibold text-white">{lesson.interactive_question}</p>

                  <div className="space-y-2">
                    {lesson.interactive_options.map((opt, i) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={i}
                          onClick={() => handleCheckInteractive(opt)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                            isSelected
                              ? interactiveResult?.correct
                                ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                                : 'border-red-500 bg-red-950/30 text-red-300'
                              : 'border-white/5 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && interactiveResult && (
                            interactiveResult.correct ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 ml-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 ml-2" />
                            )
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {interactiveResult && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium ${
                        interactiveResult.correct
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {interactiveResult.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Socratic AI Feedback */}
          {activeTab === 'feedback' && (
            <div className="space-y-5">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Sparkles className="h-4 w-4" />
                <span>AI Socratic Code Evaluation</span>
              </div>

              {evaluation ? (
                <div className="space-y-4">
                  {evaluation.detected_misconception && (
                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-xs text-purple-300 flex items-center justify-between">
                      <span className="font-semibold">Detected Concept:</span>
                      <span className="font-bold text-white">{evaluation.detected_misconception}</span>
                    </div>
                  )}

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-1">
                    <h4 className="text-xs font-bold text-emerald-400">What was correct:</h4>
                    <p className="text-xs text-slate-300">{evaluation.what_was_correct}</p>
                  </div>

                  {!evaluation.is_correct && (
                    <>
                      <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4 space-y-1">
                        <h4 className="text-xs font-bold text-red-400">What went wrong:</h4>
                        <p className="text-xs text-slate-300">{evaluation.what_was_wrong}</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-1">
                        <h4 className="text-xs font-bold text-blue-400">Why Python did this:</h4>
                        <p className="text-xs text-slate-300">{evaluation.why_it_was_wrong}</p>
                      </div>

                      <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 space-y-1">
                        <h4 className="text-xs font-bold text-amber-400">How to improve:</h4>
                        <p className="text-xs text-slate-300">{evaluation.how_to_improve}</p>
                      </div>

                      <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-4 space-y-1">
                        <h4 className="text-xs font-bold text-blue-300">Socratic check question:</h4>
                        <p className="text-xs text-white italic">"{evaluation.socratic_hint}"</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Run your code in the sandbox to receive detailed Socratic evaluation and error diagnosis.
                </p>
              )}
            </div>
          )}

          {/* TAB 3: 5-Tier Hint System */}
          {activeTab === 'hints' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                    <Key className="h-4 w-4" />
                    <span>Progressive Hint Progression</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Never reveals solutions immediately. Unlock hints step-by-step.
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
                  Hints Used: {currentTier} / 4
                </span>
              </div>

              {/* Tiers 1 to 4 Buttons & Content */}
              <div className="space-y-3">
                {[1, 2, 3, 4].map((tier) => {
                  const hintObj = revealedHints[tier];
                  const tierLabels: Record<number, string> = {
                    1: "Hint 1: Conceptual Reminder",
                    2: "Hint 2: Approach & Strategy",
                    3: "Hint 3: Plain-English Pseudo-code",
                    4: "Hint 4: Partial Code Skeleton",
                  };

                  return (
                    <div key={tier} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{tierLabels[tier]}</span>
                        {!hintObj ? (
                          <button
                            onClick={() => handleUnlockHint(tier)}
                            disabled={loadingHint || (tier > 1 && !revealedHints[tier - 1])}
                            className="rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1 text-xs font-semibold transition disabled:opacity-40"
                          >
                            {tier > 1 && !revealedHints[tier - 1] ? 'Unlock previous first' : 'Unlock Hint'}
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400">Unlocked</span>
                        )}
                      </div>

                      {hintObj && (
                        <div className="pt-2 text-xs text-slate-200 border-t border-white/5 font-mono whitespace-pre-wrap leading-relaxed">
                          {hintObj.content}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Tier 5: Complete Solution Reveal */}
                <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-red-400">Final Solution (Emergency)</span>
                      <p className="text-[10px] text-slate-400">Revealing reduces mastery score for this session.</p>
                    </div>
                    {!revealedHints[5] ? (
                      <button
                        onClick={() => handleUnlockHint(5)}
                        disabled={loadingHint || currentTier < 2}
                        className="rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1 text-xs font-semibold transition disabled:opacity-40"
                      >
                        {currentTier < 2 ? 'Try 2 hints first' : 'Reveal Solution'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-red-400">Solution Revealed</span>
                    )}
                  </div>

                  {revealedHints[5] && (
                    <pre className="pt-2 text-xs text-emerald-300 font-mono whitespace-pre-wrap border-t border-white/5">
                      {revealedHints[5].content}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Mastery Check */}
          {activeTab === 'mastery' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Mastery Check: Secondary Verification</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Before advancing to the next lesson, verify retention by solving this parallel problem independently:
              </p>

              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 text-xs font-semibold text-white">
                {lesson.mastery_check_prompt}
              </div>

              <div className="space-y-2">
                <CodeEditor
                  code={masteryCode}
                  onChange={setMasteryCode}
                  onRun={() => handleRunCode(true)}
                  isRunning={isRunning}
                  height="220px"
                />
              </div>

              {masteryPassed && (
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 text-emerald-300 space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="font-bold text-xs sm:text-sm">Mastery Verified! Concept Marked Strong.</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-950/40 text-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                        Today's Mandatory Daily Verification
                      </span>
                      <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300 font-mono">FAANG Standard</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You coded and verified <strong>{lesson.title}</strong>! In major tech company interviews, you must articulate your mental model verbally. Attend today's 5-minute exit interview with the AI Interviewer before closing your session.
                    </p>
                    {onStartTopicInterview && (
                      <button
                        onClick={() => onStartTopicInterview(lesson.concept_key || lesson.title)}
                        className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition active:scale-95"
                      >
                        <span>🎙️ Attend Today's Exit Interview</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    {onCompleteLesson && (
                      <button
                        onClick={onCompleteLesson}
                        className="rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                      >
                        Return to Curriculum →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Coding Challenge & Test Results Console */}
        <div className="space-y-4">
          {/* Challenge Description Card */}
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5 backdrop-blur-md space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
              Coding Challenge
            </span>
            <p className="text-xs sm:text-sm font-medium text-white leading-relaxed">
              {lesson.coding_challenge}
            </p>
          </div>

          {/* Main Python Editor */}
          <CodeEditor
            code={code}
            onChange={setCode}
            onRun={() => handleRunCode(false)}
            onReset={() => setCode(lesson.starter_code || '')}
            isRunning={isRunning}
            height="340px"
          />

          {/* Terminal & Test Case Results Console */}
          <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Execution Console</span>
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

            {/* Test Case Badges */}
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
                      <span className="text-slate-400">Input: {tr.input || '(stdout)'}</span>
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

            {/* Stdout Output */}
            {execResult?.stdout && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Program Stdout:</span>
                <pre className="rounded-xl bg-slate-900/80 p-3 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap">
                  {execResult.stdout}
                </pre>
              </div>
            )}

            {/* Stderr Output */}
            {execResult?.stderr && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-red-400">Errors & Traceback:</span>
                <pre className="rounded-xl bg-red-950/30 p-3 text-xs font-mono text-red-300 overflow-x-auto whitespace-pre-wrap border border-red-500/20">
                  {execResult.stderr}
                </pre>
              </div>
            )}

            {!execResult && (
              <p className="text-xs font-mono text-slate-600 italic">
                Press "Run Code (Ctrl+Enter)" to execute your solution in the isolated sandbox.
              </p>
            )}

            {/* If Challenge Passed: Direct Action to Exit Interview */}
            {execResult?.all_passed && (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-blue-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Coding Challenge Passed!</span>
                    <span className="text-[11px] text-slate-300">
                      Attend today's exit interview on {lesson.title} to verify retention.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('mastery')}
                    className="rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    Mastery Check
                  </button>
                  {onStartTopicInterview && (
                    <button
                      onClick={() => onStartTopicInterview(lesson.concept_key || lesson.title)}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition active:scale-95 flex items-center space-x-1.5"
                    >
                      <span>🎙️ Exit Interview</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
