import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Layout, TrendingUp, MessageSquare, Eye, Users,
  LogOut, Key, Plus, BrainCircuit, Zap
} from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import clsx from 'clsx';

const navItems = [
  { icon: Layout,        label: 'Akıllı Program',      path: '/student/dashboard/program' },
  { icon: Zap,           label: 'Odaklanma (Radar)',   path: '/student/focus' },
  { icon: BrainCircuit,  label: 'Deneme Analizi',       path: '/student/exam-analysis' },
  { icon: TrendingUp,    label: 'Gelişim & Analizler',  path: '/student/dashboard/exams' },
  { icon: MessageSquare, label: 'Koçumla Mesajlaş',     path: '/student/dashboard/mesaj' },
  { icon: Users,         label: 'Koç Dizini',            path: '/student/coaches' },
  { icon: Eye,           label: 'Veli Görünümü',        path: '/student/parent' },
];

export default function StudentSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    const newPass = window.prompt('Yeni şifrenizi girin (en az 6 karakter):');
    if (!newPass) return;
    if (newPass.length < 6) return alert('Şifre en az 6 karakter olmalıdır!');
    try {
      const { updatePassword } = await import('firebase/auth');
      await updatePassword(auth.currentUser, newPass);
      try {
        await updateDoc(doc(db, 'students', auth.currentUser.uid), { password: newPass });
      } catch (_) { /* ignore if no student doc */ }
      alert('Şifreniz başarıyla güncellendi!');
    } catch(err) {
      alert('Güvenlik nedeniyle şifre değiştirmek için sisteme yakın zamanda giriş yapmış olmanız gerekir. Lütfen çıkış yapıp tekrar girdikten sonra deneyin.');
    }
  };

  return (
    <aside className={clsx(
      "fixed left-0 top-0 h-screen w-64 bg-surface border-r border-borderLight flex flex-col pt-6 pb-6 px-4 z-50 transition-transform duration-300 md:translate-x-0 shadow-sm",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-10 mt-2 px-2">
        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0">
          <Plus className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
        <div>
          <span className="text-base font-semibold text-textPrimary tracking-tight block leading-none">PozitifKoç</span>
          <span className="text-xs font-medium text-textSecondary block mt-1 leading-none">Öğrenci Paneli</span>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm",
                isActive
                  ? "bg-secondary/10 text-secondary font-semibold"
                  : "text-textSecondary hover:bg-section hover:text-textPrimary"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* BOTTOM ACTIONS */}
      <div className="mt-auto space-y-1 border-t border-borderLight pt-4">
        <button onClick={handleChangePassword} className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-textSecondary hover:bg-section hover:text-textPrimary transition-all duration-200 text-sm font-medium cursor-pointer">
          <Key className="w-5 h-5 flex-shrink-0" />
          <span>Şifre Değiştir</span>
        </button>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200 text-sm font-medium cursor-pointer">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Oturumu Kapat</span>
        </button>
      </div>
    </aside>
  );
}
