import { useState, useEffect } from 'react';
import { 
  Play, Square, Clock, Target, BookOpen, Video, 
  RotateCcw, Sparkles, ChevronRight, CheckCircle2, 
  BrainCircuit, Zap, Flame, Loader2, Calendar, ChevronDown, Book
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { trackingEngine } from '../../modules/tracking/TrackingEngine';
import { gamificationService } from '../../modules/gamification/GamificationService';
import { YKS_SUBJECTS } from '../../data/yksSubjects';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const ACTIVITY_OPTIONS = [
  { id: 'study', label: 'Konu Çalışma', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'questions', label: 'Soru Çözümü', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'review', label: 'Tekrar', icon: RotateCcw, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'video', label: 'Video Ders', icon: Video, color: 'text-purple-500', bg: 'bg-purple-50' },
];

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function FocusMode() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Session States
  const [isStudying, setIsStudying] = useState(false);
  const [examType, setExamType] = useState('TYT'); // TYT, AYT, LGS
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [activityType, setActivityType] = useState('Konu Çalışma');
  const [focusDuration, setFocusDuration] = useState(25); // Dakika
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState('focus');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Derse göre konuları getir
  const currentSubjects = YKS_SUBJECTS[examType] || {};
  const topics = subject ? (currentSubjects[subject] || []) : [];

  // Gerçek zamanlı saat
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Başlangıçta Firestore'daki canlı durumu kontrol et ve seansı kurtar
  useEffect(() => {
    if (!currentUser) return;

    const unsubStatus = onSnapshot(doc(db, 'students', currentUser.uid), (d) => {
      if (d.exists()) {
        const data = d.data();
        setUserData(data);
        
        // Eğer veritabanında aktif bir çalışma varsa, UI'ı buna göre güncelle
        if (data.currentStatus?.isStudying) {
          setIsStudying(true);
          setSubject(data.currentStatus.subject || '');
          setTopic(data.currentStatus.topic || '');
          setActivityType(data.currentStatus.activityType || 'Konu Çalışma');
          
          const serverMode = data.currentStatus.timerMode || 'focus';
          const serverDuration = data.currentStatus.focusDuration || 25;
          
          setTimerMode(serverMode);
          setFocusDuration(serverDuration);
          
          // Kalan süreyi hesapla
          if (data.currentStatus.startedAt) {
            const startTime = data.currentStatus.startedAt.toDate();
            const now = new Date();
            const diffInSeconds = Math.floor((now - startTime) / 1000);
            const totalSeconds = serverMode === 'focus' ? serverDuration * 60 : 5 * 60;
            const remaining = Math.max(0, totalSeconds - (diffInSeconds % totalSeconds));
            setTimeLeft(remaining);
          }
          
          // TrackingEngine'i de güncelle (Hafızayı kurtar)
          if (!trackingEngine.activeSession) {
            trackingEngine.activeSession = {
              studentId: currentUser.uid,
              subject: data.currentStatus.subject,
              topic: data.currentStatus.topic,
              activityType: data.currentStatus.activityType,
              timerMode: serverMode,
              focusDuration: serverDuration,
              startTime: data.currentStatus.startedAt?.toDate() || new Date()
            };
          }
        } else {
          setIsStudying(false);
          trackingEngine.activeSession = null;
        }

        // Sınav türünü belirle
        if (data.field === 'LGS') setExamType('LGS');
        else if (data.field === 'YDT') setExamType('YDT');
        else setExamType('TYT');
      }
      setLoading(false);
    });

    const qPlans = query(collection(db, 'weeklyPlans'), where('studentId', '==', currentUser.uid));
    const unsubPlans = onSnapshot(qPlans, (snap) => {
      const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
      const allPlans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlans(allPlans.filter(p => p.day === today));
    });

    return () => { unsubStatus(); unsubPlans(); };
  }, [currentUser]);

  // Timer logic - timerMode değişimlerini takip et
  useEffect(() => {
    let interval = null;
    if (isStudying) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        setTimeLeft(prev => {
          if (prev <= 1) {
            const nextMode = timerMode === 'focus' ? 'break' : 'focus';
            const nextTime = nextMode === 'break' ? 5 * 60 : focusDuration * 60;
            
            toast.success(nextMode === 'break' ? 'Odaklanma Tamamlandı! 🎉' : 'Mola Bitti! Hazır mısın? 🚀');
            
            setTimerMode(nextMode);
            trackingEngine.updateTimerMode(currentUser.uid, nextMode);
            return nextTime;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
      setElapsedTime(0);
      setTimeLeft(focusDuration * 60);
      setTimerMode('focus');
    }
    return () => clearInterval(interval);
  }, [isStudying, timerMode, focusDuration]);

  const handleStartStudy = async (taskSubject, taskTopic) => {
    const finalSubject = taskSubject || subject;
    const finalTopic = taskTopic || topic;

    if (!finalSubject) return toast.error('Lütfen bir ders seçin.');
    if (!finalTopic) return toast.error('Lütfen bir konu seçin.');

    try {
      await trackingEngine.startSession(currentUser.uid, finalSubject, finalTopic, activityType, 'focus', focusDuration);
      setIsStudying(true);
      setSubject(finalSubject);
      setTopic(finalTopic);
      setTimerMode('focus');
      toast.success('Odaklanma seansı başladı!', { icon: '🎯' });
    } catch (err) {
      console.error('Start Study Error:', err);
      toast.error('Oturum başlatılamadı. Lütfen internet bağlantınızı kontrol edin.');
    }
  };

  const handleStopStudy = async () => {
    const session = await trackingEngine.stopSession();
    setIsStudying(false);
    if (session) {
      const xpAmount = gamificationService.calculateSessionXP(session.duration);
      await gamificationService.addXP(currentUser.uid, xpAmount, 'Çalışma Tamamlandı');
      toast.success(`${session.duration.toFixed(1)} dakika çalıştın ve ${xpAmount} XP kazandın!`, { icon: '🔥' });
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-secondary animate-spin" />
    </div>
  );

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* ── HEADER ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-textPrimary">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            Odaklanma Modu
          </h1>
          <p className="text-sm text-textSecondary font-medium pl-1">
            Müfredat entegreli, derin çalışma merkezi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Gerçek Zamanlı Saat */}
          <div className="bg-white border border-borderLight px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
            <Clock className="w-4 h-4 text-secondary" />
            <span className="text-sm font-black tabular-nums text-textPrimary">
              {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="bg-white border border-borderLight px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-textPrimary">{userData?.streak || 0} GÜN SERİ</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-borderLight p-1 rounded-xl shadow-sm">
            {['TYT', 'AYT', 'LGS'].map(type => (
              <button
                key={type}
                onClick={() => { setExamType(type); setSubject(''); setTopic(''); }}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  examType === type ? "bg-secondary text-white shadow-sm" : "text-textSecondary hover:bg-section"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ── SOL: RADAR & CONTROLS ───────────────────── */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Canlı Radar Kartı */}
          <div className="bg-white rounded-3xl p-8 border border-borderLight shadow-premium relative overflow-hidden">
            {/* Süre Seçici (Sadece çalışmıyorken) */}
            {!isStudying && (
              <div className="absolute top-6 left-8 flex items-center gap-2 z-20">
                <span className="text-[10px] font-black text-textSecondary uppercase tracking-widest mr-2">SÜRE (DK):</span>
                {[15, 25, 45, 60, 90].map(m => (
                  <button
                    key={m}
                    onClick={() => setFocusDuration(m)}
                    className={clsx(
                      "w-9 h-9 rounded-lg text-xs font-bold transition-all border",
                      focusDuration === m 
                        ? "bg-secondary text-white border-secondary shadow-sm" 
                        : "bg-white text-textSecondary border-borderLight hover:border-secondary/30"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div className={clsx(
              "absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000",
              isStudying ? "bg-secondary/20" : "bg-gray-100/50"
            )} />
            
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-8 md:pt-0">
              {/* Radar Circle */}
              <div className="flex justify-center">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  {isStudying && <div className="absolute inset-0 border-2 border-secondary/30 rounded-full animate-ping" />}
                  <div className={clsx(
                    "absolute inset-0 border-4 rounded-full transition-all duration-1000",
                    isStudying ? "border-secondary scale-105" : "border-section"
                  )} />
                  <div className="absolute inset-4 border-2 border-dashed border-borderLight rounded-full" />
                  
                  <div className="text-center z-10">
                    <p className="text-[10px] font-black uppercase text-textSecondary tracking-[0.2em] mb-1">
                      {timerMode === 'focus' ? '🎯 ODAKLANMA' : '☕ MOLA'}
                    </p>
                    <p className="text-5xl font-black text-textPrimary tabular-nums tracking-tighter">
                      {formatTime(timeLeft)}
                    </p>
                    <p className="text-[10px] font-bold text-secondary mt-2 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> {Math.floor(elapsedTime / 60)} DK GEÇTİ
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Info / Form */}
              <div className="space-y-6">
                {isStudying ? (
                  <div className="space-y-4 animate-slide-up">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-secondary uppercase tracking-widest">{activityType}</p>
                      <h2 className="text-2xl font-black text-textPrimary leading-tight uppercase">{subject}</h2>
                      <p className="text-sm font-medium text-textSecondary">{topic}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg w-fit border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Koçun Seni İzliyor</span>
                    </div>
                    <button onClick={handleStopStudy} className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95">
                      <Square className="w-4 h-4 fill-current" /> SEANSI DURDUR
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-textSecondary uppercase tracking-widest pl-1">Ders Seçimi</label>
                      <div className="relative">
                        <select 
                          value={subject} 
                          onChange={e => { setSubject(e.target.value); setTopic(''); }}
                          className="w-full bg-section border border-borderLight rounded-xl px-4 py-3.5 text-sm font-bold appearance-none outline-none focus:border-secondary transition-all"
                        >
                          <option value="">Ders Seçiniz...</option>
                          {Object.keys(currentSubjects).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-textSecondary uppercase tracking-widest pl-1">Konu Seçimi</label>
                      <div className="relative">
                        <select 
                          value={topic} 
                          onChange={e => setTopic(e.target.value)}
                          disabled={!subject}
                          className="w-full bg-section border border-borderLight rounded-xl px-4 py-3.5 text-sm font-bold appearance-none outline-none focus:border-secondary transition-all disabled:opacity-50"
                        >
                          <option value="">Konu Seçiniz...</option>
                          {topics.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
                      </div>
                    </div>

                    <button 
                      onClick={() => handleStartStudy()}
                      disabled={!subject || !topic}
                      className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-secondary/20 active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 fill-current" /> ODAKLANMAYI BAŞLAT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Çalışma Türü Bölümü */}
          {!isStudying && (
            <div className="bg-white rounded-3xl p-6 border border-borderLight shadow-sm">
              <h3 className="text-xs font-black text-textPrimary uppercase tracking-widest mb-6 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-secondary" /> Çalışma Türü
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ACTIVITY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setActivityType(opt.label)}
                    className={clsx(
                      "flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all group",
                      activityType === opt.label 
                        ? "bg-white border-secondary shadow-md ring-1 ring-secondary/20" 
                        : "bg-white border-borderLight hover:border-secondary/30"
                    )}
                  >
                    <div className={clsx("p-3 rounded-xl transition-colors", activityType === opt.label ? "bg-secondary text-white" : `${opt.bg} ${opt.color} group-hover:bg-secondary group-hover:text-white`)}>
                      <opt.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-center">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── SAĞ: PROGRAM ENTEGRASYONU ───────────────── */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-borderLight shadow-sm">
            <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2 mb-6">
              <Calendar className="w-4 h-4 text-secondary" /> Bugünün Programı
            </h3>
            
            <div className="space-y-4">
              {plans.length > 0 ? plans.map((p, idx) => (
                <div 
                  key={idx} 
                  className={clsx(
                    "p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-3",
                    subject === p.subject && topic === p.topic ? "border-secondary bg-secondary/5" : "border-borderLight hover:border-secondary/30 bg-section/30"
                  )}
                  onClick={() => {
                    setSubject(p.subject);
                    setTopic(p.topic);
                    if (!isStudying) handleStartStudy(p.subject, p.topic);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">{p.time || '08:00'}</p>
                      <h4 className="text-sm font-bold text-textPrimary group-hover:text-secondary transition-colors">{p.subject}</h4>
                    </div>
                    <ChevronRight className="w-4 h-4 text-textSecondary group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-textSecondary bg-white px-2 py-1 rounded-md border border-borderLight">
                      {p.topic}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 space-y-3">
                  <BookOpen className="w-8 h-8 text-textSecondary opacity-20 mx-auto" />
                  <p className="text-xs text-textSecondary font-medium">Bugün için görev atanmamış.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-secondary to-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-secondary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-20 h-20" />
            </div>
            <h3 className="text-lg font-bold mb-2">AI Motivasyon</h3>
            <p className="text-sm text-white/80 leading-relaxed font-medium">
              "Bugün 2 saat odaklı çalışma hedefine çok yakınsın. {plans[0]?.subject || 'Derslerine'} devam ederek serini koruyabilirsin!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
