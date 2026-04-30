import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import { Menu, X } from 'lucide-react';
import { StudentNotifications } from './NotificationSystem';
import { useAuth } from '../context/AuthContext';

export default function StudentLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-x-hidden">

      {/* Mobile Sticky Header */}
      <div className="md:hidden sticky top-0 left-0 right-0 h-16 bg-surface border-b border-borderLight flex items-center justify-between px-6 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-xs">PK</span>
          </div>
          <h1 className="text-base font-bold text-textPrimary tracking-tight">PozitifKoç</h1>
        </div>
        <div className="flex items-center gap-3">
          <StudentNotifications studentId={currentUser?.uid} />
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-textPrimary p-2 focus:outline-none rounded-lg hover:bg-section transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <StudentSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Overlay for mobile when menu is open */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={() => setMenuOpen(false)} />
      )}

      <main className="flex-1 md:ml-64 relative z-10 w-full overflow-hidden bg-background">
        <div className="max-w-[1600px] mx-auto w-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
