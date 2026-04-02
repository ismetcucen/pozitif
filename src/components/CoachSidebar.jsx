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
      "h-screen bg-white border-r-2 border-slate-100 transition-all duration-500 fixed left-0 top-0 z-[100] flex flex-col shadow-soft",
      collapsed ? "w-24" : "w-72"
    )}>
      {/* LOGO AREA */}
      <div className="p-8 flex items-center justify-between border-b-2 border-slate-50">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-button">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <div>
               <span className="text-lg font-black text-slate-900 tracking-tighter uppercase block leading-none">Pozitif Koç</span>
               <span className="text-[10px] font-bold text-blue-600 truncate max-w-[150px] block mt-1 leading-none italic">{auth.currentUser?.displayName || 'Eğitmen'}</span>
            </div>
          </div>
        )}
        {collapsed && (
           <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto shadow-button">
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
              "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative overflow-hidden",
              isActive 
                ? "bg-blue-600 text-white shadow-button" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-black tracking-tight uppercase italic">{item.label}</span>
            )}
            
            {/* HOVER TOOLTIP FOR COLLAPSED */}
            {collapsed && (
               <div className="absolute left-full ml-4 px-4 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200] shadow-2xl border border-white/10">
                  {item.label}
               </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* BOTTOM AREA */}
      <div className="p-6 border-t-2 border-slate-50 space-y-4">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center h-14 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 hover:bg-white hover:border-blue-600/30 transition-all shadow-inner"
        >
          {collapsed ? <ChevronRight className="w-6 h-6" /> : <div className="flex items-center gap-3 italic font-black uppercase text-[10px] tracking-widest"><ChevronLeft className="w-4 h-4" />Menüyü Küçült</div>}
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all border-2 border-transparent"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-black uppercase italic tracking-tight">Oturumu Kapat</span>}
        </button>
      </div>
    </aside>
  );
}
