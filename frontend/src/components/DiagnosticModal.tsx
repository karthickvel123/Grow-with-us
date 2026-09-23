import React, { useState } from 'react';
import { X, Compass, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCompleted?: (level: string, stage: number) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  onAssessmentCompleted,
}) => {
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hasProgrammed, setHasProgrammed] = useState<boolean>(false);
  const [codeAdd, setCodeAdd] = useState<string>("def add(a, b):\n    # Return sum:\n    return a + b\n");
  const [codeEven, setCodeEven] = useState<string>("def is_even(n):\n    # Return True if even:\n    return n % 2 == 0\n");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const questions = [
    {
      id: 1,
      q: "Have you ever written code in any programming language before?",
      opts: [
        "No, I am completely new to programming",
        "A little bit (HTML, spreadsheets, or watched tutorials)",
        "Yes, I know basic syntax in another language (Java, C++, JS)",
        "Yes, I am experienced and want to specialize in Python & DSA",
      ],
    },
    {
      id: 2,
      q: "What is a variable in Python?",
      opts: [
        "A permanent hardware chip inside the CPU",
        "A labeled name in memory that stores a data value",
        "A mathematical function that can never be modified",
        "A comment used to explain code to other humans",
      ],
    },
    {
      id: 3,
      q: "What will print(type(4.5)) output in Python?",
      opts: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'decimal'>"],
    },
    {
      id: 4,
      q: "What sequence of numbers does range(1, 4) produce?",
      opts: ["[1, 2, 3, 4]", "[1, 2, 3]", "[0, 1, 2, 3]", "[2, 3, 4]"],
    },
    {
      id: 5,
      q: "What is the average time complexity of looking up a key in a Python dictionary?",
      opts: ["O(N)", "O(log N)", "O(1)", "O(N^2)"],
    },
  ];

  const handleSelectOption = (qId: number, opt: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: opt }));
    if (qId === 1) {
      setHasProgrammed(opt !== "No, I am completely new to programming");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.submitDiagnostic({
        has_programmed_before: hasProgrammed,
        answers: answers,
        code_solutions: {
          task_add: codeAdd,
          task_even: codeEven,
        },
      });
      setResult(res);
      setStep(3);
      await refreshUser();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // Fallback local diagnosis
      const fallback = {
        assessed_level: hasProgrammed ? "Elementary" : "Absolute Beginner",
        recommended_stage: hasProgrammed ? 1 : 0,
        score_percentage: 60,
        strengths: ["Clear logical thinking", "Ready to build Python instincts"],
        gaps: ["Advanced algorithms", "Time complexity"],
        personalized_roadmap_summary: "Starting at Stage 0 to build rock-solid Python fundamentals with guided Socratic lessons.",
      };
      setResult(fallback);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0f172a] shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Initial Diagnostic Assessment</h2>
            <p className="text-xs text-slate-400">
              {step === 1 && "Step 1 of 2: Conceptual Diagnostic Questions"}
              {step === 2 && "Step 2 of 2: Mini Code Evaluation Tasks"}
              {step === 3 && "Placement Result & Personalized Starting Point"}
            </p>
          </div>
        </div>

        {/* STEP 1: Conceptual Questions */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs font-semibold text-slate-200 mb-3">
                    <span className="text-blue-400 mr-2 font-mono">Q{idx + 1}.</span>
                    {q.q}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.opts.map((opt) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition border ${
                            isSelected
                              ? 'border-blue-500 bg-blue-600/20 text-blue-200 font-medium'
                              : 'border-white/5 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={Object.keys(answers).length < 3}
                className="flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition disabled:opacity-40"
              >
                <span>Continue to Code Tasks</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Mini Code Tasks */}
        {step === 2 && (
          <div className="space-y-5">
            <p className="text-xs text-slate-300">
              Write small Python solutions below. If you are a complete beginner, it's 100% okay to leave them as is — CodePath AI will tailor everything for you!
            </p>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                Task 1: Return sum of two numbers
              </label>
              <textarea
                value={codeAdd}
                onChange={(e) => setCodeAdd(e.target.value)}
                className="w-full h-24 rounded-xl border border-white/10 bg-[#0d121f] p-3 font-mono text-xs text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                Task 2: Check if number is even
              </label>
              <textarea
                value={codeEven}
                onChange={(e) => setCodeEven(e.target.value)}
                className="w-full h-24 rounded-xl border border-white/10 bg-[#0d121f] p-3 font-mono text-xs text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Back to Questions
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-500/20 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Calculate Placement</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Assessment Placement Results */}
        {step === 3 && result && (
          <div className="space-y-6 text-center sm:text-left">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Placement Complete
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Level: {result.assessed_level}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {result.personalized_roadmap_summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Demonstrated Strengths</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {result.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center space-x-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>Priority Focus Areas</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {result.gaps?.map((g: string, i: number) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onAssessmentCompleted) {
                    onAssessmentCompleted(result.assessed_level, result.recommended_stage);
                  }
                }}
                className="flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition"
              >
                <span>Launch Stage {result.recommended_stage} Curriculum</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
