import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CoachSidebar from './CoachSidebar';
import NotificationBell from './NotificationBell';
import { Menu, X, Plus } from 'lucide-react';

import AIKeyWarning from './AIKeyWarning';

export default function CoachLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden text-left font-sans selection:bg-secondary/20">
      <AIKeyWarning />
      <div className="flex flex-1 relative">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-[110] shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shadow-sm">
            <Plus className="text-white w-5 h-5" strokeWidth={3} />
          </div>
          <span className="text-base font-bold text-slate-800 tracking-tight">Pozitif Koç</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 active:scale-95 transition-all"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {menuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[99]" 
          onClick={() => setMenuOpen(false)} 
        />
      )}

      {/* SIDEBAR */}
      <CoachSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 transition-all duration-300 relative z-10 w-full min-w-0">
        {/* Desktop top bar */}
        <div className="hidden lg:flex sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 md:px-10 py-3 justify-end">
          <NotificationBell />
        </div>
        <div className="max-w-7xl mx-auto p-4 pt-[72px] lg:pt-6 md:p-10 min-h-screen animate-fade-in no-scrollbar">
           <Outlet />
        </div>
     </main>
      </div>
    </div>
  );
}

