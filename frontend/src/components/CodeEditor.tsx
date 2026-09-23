import React, { useRef } from 'react';
import { Play, RotateCcw, Copy, Check, Terminal } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (val: string) => void;
  onRun: () => void;
  onReset?: () => void;
  isRunning?: boolean;
  height?: string;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onRun,
  onReset,
  isRunning = false,
  height = '320px',
  readOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  const lines = code.split('\n');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Run shortcut: Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }

    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newCode);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const target = textareaRef.current;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    const newCode = code.substring(0, start) + snippet + code.substring(end);
    onChange(newCode);

    setTimeout(() => {
      target.focus();
      target.selectionStart = target.selectionEnd = start + snippet.length;
    }, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mobileShortcuts = [
    { label: 'Tab', insert: '    ' },
    { label: ':', insert: ':' },
    { label: '(', insert: '()' },
    { label: '[', insert: '[]' },
    { label: '{', insert: '{}' },
    { label: '"', insert: '""' },
    { label: '=', insert: ' = ' },
    { label: '==', insert: ' == ' },
    { label: 'def', insert: 'def ' },
    { label: 'return', insert: 'return ' },
    { label: 'if', insert: 'if ' },
    { label: 'for', insert: 'for ' },
    { label: 'in', insert: ' in ' },
  ];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d121f] shadow-xl">
      {/* Top Editor Toolbar */}
      <div className="flex h-11 items-center justify-between border-b border-white/10 bg-[#121829] px-4">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 text-xs font-mono font-medium text-slate-400">solution.py</span>
          <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-400 border border-blue-500/20">
            Python 3.13 Sandbox
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onReset && (
            <button
              onClick={onReset}
              title="Reset starter code"
              className="flex items-center space-x-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            title="Copy code"
            className="flex items-center space-x-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
          >
            <Play className={`h-3.5 w-3.5 fill-white ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Code (Ctrl+↵)'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex overflow-auto font-mono text-sm leading-6" style={{ height }}>
        {/* Line numbers gutter */}
        <div className="select-none border-r border-white/10 bg-[#0d121f] py-3 px-3 text-right text-xs text-slate-600 font-mono">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="flex-1 resize-none bg-transparent py-3 px-4 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 outline-none caret-blue-400 selection:bg-blue-600/40"
          placeholder="# Write your Python solution here..."
        />
      </div>

      {/* Mobile-Friendly Syntax Quick Toolbar */}
      <div className="flex items-center space-x-1.5 overflow-x-auto border-t border-white/10 bg-[#121829] px-3 py-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-500 select-none mr-1 flex items-center">
          <Terminal className="h-3 w-3 mr-1" /> Quick:
        </span>
        {mobileShortcuts.map((sc, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => insertSnippet(sc.insert)}
            className="flex-shrink-0 rounded-md border border-white/10 bg-slate-800/80 px-2 py-1 text-xs font-mono font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition active:scale-95"
          >
            {sc.label}
          </button>
        ))}
      </div>
    </div>
  );
};
