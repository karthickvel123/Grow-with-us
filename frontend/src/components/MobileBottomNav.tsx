import React from 'react';
import { LayoutDashboard, BookOpen, Code2, Users, BookX } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreviewedMistakesCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreviewedMistakesCount = 0,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: Code2 },
    { id: 'interview', label: 'Interview', icon: Users },
    { id: 'mistakes', label: 'Mistakes', icon: BookX, badge: unreviewedMistakesCount > 0 ? unreviewedMistakesCount : undefined },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-white/10 bg-[#0e1422]/95 backdrop-blur-lg px-2 lg:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
