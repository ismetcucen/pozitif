import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, Video, ListTodo, CheckSquare, 
  MessageSquareText, LineChart, Bot, BookOpen,
  LayoutDashboard, LogOut, ChevronLeft, ChevronRight,
  Shield, BrainCircuit, Wallet, Settings, Plus
} from 'lucide-react';
import { auth } from '../firebase';
import clsx from 'clsx';

const menuItems = [
  { icon: LayoutDashboard, label: 'Panelim', path: '/coach/dashboard' },
  { icon: Users, label: 'Öğrenciler', path: '/coach/students' },
  { icon: ListTodo, label: 'Haftalık Program', path: '/coach/weekly-plan' },
  { icon: Wallet, label: 'Ödeme Takibi', path: '/coach/payments' },
  { icon: Video, label: 'Canlı Dersler', path: '/coach/live-lessons' },
  { icon: BookOpen, label: 'Kaynaklar', path: '/coach/library' },
  { icon: MessageSquareText, label: 'Görüşmeler', path: '/coach/appointments' },
  { icon: Bot, label: 'Yapay Zeka Hedef Karşılaştırma', path: '/coach/university' },
  { icon: Settings, label: 'Sistem Ayarları', path: '/coach/settings' },
  { icon: Shield, label: 'Admin Paneli', path: '/coach/admin-dashboard' },
];

export default function CoachSidebar({ isOpen, onClose }) {
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
    <>
      {/* Desktop sidebar */}
      <aside className={clsx(
        "h-screen bg-surface border-r border-borderLight transition-all duration-300 fixed left-0 top-0 z-[100] flex-col hidden lg:flex",
        collapsed ? "w-24" : "w-72"
      )}>
        {/* LOGO AREA */}
        <div className="p-8 flex items-center justify-between border-b border-borderLight/50">
          {!collapsed && (
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0">
                <Plus className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
              <div>
                 <span className="text-base font-semibold text-textPrimary tracking-tight block leading-none">Pozitif Koç</span>
                 <span className="text-xs font-medium text-textSecondary truncate max-w-[150px] block mt-1.5 leading-none">{auth.currentUser?.displayName || 'Eğitmen'}</span>
              </div>
            </div>
          )}
          {collapsed && (
             <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mx-auto shadow-sm animate-fade-in">
               <Plus className="w-6 h-6 text-white" strokeWidth={3} />
             </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => clsx(
                "flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all group relative",
                isActive 
                  ? "bg-secondary/10 text-secondary font-medium" 
                  : "text-textSecondary hover:bg-section hover:text-textPrimary"
              )}
            >
              <item.icon className={clsx("w-5 h-5 flex-shrink-0 transition-colors", "group-hover:text-textPrimary")} />
              {!collapsed && (
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              )}
              
              {collapsed && (
                 <div className="absolute left-full ml-2 px-3 py-2 bg-textPrimary text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[200] shadow-premium">
                    {item.label}
                 </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM AREA */}
        <div className="p-5 border-t border-borderLight/50 space-y-3">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-3 rounded-lg text-textSecondary hover:bg-section hover:text-textPrimary transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <div className="flex items-center gap-2 text-xs font-medium tracking-wide"><ChevronLeft className="w-4 h-4" />Daralt</div>}
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium tracking-wide">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer sidebar */}
      <aside className={clsx(
        "fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-72 bg-surface border-r border-borderLight z-[100] flex flex-col lg:hidden transition-transform duration-300 shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-borderLight/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm">
            <Plus className="text-white w-5 h-5" strokeWidth={3} />
          </div>
          <div>
            <span className="text-sm font-semibold text-textPrimary tracking-tight block leading-none">Pozitif Koç</span>
            <span className="text-xs font-medium text-textSecondary block mt-1">{auth.currentUser?.displayName || 'Eğitmen'}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive 
                  ? "bg-secondary/10 text-secondary font-medium" 
                  : "text-textSecondary hover:bg-section hover:text-textPrimary"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-borderLight/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}

