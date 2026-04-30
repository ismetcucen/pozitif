import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { secondaryAuth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import StudentDashboard from './student/StudentDashboard';
import StudentLayout from '../components/StudentLayout';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Plus, X } from 'lucide-react';

// Bu sayfa, secondaryAuth ile giriş yapılmış öğrencinin panelini koç oturumunu kapatmadan gösterir.
export default function StudentPreview() {
  const navigate = useNavigate();
  const [secondaryUser, setSecondaryUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(secondaryAuth, async (user) => {
      if (user) {
        setSecondaryUser(user);
        try {
          const snap = await getDoc(doc(db, 'students', user.uid));
          if (snap.exists()) {
            setUserData(snap.data());
            setStudentName(snap.data().name || user.email);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // Secondary auth oturumu yoksa bu sekme anlamsız, kapat
        setSecondaryUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-indigo-400 font-bold animate-pulse">
        Öğrenci paneli yükleniyor...
      </div>
    );
  }

  if (!secondaryUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4 text-white p-8 text-center">
        <Plus className="w-12 h-12 text-indigo-400" strokeWidth={3} />
        <h2 className="text-2xl font-bold">Öğrenci oturumu bulunamadı</h2>
        <p className="text-slate-400 max-w-sm">
          Bu sayfa yalnızca koç panelinden "Öğrenci Panelini Aç" butonuyla erişilebilir.
        </p>
        <button 
          onClick={() => window.close()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Sekmeyi Kapat
        </button>
      </div>
    );
  }

  // secondaryAuth user'ını sanki currentUser gibi bir context değeriyle sunuyoruz
  const fakeAuthValue = {
    currentUser: secondaryUser,
    userRole: 'student',
    userData: userData,
    loading: false,
  };

  return (
    <AuthContext.Provider value={fakeAuthValue}>
      {/* Koç Görüntüleme Banneri */}
      <div className="sticky top-0 z-[9999] bg-amber-500 text-amber-950 flex items-center justify-between px-4 py-2.5 shadow-lg">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Plus className="w-4 h-4" strokeWidth={3} />
          <span>KOÇ GÖRÜNTÜLEME MODU — {studentName} olarak giriş yapıldı</span>
        </div>
        <button
          onClick={() => {
            secondaryAuth.signOut();
            window.close();
          }}
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Çıkış Yap & Kapat
        </button>
      </div>

      {/* Öğrenci panelinin tamamını göster - Sidebar ve İçerik */}
      <div className="bg-[#0a0a0b] min-h-screen">
        <StudentLayout previewMode={true} />
      </div>
    </AuthContext.Provider>
  );
}
