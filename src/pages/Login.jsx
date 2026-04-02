import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  Lock, Mail, User, Phone, 
  ArrowRight, Sparkles, BrainCircuit, 
  ShieldCheck, Zap, Bot, CheckCircle2,
  ChevronRight, LayoutDashboard, Target, Users
} from 'lucide-react';
import clsx from 'clsx';

export default function Login({ mode }) {
  const [currentMode, setCurrentMode] = useState(mode || null);
  const isStudent = currentMode === 'student';
  
  const [isLogin, setIsLogin] = useState(true);
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
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
        const userData = userDoc.data();
        
        if (isStudent && userData?.role !== 'student') {
          throw new Error('Bu giriş sadece öğrencilere özeldir.');
        }
        if (!isStudent && !['coach', 'admin', 'super_admin', 'kurucu'].includes(userData?.role)) {
          throw new Error('Bu giriş sadece koçlara özeldir.');
        }

        if (['admin', 'super_admin', 'kurucu'].includes(userData?.role)) {
          navigate('/admin-panel');
        } else if (userData?.role === 'student') {
          navigate('/student/dashboard');
        } else {
          navigate('/coach/dashboard');
        }
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          name, email, phone, role: 'pending', createdAt: new Date().toISOString()
        });
        if (isStudent) {
           await setDoc(doc(db, 'pending_students', userCred.user.uid), {
             name, email, phone, type: 'registration', createdAt: new Date().toISOString()
           });
           alert('Öğrenci başvurunuz alındı. Koç onayı sonrası sisteme erişebilirsiniz.');
        } else {
           await setDoc(doc(db, 'pending_coaches', userCred.user.uid), {
             name, email, phone, type: 'coach_application', createdAt: new Date().toISOString()
           });
           alert('Koç başvurunuz alındı. Sistem yöneticisi onayı sonrası panelinize erişebilirsiniz.');
        }
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message === 'Firebase: Error (auth/invalid-credential).' ? 'E-posta veya şifre hatalı.' : err.message);
    }
    setLoading(false);
  };

  // SEÇİM EKRANI (Mode yoksa) - SaaS STYLE
  if (!currentMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
         <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50" />
         
         <div className="w-full max-w-4xl text-center z-10 space-y-12 animate-fade-in">
            <div className="space-y-4">
               <h1 className="text-5xl md:text-6xl font-black text-textPrimary tracking-tighter uppercase leading-none">Pozitif <span className="text-glow-soft text-primary italic">Koç</span></h1>
               <p className="text-textSecondary text-xl font-semibold uppercase tracking-widest leading-relaxed">Hangi Kapıdan Girmek İstersiniz?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <button onClick={() => setCurrentMode('student')} className="p-16 bg-white border border-slate-200 rounded-saas-lg shadow-soft hover:shadow-premium hover:-translate-y-2 transition-all group flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Target className="w-10 h-10 text-primary" /></div>
                  <span className="text-3xl font-black text-textPrimary uppercase tracking-tighter">ÖĞRENCİ GİRİŞİ</span>
               </button>
               <button onClick={() => setCurrentMode('coach')} className="p-16 bg-white border border-slate-200 rounded-saas-lg shadow-soft hover:shadow-premium hover:-translate-y-2 transition-all group flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Users className="w-10 h-10 text-slate-400 group-hover:text-primary transition-colors" /></div>
                  <span className="text-3xl font-black text-slate-400 uppercase tracking-tighter group-hover:text-textPrimary transition-colors">KOÇ GİRİŞİ</span>
               </button>
            </div>
            
            <button onClick={() => navigate('/')} className="text-xs font-bold text-textMuted uppercase tracking-widest hover:text-primary transition-colors">Ana Sayfaya Dön</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden selection:bg-primary/20">
      
      <div className="w-full max-w-6xl grid grid-cols-1 xl:grid-cols-2 bg-white border border-slate-200 rounded-saas-lg shadow-premium relative z-10 overflow-hidden animate-slide-up">
        
        {/* SOL PANEL: GİRİŞ FORMU */}
        <div className="p-12 xl:p-20 flex flex-col justify-center text-left">
           <div className="flex items-center gap-4 mb-12">
              <button onClick={() => setCurrentMode(null)} className="p-2 hover:bg-slate-50 rounded-lg transition-colors mr-2">
                 <ArrowRight className="w-5 h-5 text-textSecondary rotate-180" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-button">
                 <BrainCircuit className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-textPrimary tracking-tight uppercase">Pozitif Koç</h2>
           </div>

           <div className="space-y-4 mb-10">
              <h1 className="text-4xl md:text-5xl font-black text-textPrimary tracking-tight leading-none uppercase">
                 {isLogin ? (isStudent ? 'Öğrenci Girişi' : 'Koç Girişi') : (isStudent ? 'Öğrenci Kaydı' : 'Koç Başvurusu')}
              </h1>
              <p className="text-textSecondary text-lg font-medium leading-relaxed">
                 {isStudent ? 'Başarıya giden yolda dijital asistanın seni bekliyor.' : 'Öğrencilerinin geleceğini buradan inşa etmeye başla.'}
              </p>
           </div>

           {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-saas flex items-center gap-4 text-red-600 text-sm font-bold animate-fade-in italic">
                 <ShieldCheck className="w-6 h-6" /> {error}
              </div>
           )}

           <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-textSecondary uppercase tracking-widest pl-1">TAM ADINIZ</label>
                     <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-saas py-5 pl-14 pr-6 text-sm font-bold text-textPrimary outline-none focus:border-primary focus:bg-white transition-all shadow-inner" placeholder="Ad Soyad..." />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-textSecondary uppercase tracking-widest pl-1">TELEFON</label>
                     <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-saas py-5 pl-14 pr-6 text-sm font-bold text-textPrimary outline-none focus:border-primary focus:bg-white transition-all shadow-inner" placeholder="05XX XXX XX XX" />
                     </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                 <label className="text-xs font-bold text-textSecondary uppercase tracking-widest pl-1">E-POSTA ADRESİ</label>
                 <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-saas py-5 pl-14 pr-6 text-sm font-bold text-textPrimary outline-none focus:border-primary focus:bg-white transition-all shadow-inner" placeholder="ornek@eposta.com" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-textSecondary uppercase tracking-widest pl-1">ŞİFRE</label>
                 <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-saas py-5 pl-14 pr-6 text-sm font-bold text-textPrimary outline-none focus:border-primary focus:bg-white transition-all shadow-inner" placeholder="••••••••" />
                 </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-6 rounded-saas bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-button hover:bg-primaryHover transition-all flex items-center justify-center gap-3 active:scale-95">
                 {loading ? 'KİMLİK KONTRÖL EDİLİYOR...' : (isLogin ? 'PANELİME GİRİŞ YAP' : 'BAŞVURUYU TAMAMLA')} <ArrowRight className="w-5 h-5" />
              </button>
           </form>

           <div className="mt-12 pt-10 border-t border-slate-100 flex items-center justify-center gap-4">
              <p className="text-xs font-bold text-textMuted uppercase tracking-widest opacity-60">{isLogin ? 'Henüz hesabınız yok mu?' : 'Zaten üye misiniz?'}</p>
              <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:text-primaryHover transition-colors uppercase text-xs tracking-widest"> {isLogin ? 'Bugün Başvuru Yap' : 'Hemen Giriş Yap'} </button>
           </div>
        </div>

        {/* SAĞ PANEL: MODER MOTİVASYON */}
        <div className="hidden xl:flex bg-slate-50 p-20 flex-col justify-between relative overflow-hidden group border-l border-slate-100">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-[3s]" />
           
           <div className="relative z-10">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-10 shadow-soft">
                 {isStudent ? <Target className="text-primary w-8 h-8 animate-pulse" /> : <Users className="text-primary w-8 h-8 animate-pulse" />}
              </div>
              <h3 className="text-5xl font-black text-textPrimary tracking-tight leading-none mb-6 italic uppercase">
                 {isStudent ? 'Gelecek \n Seni Bekliyor.' : 'Liderlik \n Zamanı.'}
              </h3>
              <p className="text-textSecondary text-xl font-medium leading-relaxed max-w-sm">
                 {isStudent ? 'AI destekli rehberlik ve anlık takip sistemimizle gerçek potansiyelini keşfetmeye hazır mısın?' : 'Koç paneli üzerinden tüm öğrencilerinin gelişimini ve net analizlerini profesyonelce yönet.'}
              </p>
           </div>

           <div className="relative z-10 space-y-6">
              {[
                { icon: CheckCircle2, text: 'Kişiselleştirilmiş Program' },
                { icon: CheckCircle2, text: 'Anlık Deneme Analizi' },
                { icon: CheckCircle2, text: 'Kesintisiz Koç İletişimi' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-xs font-bold text-textSecondary uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-500 delay-[100ms]">
                   <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary shadow-soft"><item.icon className="w-4 h-4" /></div>
                   {item.text}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
