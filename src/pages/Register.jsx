import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../modules/auth/AuthService';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { 
  Mail, Lock, User, UserCheck,
  GraduationCap, Briefcase, ArrowRight, Sparkles, Plus,
  Search, CheckCircle2, Clock, ChevronRight, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// ─── Adım 1: Bilgiler ─── Adım 2 (sadece öğrenci): Koç Seçimi ───

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode') === 'coach' ? 'coach' : 'student';

  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(1); // 1 = form, 2 = koç seçimi (sadece öğrenci)
  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState([]);
  const [coachSearch, setCoachSearch] = useState('');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [botCheck] = useState({
    q: `${Math.floor(Math.random() * 10)} + ${Math.floor(Math.random() * 10)}`,
    answer: ''
  });
  const [botAnswer, setBotAnswer] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Koçları çek
  useEffect(() => {
    if (step === 2) {
      getDocs(query(collection(db, 'users'), where('role', '==', 'coach')))
        .then(snap => setCoaches(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }
  }, [step]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!agreedToTerms) return toast.error('Lütfen Kullanıcı Sözleşmesi ve KVKK metnini onaylayın.');
    const [n1, n2] = botCheck.q.split(' + ').map(Number);
    if (parseInt(botAnswer) !== n1 + n2) return toast.error('Bot doğrulaması hatalı!');
    if (formData.password !== formData.confirmPassword) return toast.error('Şifreler eşleşmiyor!');
    if (formData.password.length < 6) return toast.error('Şifre en az 6 karakter olmalıdır.');

    if (mode === 'student') {
      setStep(2); // Öğrenciyse koç seçim adımına geç
    } else {
      handleFinalRegister();
    }
  };

  const handleFinalRegister = async (skipCoach = false) => {
    setLoading(true);
    try {
      await authService.registerWithEmail(
        formData.email,
        formData.password,
        formData.name,
        mode,
        skipCoach ? null : selectedCoach
      );
      toast.success('🎉 Hesabınız başarıyla oluşturuldu! 7 günlük deneme süreniz başladı.');
      navigate(mode === 'coach' ? '/coach/dashboard' : '/student/dashboard/program');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Bu e-posta adresi zaten kullanımda! Lütfen giriş yapmayı deneyin.');
        setStep(1);
      } else {
        toast.error(err.message || 'Kayıt sırasında bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCoaches = coaches.filter(c =>
    (c.name || c.displayName || '').toLowerCase().includes(coachSearch.toLowerCase())
  );

  // ── ADIM 2: Koç Seçimi ─────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm mb-3">
              <Plus className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">PozitifKoç</h1>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bir Koç Seç <span className="text-gray-400 font-normal text-sm">(İsteğe Bağlı)</span></h2>
              <p className="text-gray-500 text-sm mt-1">Bir koçla çalışmak istiyorsan seçebilirsin. Sonra da bağlanabilirsin.</p>
            </div>

            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Koç ara..."
                value={coachSearch}
                onChange={e => setCoachSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Koç Listesi */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredCoaches.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Koç bulunamadı.</p>
                </div>
              ) : filteredCoaches.map(coach => (
                <button
                  key={coach.id}
                  onClick={() => setSelectedCoach(coach)}
                  className={clsx(
                    "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                    selectedCoach?.id === coach.id
                      ? "border-gray-900 bg-gray-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {(coach.name || coach.displayName || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{coach.name || coach.displayName || 'İsimsiz Koç'}</p>
                    <p className="text-xs text-gray-500">{coach.email}</p>
                  </div>
                  {selectedCoach?.id === coach.id && (
                    <CheckCircle2 className="w-5 h-5 text-gray-900 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Seçili Koç Özeti */}
            {selectedCoach && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-gray-700">
                  Seçilen: <span className="font-bold text-gray-900">{selectedCoach.name || selectedCoach.displayName}</span>
                </p>
                <button onClick={() => setSelectedCoach(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Deneme Bilgisi */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>7 günlük ücretsiz deneme</strong> başlıyor. Tüm AI ve premium özelliklere erişebilirsin. Süre sonunda ücretsiz plana geçersin.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Geri
              </button>
              <button
                onClick={() => handleFinalRegister(!selectedCoach)}
                disabled={loading}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'OLUŞTURULUYOR...' : (
                  <>{selectedCoach ? 'Koçla Başla' : 'Koçsuz Başla'} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ADIM 1: Kayıt Formu ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm mb-4">
            <Plus className="w-7 h-7 text-white" strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">PozitifKoç</h1>
          <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest mt-1">Eğitim Platformu</p>
        </div>

        {/* Kart */}
        <div className="bg-white p-8 space-y-6 border border-gray-200 rounded-2xl shadow-sm">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Hesap Oluştur</h2>
            <p className="text-gray-500 text-sm">Başarıya ilk adımı at.</p>
          </div>

          {/* Mod Seçici */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button onClick={() => setMode('student')} className={clsx("flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2", mode === 'student' ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700")}>
              <GraduationCap className="w-4 h-4" /> Öğrenci
            </button>
            <button onClick={() => setMode('coach')} className={clsx("flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2", mode === 'coach' ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700")}>
              <Briefcase className="w-4 h-4" /> Koç
            </button>
          </div>

          {/* Öğrenci Trial Bilgisi */}
          {mode === 'student' && (
            <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700 leading-relaxed">
                <strong>7 gün ücretsiz deneme</strong> — Tüm AI özelliklerine erişim, koç bağlantısı ve gelişim analizi dahil.
              </p>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="text" placeholder="Ad Soyad" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-6 py-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="email" placeholder="E-posta Adresi" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-6 py-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="password" placeholder="Şifre" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-6 py-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
            </div>
            <div className="relative">
              <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input required type="password" placeholder="Şifreyi Onayla" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-6 py-3.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all" />
            </div>

            {/* Bot Check */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-4">
              <div className="text-xs font-semibold text-gray-500">DOĞRULAMA: <span className="text-gray-900 font-bold ml-2">{botCheck.q} = ?</span></div>
              <input type="number" required value={botAnswer} onChange={e => setBotAnswer(e.target.value)} className="w-20 bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="?" />
            </div>

            {/* KVKK */}
            <div className="flex items-start gap-3 p-2">
              <input type="checkbox" id="kvkk" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="mt-0.5 w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-900" />
              <label htmlFor="kvkk" className="text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed">
                Platforma kayıt olarak <button type="button" onClick={() => toast('Kullanıcı Sözleşmesi')} className="text-gray-900 font-bold hover:underline">Kullanıcı Sözleşmesi</button>'ni ve <button type="button" onClick={() => toast('KVKK Aydınlatma Metni')} className="text-gray-900 font-bold hover:underline">KVKK Aydınlatma Metni</button>'ni okuduğumu kabul ederim.
              </label>
            </div>

            <button type="submit" className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
              {mode === 'student' ? (
                <>İleri: Koç Seç <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Hesabımı Oluştur <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs font-medium text-gray-500">
              Zaten hesabın var mı? <button onClick={() => navigate('/login')} className="text-gray-900 font-semibold hover:underline">Giriş Yap</button>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-gray-400">
          <div className="flex items-center gap-1.5 text-xs font-semibold"><Sparkles className="w-4 h-4" /> AI Destekli</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold"><UserCheck className="w-4 h-4" /> Güvenli Kayıt</div>
        </div>
      </div>
    </div>
  );
}
