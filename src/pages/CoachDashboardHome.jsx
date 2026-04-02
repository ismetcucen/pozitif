import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { 
  Users, Calendar, Clock, Video, 
  ChevronRight, TrendingUp, Sparkles, 
  BrainCircuit, LayoutDashboard,
  Target, Zap, GraduationCap, Map,
  MessageSquare, Star, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function CoachDashboardHome() {
  const [students, setStudents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Öğrencileri dinle
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Yaklaşan Görüşmeleri dinle
    const unsubApps = onSnapshot(
      query(collection(db, 'appointments'), orderBy('date', 'asc')),
      (snap) => {
        setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => { unsubStudents(); unsubApps(); };
  }, []);

  const totalStudents = students.length;
  const studyingStudents = students.filter(s => s.isStudying).length;

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
       <div className="text-primary font-bold uppercase tracking-widest animate-pulse">VERİLER YAZILIYOR...</div>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in relative z-20 pb-24 text-left bg-background pt-6">
      
      {/* 1. SaaS HERO HEADER */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left">
           <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-50 border border-blue-100 text-primary text-[10px] font-bold tracking-widest uppercase mb-6 shadow-soft">
              <Sparkles className="w-4 h-4 text-warning" /> BUGÜN VERİMLİ BİR GÜN OLACAK
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-textPrimary mb-4 tracking-tighter uppercase leading-none">Hoş Geldiniz, <span className="text-primary italic">Kaptan!</span></h1>
           <p className="text-textSecondary max-w-xl text-lg font-medium leading-relaxed">Öğrencilerinin gelişimini anlık izle, riskleri önceden tespit et ve başarılarını dijital asistanınla yönet.</p>
        </div>

        <div className="saas-card p-8 flex items-center gap-6 group cursor-pointer hover:border-primary/30 min-w-[320px]">
           <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-button group-hover:scale-105 transition-transform">
              <Zap className="text-white w-8 h-8" />
           </div>
           <div>
              <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1 opacity-60">AKTİF ÖĞRENCİ LİMİTİ</p>
              <div className="flex items-end gap-3 leading-none">
                 <span className="text-3xl font-black text-textPrimary tracking-tighter">{totalStudents} / 100</span>
                 <div className="w-24 h-2.5 bg-slate-100 rounded-full mb-1.5 overflow-hidden border border-slate-200">
                    <div className="h-full bg-primary shadow-soft" style={{ width: `${(totalStudents/100)*100}%` }} />
                 </div>
              </div>
           </div>
        </div>
      </header>

      {/* 2. ANA İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOPLAM ÖĞRENCİ', value: totalStudents, icon: Users, color: 'text-primary', bg: 'bg-blue-50 border-blue-100' },
          { label: 'MASADA OLANLAR', value: studyingStudents, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' },
          { label: 'CANLI DERSLER', value: students.filter(s => s.activeStream).length, icon: Video, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100' },
          { label: 'GÖRÜŞMELER', value: appointments.length, icon: MessageSquare, color: 'text-success', bg: 'bg-emerald-50 border-emerald-100' },
        ].map(card => (
          <div key={card.label} className="saas-card p-10 flex flex-col items-center justify-center text-center group hover:-translate-y-2 cursor-pointer">
             <div className={clsx("w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform", card.bg)}>
                <card.icon className={clsx("w-8 h-8", card.color)} />
             </div>
             <div className="text-4xl font-black text-textPrimary mb-2 tracking-tighter italic">{card.value}</div>
             <div className="text-[10px] font-bold text-textSecondary uppercase tracking-widest opacity-60">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* 3. ÖĞRENCİ PERFORMANS ÖZETİ */}
        <div className="saas-panel p-10">
           <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8">
              <h3 className="text-xl font-bold text-textPrimary uppercase tracking-tighter flex items-center gap-4 italic underline decoration-primary/30 underline-offset-8">
                 <Clock className="w-7 h-7 text-secondary" /> Öğrenci Performans Özeti
              </h3>
              <span className="text-[10px] font-black bg-blue-50 text-primary border border-blue-100 px-5 py-2 rounded-full tracking-widest uppercase">{studyingStudents} AKTİF</span>
           </div>

           <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-3">
              {students.map(student => (
                <div key={student.id} 
                  onClick={() => navigate(`/coach/students/${student.id}`)}
                  className="p-6 bg-slate-50 border border-slate-100 rounded-saas flex items-center justify-between group hover:bg-white hover:border-primary/30 hover:shadow-premium transition-all cursor-pointer"
                >
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-soft flex items-center justify-center text-primary font-black text-xl italic uppercase group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all">
                         {student.name.charAt(0)}
                      </div>
                      <div>
                         <div className="text-lg font-black text-textPrimary italic tracking-tighter uppercase mb-1 group-hover:text-primary transition-colors">{student.name}</div>
                         <div className="text-[10px] text-textSecondary font-bold uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-secondary" /> {student.universityGoal || 'Üniversite'} - {student.departmentGoal || 'Bölüm'}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right">
                         {student.isStudying ? (
                           <>
                             <div className="text-[10px] font-black text-success uppercase tracking-widest italic">{student.currentTask || 'Ders'} Çalışıyor</div>
                             <div className="text-xs font-bold text-textMuted">{student.endTime || '--:--'}'a kadar</div>
                           </>
                         ) : (
                           <div className="text-[10px] font-bold text-textMuted uppercase tracking-widest opacity-40">Şu an çalışmıyor</div>
                         )}
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-primary transition-all" />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* 4. TRENDLER & GÖRÜŞMELER */}
        <div className="space-y-10">
           {/* SON DENEME NET TRENDİ */}
           <div className="saas-card p-10 bg-slate-50/50">
              <h3 className="text-xl font-bold text-textPrimary uppercase tracking-tighter flex items-center gap-4 mb-8 italic">
                 <TrendingUp className="w-7 h-7 text-primary" /> Son Deneme Net Trendi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {students.slice(0, 4).map(s => (
                   <div key={s.id} className="p-6 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-soft hover:shadow-premium transition-all">
                      <span className="text-sm font-bold text-textPrimary italic uppercase">{s.name}</span>
                      <span className="bg-blue-50 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                         {s.lastExamType || 'TYT'} {s.lastExamNet || '0'} Net
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           {/* YAKLAŞAN GÖRÜŞMELER */}
           <div className="saas-panel p-10">
              <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8">
                 <h3 className="text-xl font-bold text-textPrimary uppercase tracking-tighter flex items-center gap-4 italic">
                    <Calendar className="w-7 h-7 text-success" /> Yaklaşan Görüşmeler
                 </h3>
                 <button onClick={() => navigate('/coach/notes')} className="text-xs font-bold text-primary hover:text-primaryHover uppercase tracking-widest transition-colors flex items-center gap-2 group">TÜMÜ <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
              </div>
              <div className="space-y-4">
                 {appointments.slice(0, 3).map(app => (
                   <div key={app.id} className="p-6 bg-slate-50 border border-slate-100 rounded-saas flex items-center justify-between group hover:bg-white hover:border-primary/30 hover:shadow-premium transition-all">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-success shadow-soft">
                            <Clock className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="text-sm font-black text-textPrimary uppercase italic tracking-tight">{app.studentName}</div>
                            <div className="text-[10px] text-textSecondary font-bold uppercase opacity-60">{app.date} - {app.time}</div>
                         </div>
                      </div>
                      {app.zoomLink && (
                        <a href={app.zoomLink} target="_blank" rel="noopener noreferrer" className="p-4 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-soft">
                           <Video className="w-5 h-5" />
                        </a>
                      )}
                   </div>
                 ))}
                 {appointments.length === 0 && (
                   <div className="py-12 text-center text-textMuted font-bold uppercase text-[10px] opacity-40 tracking-[0.3em]">Haftalık randevu bulunmuyor.</div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
