import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  Lock, Mail, User, Phone, 
  ArrowRight, Sparkles, BrainCircuit, Plus,
  ShieldCheck, Zap, Bot, CheckCircle2,
  ChevronRight, LayoutDashboard, Target, Users
} from 'lucide-react';
import clsx from 'clsx';

export default function Login({ mode }) {
  const [currentMode, setCurrentMode] = useState(mode || null);
  const isStudent = currentMode === 'student';
  
  const isLogin = true;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (mode) setCurrentMode(mode);
  }, [mode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        // Önce users koleksiyonuna bak
        const userDoc = await getDoc(doc(db, 'users', uid));
        const userData = userDoc.exists() ? userDoc.data() : null;

        let effectiveRole = userData?.role || null;

        // users'da rol yoksa students koleksiyonuna bak
        if (!effectiveRole) {
          const studentDoc = await getDoc(doc(db, 'students', uid));
          if (studentDoc.exists()) {
            effectiveRole = 'student';
          }
        }

        const coachRoles = ['coach', 'admin', 'super_admin', 'kurucu'];

        if (isStudent && coachRoles.includes(effectiveRole)) {
          throw new Error('Bu giriş sadece öğrencilere özeldir.');
        }
        if (!isStudent && !coachRoles.includes(effectiveRole)) {
          throw new Error('Bu giriş sadece koçlara özeldir.');
        }

        if (['admin', 'super_admin', 'kurucu'].includes(effectiveRole)) {
          navigate('/admin-panel');
        } else if (effectiveRole === 'student' || (!effectiveRole && isStudent)) {
          navigate('/student/dashboard');
        } else {
          navigate('/coach/dashboard');
        }
      }
    } catch (err) {
      const msg = err.message === 'Firebase: Error (auth/invalid-credential).' ? 'E-posta veya şifre hatalı.' : err.message;
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Lütfen önce sıfırlama linki gönderilecek e-posta adresinizi yukarıya girin.');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! Lütfen gelen kutunuzu (ve spam/gereksiz klasörünü) kontrol edin.');
    } catch (err) {
      toast.error('Bağlantı gönderilemedi. Bu e-posta ile kayıtlı bir hesap olmayabilir.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-gray-200">
         
         <div className="w-full max-w-4xl text-center z-10 space-y-12 animate-fade-in px-4">
            <div className="space-y-4">
               <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">PozitifKoç</h1>
               <p className="text-lg text-gray-500 font-medium">Hangi Kapıdan Girmek İstersiniz?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto">
               <button onClick={() => setCurrentMode('student')} className="p-8 md:p-12 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all group flex flex-col items-center gap-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors"><Target className="w-8 h-8 text-blue-600" /></div>
                  <span className="text-xl md:text-2xl font-bold text-gray-900">ÖĞRENCİ</span>
               </button>
               <button onClick={() => setCurrentMode('coach')} className="p-8 md:p-12 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all group flex flex-col items-center gap-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 transition-colors"><Users className="w-8 h-8 text-gray-600 group-hover:text-gray-900 transition-colors" /></div>
                  <span className="text-xl md:text-2xl font-bold text-gray-600 group-hover:text-gray-900 transition-colors">KOÇ</span>
               </button>
            </div>
            
            <button onClick={() => navigate('/')} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Ana Sayfaya Dön</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6 relative overflow-hidden selection:bg-primary/20">
      
      <div className="w-full max-w-6xl grid grid-cols-1 xl:grid-cols-2 bg-white border border-slate-200 rounded-saas-lg shadow-premium relative z-10 overflow-hidden animate-slide-up">
        
        {/* SOL PANEL (FORMS) */}
        <div className="p-8 md:p-12 xl:p-20 flex flex-col justify-center text-left">
           <div className="flex items-center gap-3 mb-10">
              <button onClick={() => setCurrentMode(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                 <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm shrink-0">
                 <Plus className="text-white w-6 h-6" strokeWidth={3} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">PozitifKoç</h2>
           </div>

           <div className="space-y-2 mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                 {isLogin ? (isStudent ? 'Öğrenci Girişi' : 'Koç Girişi') : (isStudent ? 'Öğrenci Kaydı' : 'Koç Başvurusu')}
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                 {isStudent ? 'Başarıya giden yolda asistanın seni bekliyor.' : 'Öğrencilerinin gelişimini buradan yönet.'}
              </p>
           </div>

           {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium animate-fade-in">
                 <ShieldCheck className="w-5 h-5 shrink-0" /> {error}
              </div>
           )}

           <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">E-POSTA ADRESİ</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-6 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" placeholder="ornek@eposta.com" />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <div className="flex items-center justify-between pl-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ŞİFRE</label>
                    <button type="button" onClick={handleResetPassword} disabled={loading} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Şifremi Unuttum?</button>
                 </div>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-6 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" placeholder="••••••••" />
                 </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 mt-2 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                 {loading ? 'KONTROL EDİLİYOR...' : 'GİRİŞ YAP'} <ArrowRight className="w-4 h-4" />
              </button>
           </form>

           <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
              <p className="text-sm font-medium text-gray-500">
                 Henüz hesabınız yok mu? <button onClick={() => navigate(`/register?mode=${currentMode}`)} className="text-gray-900 font-bold hover:underline ml-1">Kayıt Ol</button>
              </p>
           </div>
        </div>

        {/* SAĞ PANEL (Görsel - Mobilde Gizli) */}
        <div className="hidden xl:flex bg-gray-50 p-16 flex-col justify-center relative overflow-hidden group border-l border-gray-100">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 blur-[80px] rounded-full" />
           
           <div className="relative z-10 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-8 shadow-sm">
                 {isStudent ? <Target className="text-blue-600 w-8 h-8" /> : <Users className="text-blue-600 w-8 h-8" />}
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                 {isStudent ? 'Gelecek Seni Bekliyor.' : 'Liderlik Zamanı.'}
              </h3>
              <p className="text-gray-500 text-lg font-medium leading-relaxed mb-10">
                 {isStudent ? 'AI destekli rehberlik ve anlık takip sistemimizle potansiyelini keşfet.' : 'Öğrencilerinin gelişimini ve analizlerini profesyonelce yönet.'}
              </p>
              
              <div className="space-y-4">
                 {[
                   { text: 'Kişiselleştirilmiş Program' },
                   { text: 'Anlık Deneme Analizi' },
                   { text: 'Sürekli Koç İletişimi' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                      <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 shadow-sm"><CheckCircle2 className="w-4 h-4" /></div>
                      {item.text}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
