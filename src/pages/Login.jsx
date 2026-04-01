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

  if (!currentMode) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
         <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
         <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full animate-pulse-slow delay-1000" />
         
         <div className="w-full max-w-4xl text-center z-10 space-y-12 animate-fade-in">
            <div className="space-y-4">
               <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Pozitif <span className="text-glow text-primary">Koç</span></h1>
               <p className="text-textMuted text-xl font-medium italic opacity-60 italic uppercase tracking-widest">Hangi Kapıdan Girmek İstersiniz?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <button onClick={() => setCurrentMode('student')} className="p-16 bg-primary border-b-8 border-primaryHover rounded-[3.5rem] shadow-[0_0_50px_rgba(107,76,255,0.3)] hover:scale-105 transition-all group flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center"><Target className="w-10 h-10 text-white" /></div>
                  <span className="text-3xl font-black text-white italic uppercase tracking-tighter">ÖĞRENCİ GİRİŞİ</span>
               </button>
               {/* Madde: Koç Girişi Güncellemesi */}
               <button onClick={() => setCurrentMode('coach')} className="p-16 bg-white/5 border border-white/10 border-b-8 border-white/10 rounded-[3.5rem] hover:bg-white/10 hover:scale-105 transition-all group flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center"><Users className="w-10 h-10 text-white/40 group-hover:text-white" /></div>
                  <span className="text-3xl font-black text-white/40 italic uppercase tracking-tighter group-hover:text-white">KOÇ GİRİŞİ</span>
               </button>
            </div>
            
            <button onClick={() => navigate('/')} className="text-[10px] font-black text-textMuted uppercase tracking-widest italic hover:text-white">Ana Sayfaya Dön</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-primary/20">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full animate-pulse-slow delay-1000" />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 xl:grid-cols-2 bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-2xl relative z-10 overflow-hidden group">
        
        <div className="p-12 xl:p-20 flex flex-col justify-center text-left">
           <div className="flex items-center gap-4 mb-12">
              <button onClick={() => setCurrentMode(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors mr-2">
                 <ArrowRight className="w-5 h-5 text-textMuted rotate-180" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
                 <BrainCircuit className="text-white w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Pozitif Koç</h2>
           </div>

           <div className="space-y-4 mb-10">
              {/* Madde: Koç Girişi Güncellemesi */}
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none">
                 {isLogin ? (isStudent ? 'Öğrenci Girişi' : 'Koç Girişi') : (isStudent ? 'Öğrenci Kaydı' : 'Koç Başvurusu')}
              </h1>
              <p className="text-textMuted text-lg font-medium opacity-60 leading-relaxed italic">
                 {isStudent ? 'Başarıya giden yolda dijital asistanın seni bekliyor.' : 'Öğrencilerinin geleceğini buradan inşa etmeye başla.'}
              </p>
           </div>

           {error && (
              <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400 text-sm font-bold animate-fade-in italic">
                 <ShieldCheck className="w-6 h-6" /> {error}
              </div>
           )}

           <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">TAM ADINIZ</label>
                     <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted opacity-50" />
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white italic outline-none focus:border-primary transition-all shadow-inner" placeholder="Ad Soyad..." />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">TELEFON</label>
                     <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted opacity-50" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white italic outline-none focus:border-primary transition-all shadow-inner" placeholder="05XX XXX XX XX" />
                     </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">E-POSTA ADRESİ</label>
                 <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted opacity-50" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white italic outline-none focus:border-primary transition-all shadow-inner" placeholder="ornek@eposta.com" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">ŞİFRE</label>
                 <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted opacity-50" />
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-white italic outline-none focus:border-primary transition-all shadow-inner" placeholder="••••••••" />
                 </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-6 rounded-[2.5rem] bg-primary text-white font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(107,76,255,0.4)] hover:scale-102 transition-all italic flex items-center justify-center gap-3 active:scale-95">
                 {loading ? 'DİJİTAL KİMLİK KONTROL EDİLİYOR...' : (isLogin ? 'PANELİME GİRİŞ YAP' : 'BAŞVURUYU TAMAMLA')} <ArrowRight className="w-5 h-5" />
              </button>
           </form>

           <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-center gap-4">
              <p className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50">{isLogin ? 'Henüz hesabınız yok mu?' : 'Zaten üye misiniz?'}</p>
              <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-primary hover:text-white transition-colors">{isLogin ? 'Başvuru Yap' : 'Giriş Yap'}</button>
           </div>
        </div>

        {/* SAĞ PANEL: MOTİVASYON */}
        <div className="hidden xl:flex bg-gradient-to-br from-primary to-blue-900 p-20 flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-[3s]" />
           
           <div className="relative z-10">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-10 shadow-2xl">
                 {isStudent ? <Target className="text-white w-8 h-8 animate-pulse" /> : <Users className="text-white w-8 h-8 animate-pulse" />}
              </div>
              <h3 className="text-5xl font-bold text-white tracking-tight leading-none mb-4 group-hover:text-glow transition-all uppercase italic">
                 {isStudent ? 'Gelecek \n Seni Bekliyor.' : 'Liderlik \n Zamanı.'}
              </h3>
              <p className="text-white/60 text-xl font-medium leading-relaxed max-w-sm italic">
                 {isStudent ? 'AI destekli rehberlik ve anlık takip sistemimizle gerçek potansiyelini keşfetmeye hazır mısın?' : 'Koç paneli üzerinden tüm öğrencilerinin gelişimini ve net analizlerini profesyonelce yönet.'}
              </p>
           </div>

           <div className="relative z-10 space-y-6">
              {[
                { icon: CheckCircle2, text: 'Kişiselleştirilmiş Haftalık Planlama' },
                { icon: CheckCircle2, text: 'Anlık Deneme ve Net Analizi' },
                { icon: CheckCircle2, text: 'Koçunuzla Kesintisiz İletişim' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-white font-black text-[10px] uppercase tracking-widest italic opacity-80 group-hover:translate-x-2 transition-transform duration-500 delay-[100ms]">
                   <div className="w-6 h-6 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400 group-hover:text-white transition-all"><item.icon className="w-4 h-4" /></div>
                   {item.text}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
