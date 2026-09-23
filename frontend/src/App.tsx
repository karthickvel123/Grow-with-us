import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AITeacherDock } from './components/AITeacherDock';
import { DiagnosticModal } from './components/DiagnosticModal';
import { AuthModal } from './components/AuthModal';

import { DashboardView } from './views/DashboardView';
import { LearnView } from './views/LearnView';
import { LessonStudioView } from './views/LessonStudioView';
import { PracticeView } from './views/PracticeView';
import { InterviewView } from './views/InterviewView';
import { CompanyPrepView } from './views/CompanyPrepView';
import { MistakesView } from './views/MistakesView';
import { RevisionView } from './views/RevisionView';
import { AnalyticsView } from './views/AnalyticsView';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [interviewTopic, setInterviewTopic] = useState<string | null>(null);
  const [isMobileDeviceMode, setIsMobileDeviceMode] = useState<boolean>(false);
  const [showDiagnostic, setShowDiagnostic] = useState<boolean>(false);
  const [showAuth, setShowAuth] = useState<boolean>(false);

  const handleSelectLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
    setActiveTab('lesson_studio');
  };

  const handleCompleteLesson = () => {
    setActiveTab('learn');
  };

  const handleStartTopicInterview = (topic: string) => {
    setInterviewTopic(topic);
    setActiveTab('interview');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileDeviceMode={isMobileDeviceMode}
        setIsMobileDeviceMode={setIsMobileDeviceMode}
        onOpenDiagnostic={() => setShowDiagnostic(true)}
        onOpenAuth={() => setShowAuth(true)}
      />

      {/* Main Body */}
      <div className={`flex-1 flex ${isMobileDeviceMode ? 'items-center justify-center p-4 bg-slate-950/90' : ''}`}>
        {/* Mobile Device Mockup Frame (when Mobile View mode is toggled) */}
        <div
          className={
            isMobileDeviceMode
              ? 'relative w-full max-w-[420px] h-[840px] rounded-[44px] border-[10px] border-slate-800 bg-[#0b0f19] overflow-hidden shadow-2xl flex flex-col'
              : 'flex-1 flex w-full'
          }
        >
          {/* Mobile Bezel speaker bar */}
          {isMobileDeviceMode && (
            <div className="h-6 w-full bg-slate-900 flex items-center justify-center relative select-none">
              <div className="w-20 h-4 bg-slate-950 rounded-b-xl flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>
            </div>
          )}

          <div className="flex-1 flex w-full overflow-hidden">
            {/* Desktop Sidebar (hidden in mobile mode or phone screens) */}
            {!isMobileDeviceMode && (
              <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                unreviewedMistakesCount={1}
              />
            )}

            {/* View Content Viewport */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigate={(tab, lessonId, topic) => {
                    if (topic) setInterviewTopic(topic);
                    if (lessonId) handleSelectLesson(lessonId);
                    else setActiveTab(tab);
                  }}
                  onOpenDiagnostic={() => setShowDiagnostic(true)}
                />
              )}

              {activeTab === 'learn' && (
                <LearnView onSelectLesson={handleSelectLesson} />
              )}

              {activeTab === 'lesson_studio' && (
                <LessonStudioView
                  lessonId={selectedLessonId || 1}
                  onBack={() => setActiveTab('learn')}
                  onCompleteLesson={handleCompleteLesson}
                  onStartTopicInterview={handleStartTopicInterview}
                />
              )}

              {activeTab === 'practice' && <PracticeView />}

              {activeTab === 'interview' && (
                <InterviewView
                  initialTopic={interviewTopic}
                  onClearTopic={() => setInterviewTopic(null)}
                  onReturnToDashboard={() => setActiveTab('dashboard')}
                />
              )}

              {activeTab === 'companies' && (
                <CompanyPrepView onPracticeCompany={() => setActiveTab('practice')} />
              )}

              {activeTab === 'mistakes' && (
                <MistakesView onPracticeTopic={() => setActiveTab('practice')} />
              )}

              {activeTab === 'revision' && (
                <RevisionView onPracticeTopic={() => setActiveTab('learn')} />
              )}

              {activeTab === 'analytics' && <AnalyticsView />}
            </main>
          </div>

          {/* Mobile Bottom Navigation (shown on mobile or when mobile simulator is enabled) */}
          {(isMobileDeviceMode || window.innerWidth < 1024) && (
            <MobileBottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              unreviewedMistakesCount={1}
            />
          )}
        </div>
      </div>

      {/* Floating Socratic AI Teacher Dock (available everywhere) */}
      <AITeacherDock />

      {/* Diagnostic Assessment Modal */}
      <DiagnosticModal
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
        onAssessmentCompleted={(_level, stage) => {
          setActiveTab('learn');
        }}
      />

      {/* Auth Modal (Login / Register / Demo) */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
