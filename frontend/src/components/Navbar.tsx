import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame, Award, Smartphone, Monitor, User as UserIcon,
  LogOut, Compass, Sparkles, CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileDeviceMode: boolean;
  setIsMobileDeviceMode: (val: boolean) => void;
  onOpenDiagnostic: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isMobileDeviceMode,
  setIsMobileDeviceMode,
  onOpenDiagnostic,
  onOpenAuth,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0e1422]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex cursor-pointer items-center space-x-3 transition hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20">
            <span className="font-mono text-xl font-black text-white">&gt;_</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">CodePath</span>
              <span className="rounded bg-gradient-to-r from-blue-500 to-cyan-500 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Zero to FAANG Teacher</p>
          </div>
        </div>

        {/* Center: Quick Stats if logged in */}
        {user && (
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{user.streak_days} Day Streak</span>
            </div>

            <div className="flex items-center space-x-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              <Award className="h-4 w-4 text-blue-400" />
              <span>Stage {user.current_stage}: {user.current_level}</span>
            </div>

            <button
              onClick={onOpenDiagnostic}
              className="flex items-center space-x-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20"
            >
              <Compass className="h-3.5 w-3.5 text-purple-400" />
              <span>Assessment</span>
            </button>
          </div>
        )}

        {/* Right: Mode Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Mobile Phone / Desktop Simulator Switcher */}
          <button
            onClick={() => setIsMobileDeviceMode(!isMobileDeviceMode)}
            title="Toggle between Web App View and Mobile Phone Container"
            className="flex items-center space-x-1.5 rounded-lg border border-white/10 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
          >
            {isMobileDeviceMode ? (
              <>
                <Monitor className="h-4 w-4 text-cyan-400" />
                <span className="hidden sm:inline">Web View</span>
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 text-blue-400" />
                <span className="hidden sm:inline">Mobile App View</span>
              </>
            )}
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">{user.full_name}</span>
                <span className="text-[10px] text-slate-400">{user.target_company} Track</span>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-slate-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
