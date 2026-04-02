import { Outlet } from 'react-router-dom';
import CoachSidebar from './CoachSidebar';

export default function CoachLayout() {
  return (
    <div className="flex min-h-screen bg-white overflow-x-hidden text-left font-sans selection:bg-blue-100">
      
      {/* 1. ARKA PLAN DEKORASYONU (High Contrast SaaS) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-50/50 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-sky-50/50 blur-[100px] rounded-full" />
      </div>

      {/* 2. SIDEBAR - FIXED */}
      <CoachSidebar />

      {/* 3. MAIN CONTENT - WITH SCROLLABLE CONTAINER */}
      <main className="flex-1 ml-[72px] lg:ml-72 transition-all duration-500 relative z-10 bg-white">
        <div className="max-w-[1400px] mx-auto p-4 md:p-10 min-h-screen overflow-x-hidden animate-fade-in no-scrollbar">
           <Outlet />
        </div>
      </main>
      
    </div>
  );
}
