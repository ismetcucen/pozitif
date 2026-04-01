import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, CheckSquare, LineChart, BrainCircuit, BookOpen, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Öğrenci Yönetimi', path: '/students' },
  { icon: Calendar, label: 'Ders Planı', path: '/schedule' },
  { icon: CheckSquare, label: 'Görevler', path: '/tasks' },
  { icon: LineChart, label: 'Deneme Analizi', path: '/exams' },
  { icon: BrainCircuit, label: 'Yapay Zekâ', path: '/ai' },
  { icon: BookOpen, label: 'Kütüphane', path: '/library' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-panel border-r-0 border-l-0 border-y-0 rounded-none border-r border-border/40 flex flex-col pt-6 pb-6 px-4 z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-wide">Pozitif Koç</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium whitespace-nowrap",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-inner" 
                  : "text-textMuted hover:bg-surfaceHover hover:text-text"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-textMuted hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 font-medium">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
