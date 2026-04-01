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
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col md:flex-row overflow-x-hidden">
      {/* Background glowing orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/20 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* Mobile Sticky Header */}
      <div className="md:hidden sticky top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-border/40 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-blue-500 flex items-center justify-center">
             <span className="text-white font-bold text-xs">PK</span>
           </div>
           <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-500 tracking-wide">Pozitif Koç</h1>
        </div>
        <div className="flex items-center gap-3">
          <StudentNotifications studentId={currentUser?.uid} />
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-2 focus:outline-none">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      <StudentSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Overlay for mobile when menu is open */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30" onClick={() => setMenuOpen(false)} />
      )}
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 relative z-10 w-full overflow-hidden">
        <div className="max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
