import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, Lightbulb, Compass, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface AITeacherDockProps {
  currentCode?: string;
  conceptKey?: string;
}

export const AITeacherDock: React.FC<AITeacherDockProps> = ({ currentCode, conceptKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'teacher' | 'user'; text: string; action?: string }>>([
    {
      sender: 'teacher',
      text: "Hello! I am your CodePath AI teacher. How can I guide you today? Feel free to ask about any Python concept, error message, or algorithmic pattern.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await api.teacherChat({
        message: textToSend,
        current_code: currentCode,
        concept_key: conceptKey,
      });

      setMessages([
        ...newMsgs,
        {
          sender: 'teacher',
          text: res.reply,
          action: res.suggested_action,
        },
      ]);
    } catch {
      setMessages([
        ...newMsgs,
        {
          sender: 'teacher',
          text: "I had a brief connection glitch. In the meantime, try dry-running your code with an example test case!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 flex items-center space-x-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white shadow-xl shadow-blue-500/30 transition hover:scale-105 hover:from-blue-500 hover:to-indigo-500 active:scale-95"
        >
          <div className="relative">
            <Bot className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-bold">Ask AI Teacher</span>
        </button>
      )}

      {/* Floating Chat Dock Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex h-[520px] w-[370px] sm:w-[420px] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0f172a]/95 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 px-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>CodePath AI Tutor</span>
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-300">
                    Socratic
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Context: {conceptKey || 'General Python'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Questions Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto border-b border-white/5 bg-slate-900/40 p-2 text-[11px]">
            <button
              onClick={() => handleSend("Explain this concept using a real-world analogy")}
              className="flex-shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-blue-300 hover:bg-blue-500/20 transition flex items-center space-x-1"
            >
              <Lightbulb className="h-3 w-3" />
              <span>Real Analogy</span>
            </button>
            <button
              onClick={() => handleSend("Why is my code producing an error or wrong output?")}
              className="flex-shrink-0 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-purple-300 hover:bg-purple-500/20 transition flex items-center space-x-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Check Logic</span>
            </button>
            <button
              onClick={() => handleSend("What is the time and space complexity?")}
              className="flex-shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300 hover:bg-amber-500/20 transition flex items-center space-x-1"
            >
              <Compass className="h-3 w-3" />
              <span>Big-O</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-white/10 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                {m.action && (
                  <div className="mt-1 flex items-center space-x-1 text-[10px] text-emerald-400 font-medium">
                    <Sparkles className="h-3 w-3" />
                    <span>Next: {m.action}</span>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span>Teacher is thinking Socratically...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="border-t border-white/10 bg-[#0f172a] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your programming teacher..."
                className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
