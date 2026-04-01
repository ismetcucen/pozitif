import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, Calendar, CheckSquare, LineChart, Zap, BookOpen, LogOut, User, Key, Eye, Award } from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import clsx from 'clsx';

const navItems = [
  { icon: Layout, label: 'Çalışma Masası',  path: '/student/dashboard' },
  { icon: Award,  label: 'Liderlik Tablosu', path: '/student/leaderboard' },
  { icon: Eye,    label: 'Veli Görünümü',   path: '/student/parent' },
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
      // Firestore'daki password alanını da güncelle (Koçun sıfırlama işlevi çalışsın diye)
      try {
        await updateDoc(doc(db, 'students', auth.currentUser.uid), { password: newPass });
      } catch (_) { /* Koç hesabıysa students'ta belge olmayabilir, yok say */ }
      alert('Şifreniz başarıyla güncellendi!');
    } catch(err) {
      alert('Hata oluştu: Güvenlik nedeniyle şifre değiştirmek için sisteme yakın zamanda giriş yapmış olmanız gerekir. Lütfen çıkış yapıp tekrar girdikten sonra deneyin.');
    }
  };

  return (
    <aside className={clsx(
      "fixed left-0 top-0 h-screen w-64 glass-panel border-r-0 border-l-0 border-y-0 rounded-none border-r border-border/40 flex flex-col pt-6 pb-6 px-4 z-50 transition-transform duration-300 md:translate-x-0 bg-[#0a0a0b] md:bg-opacity-80 backdrop-blur-xl",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col items-center gap-2 mb-10 mt-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-blue-500 flex items-center justify-center shadow-lg shadow-secondary/30">
          <User className="text-white w-8 h-8" />
        </div>
        <div className="text-center mt-2">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-500 tracking-wide">Pozitif Koç</h1>
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded-full">Öğrenci Paneli</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium whitespace-nowrap",
                isActive 
                  ? "bg-secondary/10 text-secondary border border-secondary/20 shadow-inner" 
                  : "text-textMuted hover:bg-surfaceHover hover:text-text"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        <button onClick={handleChangePassword} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-textMuted hover:bg-surfaceHover hover:text-white transition-all duration-300 font-medium cursor-pointer">
          <Key className="w-5 h-5 flex-shrink-0" />
          <span>Şifre Değiştir</span>
        </button>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300 font-medium cursor-pointer">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Oturumu Kapat</span>
        </button>
      </div>
    </aside>
  );
}
