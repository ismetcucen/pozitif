import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, BookOpen, TrendingUp, Clock, CheckCircle, Sparkles, 
  ArrowRight, Bot, X, RotateCcw, Play, Square, MessageSquare, Award, Target
} from 'lucide-react';
import Messaging from '../../components/Messaging';
import { db } from '../../firebase';
import { doc, updateDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { trackingEngine } from '../../modules/tracking/TrackingEngine';
import { aiHub } from '../../modules/ai-hub/AIService';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import AnalysisDashboard from './AnalysisDashboard';
import TutorAI from './TutorAI';
import SubjectMastery from './SubjectMastery';
import Library from '../Library';
import BadgeGallery from '../../modules/gamification/BadgeGallery';
import { gamificationService } from '../../modules/gamification/GamificationService';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const TABS = [
  { id: 'program',  icon: Calendar,      label: 'Program' },
  { id: 'mastery',  icon: BrainCircuit,         label: 'Müfredat' },
  { id: 'tasks',    icon: CheckCircle,   label: 'Görevler' },
  { id: 'exams',    icon: TrendingUp,    label: 'Performans' },
  { id: 'tutor',    icon: Bot,           label: 'AI Tutor' },
  { id: 'library',  icon: BookOpen,      label: 'Kütüphane' },
  { id: 'mesaj',    icon: MessageSquare, label: 'Mesajlar' },
  { id: 'badges',   icon: Award,         label: 'Rozetler' },
];

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const { trialDaysLeft } = useAuth();
  const navigate = useNavigate();
  const { tab: activeTab = 'program' } = useParams();

  const [userData, setUserData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [exams, setExams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStudying, setIsStudying] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);
  const [aiReportData, setAiReportData] = useState(null);

  // Pomodoro
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState('focus');

  useEffect(() => {
    setIsStudying(trackingEngine.isStudying());
  }, []);

  useEffect(() => {
    let interval = null;
    if (isStudying) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            if (timerMode === 'focus') {
              toast.success('Pomodoro Tamamlandı! 5 Dakika Mola Zamanı 🎉', { icon: '🏆', duration: 6000 });
              setTimerMode('break');
              return 5 * 60;
            } else {
              toast.success('Mola Bitti! Yeni bir odaklanma seansına hazır mısın?', { icon: '🚀', duration: 6000 });
              setTimerMode('focus');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
      setTimeLeft(25 * 60);
      setTimerMode('focus');
    }
    return () => clearInterval(interval);
  }, [isStudying, timerMode]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubUser = onSnapshot(doc(db, 'students', currentUser.uid), (d) => {
      if (d.exists()) {
        const data = d.data();
        setUserData(data);
        
        // Seans Kurtarma Mantığı
        if (data.currentStatus?.isStudying) {
          setIsStudying(true);
          setTimerMode(data.currentStatus.timerMode || 'focus');
          
          const serverDuration = data.currentStatus.focusDuration || 25;
          if (data.currentStatus.startedAt) {
            const startTime = data.currentStatus.startedAt.toDate();
            const now = new Date();
            const diffInSeconds = Math.floor((now - startTime) / 1000);
            const totalSeconds = (data.currentStatus.timerMode === 'break' ? 5 : serverDuration) * 60;
            const remaining = Math.max(0, totalSeconds - (diffInSeconds % totalSeconds));
            setTimeLeft(remaining);
          }

          if (!trackingEngine.activeSession) {
            trackingEngine.activeSession = {
              studentId: currentUser.uid,
              subject: data.currentStatus.subject,
              topic: data.currentStatus.topic,
              activityType: data.currentStatus.activityType,
              timerMode: data.currentStatus.timerMode,
              focusDuration: serverDuration,
              startTime: data.currentStatus.startedAt?.toDate() || new Date()
            };
          }
        } else {
          setIsStudying(false);
          trackingEngine.activeSession = null;
        }
      }
      setLoading(false);
    });
    const unsubExams = onSnapshot(query(collection(db, 'exams'), where('studentId', '==', currentUser.uid), orderBy('date', 'desc')), (snap) => {
      setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubPlans = onSnapshot(query(collection(db, 'weeklyPlans'), where('studentId', '==', currentUser.uid)), (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubTasks = onSnapshot(query(collection(db, 'tasks'), where('studentId', '==', currentUser.uid), orderBy('createdAt', 'desc')), (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubUser(); unsubExams(); unsubPlans(); unsubTasks(); };
  }, [currentUser]);

  const handleStartStudy = async (topicSubject) => {
    try {
      await trackingEngine.startSession(
        currentUser.uid, 
        topicSubject || 'Genel Çalışma', 
        'Günlük Program', 
        'Konu Çalışma',
        'focus'
      );
      setIsStudying(true);
      toast.success('Çalışma seansı başlatıldı! Başarılar.', { icon: '🚀' });
    } catch (err) {
      console.error('Dashboard Start Study Error:', err);
      toast.error('Oturum başlatılamadı. Lütfen bağlantınızı kontrol edin.');
    }
  };

  const handleStopStudy = async () => {
    const session = await trackingEngine.stopSession();
    setIsStudying(false);
    if (session) {
      const xpAmount = gamificationService.calculateSessionXP(session.duration);
      await gamificationService.addXP(currentUser.uid, xpAmount, 'Çalışma Tamamlandı');
      if (!userData?.badges?.find(b => b.id === 'first_step')) {
        await gamificationService.awardBadge(currentUser.uid, 'first_step');
      }
      toast.success(`${session.duration.toFixed(1)} dakika çalıştın ve ${xpAmount} XP kazandın!`, { icon: '🔥' });
    }
  };

  const handleAIAnalysis = async () => {
    setIsGeneratingAI(true);
    try {
      const stats = { completedTasks: tasks.filter(t => t.completed).length, totalTasks: tasks.length };
      const analysis = await aiHub.analyzePerformance(currentUser.uid, stats);
      if (analysis.insight.includes('limitiniz doldu')) {
        toast.error(analysis.insight);
        return;
      }
      setAiReportData(analysis);
      setShowAIReport(true);
    } catch (err) {
      toast.error('AI Analizi şu an yapılamıyor.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const getNextPlan = () => {
    if (!plans || plans.length === 0) return null;
    const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    return plans.find(p => p.day === today) || null;
  };
  const nextPlan = getNextPlan();
  const todayPlans = plans.filter(p => p.day === DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const xpPercent = Math.round(((userData?.xp || 0) % 1000) / 10);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-textSecondary">Yükleniyor...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── TRIAL BANNER ──────────────────────────────── */}
      {trialDaysLeft !== null && (
        <div className={clsx(
          "flex items-center justify-between gap-4 px-5 py-3.5 rounded-xl border text-sm font-medium",
          trialDaysLeft <= 1
            ? "bg-red-50 border-red-200 text-red-700"
            : trialDaysLeft <= 3
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-blue-50 border-blue-200 text-blue-700"
        )}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            {trialDaysLeft === 0
              ? "⚠️ Deneme süreniz bugün sona eriyor! Premium'a geçmezseniz AI özellikleri kapanacak."
              : `Ücretsiz deneme sürenizde ${trialDaysLeft} gün kaldı.`}
          </div>
          <button
            onClick={() => toast('Ödeme sayfası yakında aktif olacak!')}
            className="whitespace-nowrap px-3 py-1.5 bg-white border border-current rounded-lg text-xs font-bold hover:opacity-80 transition-opacity"
          >
            Premium'a Geç →
          </button>
        </div>
      )}


      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Karşılama Kartı */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-borderLight shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full uppercase tracking-wide">
                Seviye {userData?.level || 1}
              </span>
              <span className="text-xs font-medium text-textSecondary">{Math.round(userData?.xp || 0)} XP</span>
            </div>
            <h1 className="text-2xl font-bold text-textPrimary tracking-tight">
              Merhaba, <span className="text-secondary">{userData?.name?.split(' ')[0] || 'Öğrenci'}!</span> 👋
            </h1>
            <p className="text-sm text-textSecondary mt-1">Gelişimini AI ile takip ediyoruz.</p>

            {/* XP Bar */}
            <div className="mt-5 max-w-xs">
              <div className="flex justify-between text-xs font-medium text-textSecondary mb-1.5">
                <span>XP İlerlemesi</span>
                <span className="text-secondary font-bold">%{xpPercent}</span>
              </div>
              <div className="h-2 bg-section rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
              {isStudying ? (
                <div className="flex items-center gap-3 bg-secondary/5 border border-secondary/20 px-4 py-2.5 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-wide">
                      {timerMode === 'focus' ? '🎯 Odaklanma' : '☕ Mola'}
                    </p>
                    <p className="text-xl font-black text-textPrimary tabular-nums">
                      {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <button onClick={handleStopStudy} className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-colors">
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                </div>
              ) : (
                <button onClick={() => handleStartStudy(nextPlan?.subject)} className="flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary/90 transition-colors shadow-sm shadow-secondary/20">
                  <Play className="w-4 h-4 fill-current" /> Çalışmaya Başla
                </button>
              )}
              <button onClick={handleAIAnalysis} disabled={isGeneratingAI} className="flex items-center gap-2 bg-white border border-borderLight text-textPrimary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-section transition-colors disabled:opacity-50">
                {isGeneratingAI ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-secondary" />}
                AI Analiz
              </button>
            </div>
          </div>
        </div>

        {/* Haftalık Hedef / Şu An Ne Yapmalıyım? */}
        <div className="bg-white rounded-2xl p-8 border border-borderLight shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Sparkles className="w-12 h-12 text-secondary" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Şu An Ne Yapmalıyım?</h3>
            </div>

            {nextPlan ? (
              <div className="space-y-3">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PROGRAMDAKİ DERSİN</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{nextPlan.subject}</p>
                    <p className="text-xs text-slate-500 font-medium">{nextPlan.topic}</p>
                 </div>
                 
                 {!isStudying && (
                   <button 
                     onClick={() => handleStartStudy(`${nextPlan.subject} - ${nextPlan.topic}`)}
                     className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                   >
                     <Play className="w-3 h-3 fill-current" /> Seansı Başlat
                   </button>
                 )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Şu an için tanımlanmış bir programın yok. Serbest çalışma başlatabilir veya kütüphaneye göz atabilirsin.</p>
                <button 
                  onClick={() => handleStartStudy('Serbest Çalışma')}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  Serbest Çalışma Başlat →
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-slate-900">Haftalık Hedef</span>
                <span className="text-slate-400">%{userData?.weeklyProgress || 0}</span>
             </div>
             <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${userData?.weeklyProgress || 0}%` }} />
             </div>
          </div>
        </div>
      </section>

      {/* ── TABS ──────────────────────────────────────── */}
      <nav className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(`/student/dashboard/${tab.id}`)}
            className={clsx(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0",
              activeTab === tab.id
                ? "bg-secondary text-white shadow-sm shadow-secondary/20"
                : "bg-white border border-borderLight text-textSecondary hover:bg-section hover:text-textPrimary"
            )}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </nav>

      {/* ── TAB CONTENT ───────────────────────────────── */}
      <main className="animate-fade-in pb-12">

        {/* PROGRAM */}
        {activeTab === 'program' && (
          <div className="bg-white border border-borderLight rounded-2xl p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" /> Bugünün Programı
              </h2>
              <span className="text-xs font-semibold text-textSecondary bg-section px-3 py-1.5 rounded-full border border-borderLight">
                {DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]}
              </span>
            </div>
            <div className="space-y-3">
              {todayPlans.length > 0 ? todayPlans.map((p, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-section rounded-xl border border-borderLight hover:border-secondary/30 transition-colors">
                  <div className="w-1 h-12 bg-secondary rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-secondary uppercase tracking-wide">{p.time || '08:00'}</p>
                    <p className="font-semibold text-textPrimary">{p.subject}</p>
                  </div>
                  <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-lg">{p.topic}</span>
                </div>
              )) : (
                <div className="text-center py-12 text-textSecondary">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Bugün için program atanmamış.</p>
                  <p className="text-sm mt-1">Koçunuzdan program bekleniyor.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MASTERY */}
        {activeTab === 'mastery' && (
          <SubjectMastery />
        )}

        {/* TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="bg-white border border-borderLight rounded-xl p-5 flex items-center gap-4 hover:border-secondary/30 transition-colors shadow-sm">
                <div className={clsx("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", task.completed ? "bg-emerald-500" : "border-2 border-borderLight")}>
                  {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <p className={clsx("font-medium text-sm text-textPrimary", task.completed && "line-through text-textSecondary")}>{task.title}</p>
                  <p className="text-xs text-textSecondary mt-0.5">{task.category || 'Genel'}</p>
                </div>
                <span className="text-xs text-textSecondary">{task.dueDate}</span>
              </div>
            )) : (
              <div className="bg-white border border-borderLight rounded-2xl p-12 text-center text-textSecondary shadow-sm">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Henüz görev yok.</p>
              </div>
            )}
          </div>
        )}

        {/* PERFORMANS */}
        {activeTab === 'exams' && (
          <AnalysisDashboard studentId={currentUser.uid} />
        )}

        {/* AI TUTOR */}
        {activeTab === 'tutor' && (
          <TutorAI />
        )}

        {/* KÜTÜPHANE */}
        {activeTab === 'library' && (
          <Library />
        )}

        {/* MESAJ */}
        {activeTab === 'mesaj' && (
          <div className="bg-white border border-borderLight rounded-2xl shadow-sm overflow-hidden">
            <div className="max-w-4xl mx-auto p-6">
              <Messaging
                receiverId={userData?.coachId || 'admin'}
                receiverName={userData?.coachName || 'Koç Paneli'}
              />
            </div>
          </div>
        )}

        {/* ROZETLER */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" /> Başarı ve Rozetler
            </h2>
            <BadgeGallery userBadges={userData?.badges} />
          </div>
        )}
      </main>

      {/* ── AI RAPOR MODAL ────────────────────────────── */}
      {showAIReport && aiReportData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[500] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl border border-borderLight animate-fade-in">
            <button onClick={() => setShowAIReport(false)} className="absolute top-6 right-6 p-2 hover:bg-section rounded-xl transition-colors">
              <X className="w-5 h-5 text-textSecondary" />
            </button>
            <Bot className="w-12 h-12 text-secondary mb-4" />
            <h2 className="text-xl font-bold text-textPrimary mb-6">AI Performans Analizi</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-section p-5 rounded-xl border border-borderLight">
                <p className="text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">Başarı Skoru</p>
                <p className="text-3xl font-black text-secondary">{aiReportData.performanceScore}</p>
              </div>
              <div className="bg-section p-5 rounded-xl border border-borderLight">
                <p className="text-xs font-bold text-textSecondary uppercase tracking-wide mb-1">Risk Seviyesi</p>
                <p className={clsx("text-3xl font-black", aiReportData.riskLevel === 'High' ? 'text-red-500' : 'text-emerald-500')}>
                  {aiReportData.riskLevel}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-textSecondary uppercase tracking-wide mb-3">Odaklanman Gereken Konular</p>
              <div className="flex flex-wrap gap-2">
                {aiReportData.weakTopics?.map((topic, i) => (
                  <span key={i} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
