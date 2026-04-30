import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc, setDoc, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { 
  Users, Calendar, Clock, Video, 
  ChevronRight, TrendingUp, Sparkles, 
  CheckSquare, Target, BarChart2, 
  ArrowRight, CheckCircle, AlertCircle, X,
  BookOpen, Timer, Zap, BellRing, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import clsx from 'clsx';

// --- Sağdan açılan panel bileşeni ---  
function Drawer({ open, onClose, title, icon: Icon, iconColor, children }) {
  return (
    <>
      <div onClick={onClose} className={clsx('fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0 pointer-events-none')} />
      <div className={clsx('fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[300] flex flex-col transition-transform duration-300 ease-out', open ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', iconColor)}><Icon className="w-5 h-5" /></div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">{children}</div>
      </div>
    </>
  );
}

export default function CoachDashboardHome() {
  const [students, setStudents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null);
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);
  const todayLocal = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;

  useEffect(() => {
    let unsubs = [];

    const initialize = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        const isAdmin = ['admin', 'super_admin', 'kurucu'].includes(userData?.role);

        // 1. Öğrencileri Çek
        const qStudents = collection(db, 'students');

        const uStudents = onSnapshot(qStudents, (snap) => {
          let allStudents = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          if (!isAdmin) {
            allStudents = allStudents.filter(s => 
              s.addedBy === auth.currentUser.uid || 
              s.coachId === auth.currentUser.uid
            );
          }
          
          setStudents(allStudents);
          setLoading(false);
        });
        unsubs.push(uStudents);

        // 2. Randevuları Çek
        const uApps = onSnapshot(query(collection(db, 'appointments'), orderBy('date', 'asc')), (snap) => {
          setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubs.push(uApps);

        // 3. Görevleri Çek
        const uTasks = onSnapshot(query(collection(db, 'tasks'), orderBy('createdAt', 'desc')), (snap) => {
          setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubs.push(uTasks);

        // 4. Denemeleri Çek
        const uExams = onSnapshot(query(collection(db, 'exams'), orderBy('createdAt', 'desc')), (snap) => {
          setExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubs.push(uExams);

        // 5. Seansları Çek (Onay Bekleyenler Dahil)
        const uSessions = onSnapshot(query(collection(db, 'studySessions'), orderBy('createdAt', 'desc')), (snap) => {
          setSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubs.push(uSessions);

        // 6. Haftalık Planlar
        const uWeekly = onSnapshot(collection(db, 'weeklyPlans'), (snap) => {
          setWeeklyPlans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        unsubs.push(uWeekly);

      } catch (err) {
        console.error("Dashboard Init Error:", err);
        setLoading(false);
      }
    };

    initialize();
    return () => unsubs.forEach(fn => fn());
  }, []);

  const totalStudents = students.length;
  const studyingStudents = students.filter(s => s.currentStatus?.isStudying).length;
  const todayTasks = tasks.filter(t => t.targetDate === today || t.targetDate === todayLocal);
  const todayDone = todayTasks.filter(t => t.done).length;
  const recentExams = exams.slice(0, 5);
  
  const pendingSessions = sessions.filter(s => s.status === 'pending');

  const formatTime = (totalSeconds) => {
    if (totalSeconds > 0 && totalSeconds < 60) return '< 1 dk';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hrs > 0) return `${hrs} sa ${mins} dk`;
    return `${mins} dk`;
  };

  const laggingStudents = useMemo(() => {
    const daysTR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const now = new Date();
    const currentDay = daysTR[now.getDay()];
    const currentHourStr = `${String(now.getHours()).padStart(2, '0')}:00`;

    return students.filter(s => {
      if (s.currentStatus?.isStudying) return false;
      const plannedSlot = weeklyPlans.find(p => p.studentId === s.id && p.day === currentDay && p.time === currentHourStr);
      if (plannedSlot && plannedSlot.subject) {
        s.shouldBeStudying = plannedSlot.subject;
        return true;
      }
      return false;
    });
  }, [students, weeklyPlans]);

  const handleSendInactivityAlert = async (student) => {
    try {
      await setDoc(doc(collection(db, 'notifications')), {
        toStudentId: student.id,
        toStudentName: student.name,
        fromCoachId: auth.currentUser?.uid,
        message: `📢 Program Uyarısı: ${student.name}, şu an programında olan "${student.shouldBeStudying}" dersine henüz başlamadın. Lütfen masaya geç! 💪`,
        type: 'warning',
        isRead: false,
        createdAt: new Date().toISOString()
      });
      toast.success(`${student.name}'a ders uyarısı gönderildi!`);
    } catch (e) { toast.error('Hata: ' + e.message); }
  };

  const handleApproveSession = async (session) => {
    try {
      await updateDoc(doc(db, 'studySessions', session.id), { status: 'approved' });
      toast.success('Onaylandı!');
    } catch(err) { toast.error('Hata!'); }
  };

  const handleSendWarning = async (studentId, studentName) => {
    const msg = prompt(`${studentName} isimli öğrenciye uyarı mesajını yazın:`, "Süreyi aştın, derhal masaya dön!");
    if (!msg) return;
    try {
      await updateDoc(doc(db, 'students', studentId), { warningMessage: msg });
      toast.success('Uyarı gönderildi!');
    } catch (e) { toast.error('Hata!'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-textMuted font-medium text-sm animate-pulse">
       Koç Paneli Yükleniyor...
    </div>
  );

  const statCards = [
    { id: 'students', label: 'Öğrencilerim', value: totalStudents, icon: Users, color: 'text-primary', bg: 'bg-primary/5', desc: 'Listeyi Gör', drawerTitle: 'Kayıtlı Öğrenciler', drawerIconColor: 'bg-primary/10 text-primary' },
    { id: 'active', label: 'Aktif Çalışan', value: studyingStudents, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Masadakiler', drawerTitle: 'Şu An Çalışıyor', drawerIconColor: 'bg-emerald-50 text-emerald-600' },
    { id: 'tasks', label: 'Bugünkü Hedef', value: `${todayDone}/${todayTasks.length}`, icon: CheckSquare, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Görevleri Aç', drawerTitle: 'Bugünün Görevleri', drawerIconColor: 'bg-amber-50 text-amber-600' },
    { id: 'appointments', label: 'Randevular', value: appointments.length, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Takvime Git', drawerTitle: 'Yaklaşan Randevular', drawerIconColor: 'bg-indigo-50 text-indigo-600' },
  ];

  const openCard = statCards.find(c => c.id === drawer);

  return (
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6">
      <header className="flex flex-col xl:flex-row items-start justify-between gap-6">
        <div className="flex-1 w-full">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/10 text-secondary text-xs font-semibold mb-4 border border-secondary/20">
              <Sparkles className="w-3.5 h-3.5" /> Günlük Özet
           </div>
           <h1 className="text-2xl font-bold text-textPrimary mb-2 leading-tight">Yönetim Paneli</h1>
           <p className="text-textSecondary text-sm font-medium">Sorumlu olduğunuz öğrencilerin anlık gelişimini buradan takip edin.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <button key={card.id} onClick={() => setDrawer(card.id)} className="bg-surface border border-borderLight p-5 rounded-saas flex flex-col items-start hover:shadow-soft hover:border-primary/30 transition-all text-left group w-full relative">
            <div className="flex items-center justify-between w-full mb-4">
              <span className="text-sm font-medium text-textSecondary">{card.label}</span>
              <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110', card.bg)}><card.icon className={clsx("w-4 h-4", card.color)} /></div>
            </div>
            <div className="text-2xl font-bold text-textPrimary mb-1">{card.value}</div>
            <div className="text-[10px] font-bold text-secondary uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">{card.desc} <ChevronRight className="w-3 h-3"/></div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onay Bekleyenler */}
        <div className="bg-surface border border-borderLight rounded-saas p-6 shadow-soft flex flex-col h-[400px]">
           <div className="flex items-center justify-between mb-5 pb-4 border-b border-borderLight">
              <h3 className="text-base font-semibold text-textPrimary flex items-center gap-2"><CheckCircle className="w-5 h-5 text-indigo-500" /> Kanıtlı Onaylar</h3>
              <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg border border-indigo-100">{pendingSessions.length} Bekleyen</span>
           </div>
           <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {pendingSessions.length > 0 ? pendingSessions.map(sess => (
                <div key={sess.id} className="p-4 rounded-xl border border-borderLight bg-white hover:shadow-sm transition-shadow">
                   <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                         <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded inline-block mb-1">{sess.subject}</span>
                         <h4 className="text-sm font-bold text-textPrimary truncate">{students.find(s => s.id === sess.studentId)?.name || 'Öğrenci'}</h4>
                         <p className="text-xs text-textSecondary mt-0.5">{sess.topic} • {formatTime(sess.durationSeconds || sess.duration)}</p>
                      </div>
                      {sess.proofPhoto && <a href={sess.proofPhoto} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg bg-section border border-borderLight overflow-hidden shrink-0"><img src={sess.proofPhoto} className="w-full h-full object-cover"/></a>}
                   </div>
                   <button onClick={() => handleApproveSession(sess)} className="w-full mt-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-100 font-bold text-[10px] uppercase rounded-lg">Onayla</button>
                </div>
              )) : <div className="h-full flex flex-col items-center justify-center text-textMuted text-sm">Bekleyen işlem yok.</div>}
           </div>
        </div>

        {/* Canlı Kontrol */}
        <div className="bg-surface border border-borderLight rounded-saas p-6 shadow-soft flex flex-col h-[400px]">
           <div className="flex items-center justify-between mb-5 pb-4 border-b border-borderLight">
              <h3 className="text-base font-semibold text-textPrimary flex items-center gap-2">
                 <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                 Canlı İzleyici
              </h3>
           </div>
           <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {students.map(s => (
                <div key={s.id} className={clsx("p-3 rounded-xl border transition-all flex items-center justify-between", s.currentStatus?.isStudying ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100 opacity-60")}>
                   <div className="flex items-center gap-3">
                      <div className={clsx("w-2 h-2 rounded-full", s.currentStatus?.isStudying ? (s.currentStatus?.timerMode === 'break' ? "bg-amber-500" : "bg-emerald-500 animate-pulse") : "bg-slate-300")} />
                      <div>
                         <p className="text-sm font-bold text-slate-800">{s.name}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase">
                            {s.currentStatus?.isStudying 
                              ? (s.currentStatus?.timerMode === 'break' ? '☕ Molada' : `${s.currentStatus?.subject} Çalışıyor`) 
                              : 'Çevrimdışı'}
                         </p>
                      </div>
                   </div>
                   {s.currentStatus?.isStudying && <button onClick={() => handleSendWarning(s.id, s.name)} className="p-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded hover:bg-amber-100 transition-colors"><AlertCircle className="w-4 h-4" /></button>}
                </div>
              ))}
           </div>
        </div>
      </div>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={openCard?.drawerTitle || ''} icon={openCard?.icon || Users} iconColor={openCard?.drawerIconColor}>
         {drawer === 'students' && students.map(s => (
           <div key={s.id} onClick={() => { navigate(`/coach/students/${s.id}`); setDrawer(null); }} className="p-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-primary/40 flex items-center justify-between group">
              <div className="text-sm font-bold text-slate-800">{s.name}</div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
           </div>
         ))}
         {drawer === 'active' && students.filter(s => s.currentStatus?.isStudying).map(s => (
           <div key={s.id} className={clsx("p-4 rounded-xl flex items-center justify-between", s.currentStatus?.timerMode === 'break' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100")}>
              <div className={clsx("text-sm font-bold", s.currentStatus?.timerMode === 'break' ? "text-amber-800" : "text-emerald-800")}>
                {s.name} 
                <span className="text-[10px] block opacity-70">
                  {s.currentStatus?.timerMode === 'break' ? '☕ MOLA' : `${s.currentStatus?.subject} - ${s.currentStatus?.topic}`}
                </span>
              </div>
              <button onClick={() => handleSendWarning(s.id, s.name)} className="p-1.5 bg-white rounded shadow-sm text-amber-500"><AlertCircle className="w-4 h-4" /></button>
           </div>
         ))}
      </Drawer>
    </div>
  );
}
