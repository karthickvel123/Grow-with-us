import React from 'react';
import {
  LayoutDashboard, BookOpen, Code2, Users, Building2,
  BookX, CalendarClock, BarChart3, GraduationCap, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreviewedMistakesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreviewedMistakesCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learn', label: 'Learn & Roadmap', icon: BookOpen },
    { id: 'practice', label: 'Practice Arena', icon: Code2 },
    { id: 'interview', label: 'Interview Mode', icon: Users },
    { id: 'companies', label: 'Company Tracks', icon: Building2 },
    {
      id: 'mistakes',
      label: 'Mistake Notebook',
      icon: BookX,
      badge: unreviewedMistakesCount > 0 ? unreviewedMistakesCount : undefined
    },
    { id: 'revision', label: 'Spaced Revision', icon: CalendarClock },
    { id: 'analytics', label: 'Progress Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-[#0e1422] p-4 text-slate-300 min-h-[calc(100vh-4rem)]">
      <div className="mb-4 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Navigation
      </div>
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Philosophy Card in Sidebar */}
      <div className="mt-auto rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-slate-900/60 p-4">
        <div className="flex items-center space-x-2 text-blue-400 mb-2">
          <GraduationCap className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Teaching Rule</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          We prioritize <strong>understanding + retention</strong> over simply clicking through answers. Think through each hint!
        </p>
      </div>
    </aside>
  );
};
