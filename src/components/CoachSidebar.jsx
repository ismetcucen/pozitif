import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, Video, ListTodo, CheckSquare, 
  MessageSquareText, LineChart, Bot, BookOpen,
  LayoutDashboard, LogOut, ChevronLeft, ChevronRight,
  Shield, BrainCircuit
} from 'lucide-react';
import { auth } from '../firebase';
import clsx from 'clsx';

const menuItems = [
  { icon: LayoutDashboard, label: 'Panelim', path: '/coach/dashboard' },
  { icon: Users, label: 'Öğrenciler', path: '/coach/students' },
  { icon: ListTodo, label: 'Haftalık Plan', path: '/coach/weekly-plan' },
  { icon: CheckSquare, label: 'Görevler', path: '/coach/tasks' },
  { icon: Video, label: 'Canlı Dersler', path: '/coach/live-lessons' },
  { icon: LineChart, label: 'Deneme Analizi', path: '/coach/exams' },
  { icon: BookOpen, label: 'Kaynaklar', path: '/coach/library' },
  { icon: MessageSquareText, label: 'Görüşmeler', path: '/coach/notes' },
  { icon: Bot, label: 'Yapay Zeka Hedef Karşılaştırma', path: '/coach/university' },
  { icon: Shield, label: 'Admin Paneli', path: '/admin-panel' },
];

export default function CoachSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className={clsx(
      "h-screen bg-slate-900 border-r border-white/5 transition-all duration-500 fixed left-0 top-0 z-[100] flex flex-col",
      collapsed ? "w-24" : "w-72"
    )}>
      {/* LOGO AREA */}
      <div className="p-8 flex items-center justify-between border-b border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <div>
               <span className="text-lg font-black text-white tracking-tighter uppercase block leading-none">Pozitif Koç</span>
               <span className="text-[10px] font-bold text-textMuted truncate max-w-[150px] block mt-1 leading-none italic">{auth.currentUser?.displayName || 'Eğitmen'}</span>
            </div>
          </div>
        )}
        {collapsed && (
           <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
             <BrainCircuit className="text-white w-5 h-5" />
           </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-4 px-5 py-4 rounded-xl transition-all group relative overflow-hidden",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-textMuted hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-bold tracking-tight uppercase italic">{item.label}</span>
            )}
            
            {/* HOVER TOOLTIP FOR COLLAPSED */}
            {collapsed && (
               <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200] border border-white/10 shadow-2xl">
                  {item.label}
               </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* BOTTOM AREA */}
      <div className="p-6 border-t border-white/5 space-y-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all shadow-inner"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <div className="flex items-center gap-3 italic font-bold uppercase text-[10px] tracking-widest"><ChevronLeft className="w-4 h-4" />Sidebar'ı Küçült</div>}
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-bold uppercase italic tracking-tight">Oturumu Kapat</span>}
        </button>
      </div>
    </aside>
  );
}
