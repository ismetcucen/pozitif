import { Outlet } from 'react-router-dom';
import CoachSidebar from './CoachSidebar';

export default function CoachLayout() {
  return (
    <div className="flex min-h-screen bg-[#0f172a] overflow-x-hidden text-left font-sans selection:bg-primary/20">
      
      {/* 1. ARKA PLAN DEKORASYONU (Dark Mode Style) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full animate-pulse-slow delay-1000" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(15,23,42,0.6)_100%)]" />
      </div>

      {/* 2. SIDEBAR - FIXED */}
      <CoachSidebar />

      {/* 3. MAIN CONTENT - WITH SCROLLABLE CONTAINER */}
      <main className="flex-1 ml-[72px] lg:ml-72 transition-all duration-500 relative z-10">
        <div className="max-w-[1400px] mx-auto p-10 min-h-screen overflow-x-hidden animate-fade-in no-scrollbar">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}
