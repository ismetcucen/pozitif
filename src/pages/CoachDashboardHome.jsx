import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { 
  Users, Calendar, Clock, Video, 
  ChevronRight, TrendingUp, Sparkles, 
  BrainCircuit, LayoutDashboard,
  Target, Zap, GraduationCap, Map,
  MessageSquare, Star
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

    // Yaklaşan Görüşmeleri dinle (Madde 9: Tarihe göre sıralı)
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

  return (
    <div className="space-y-10 animate-fade-in relative z-20 pb-24 text-left">
      
      {/* 1. HERO HEADER AREA */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left">
           <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-[0.3em] uppercase mb-6 italic transition-all hover:bg-white/10 shadow-lg shadow-primary/5">
              <Sparkles className="w-4 h-4 animate-pulse text-secondary" /> Bugün Verimli Bir Gün Olacak
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter uppercase italic leading-none">Hoş Geldiniz, <span className="text-glow text-primary">Kaptan!</span></h1>
           <p className="text-textMuted max-w-xl text-lg font-medium opacity-60 italic leading-relaxed">Öğrencilerinin gelişimini anlık izle, riskleri önceden tespit et ve başarılarını dijital asistanınla yönet.</p>
        </div>

        <div className="flex items-center gap-4 bg-surface/60 backdrop-blur-xl border border-border/50 p-6 rounded-[2.5rem] shadow-2xl shadow-primary/10 group cursor-pointer hover:border-primary/30 transition-all">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="text-white w-8 h-8" />
           </div>
           <div>
              <p className="text-[10px] text-textMuted font-black uppercase tracking-widest italic opacity-50 mb-1">Aktif Öğrenci Limiti</p>
              <div className="flex items-end gap-3 leading-none">
                 <span className="text-3xl font-black text-white italic tracking-tighter">{totalStudents} / 100</span>
                 <div className="w-20 h-2 bg-white/10 rounded-full mb-1.5 overflow-hidden">
                    <div className="w-[74%] h-full bg-primary shadow-[0_0_10px_rgba(107,76,255,0.6)]" />
                 </div>
              </div>
           </div>
        </div>
      </header>

      {/* 2. ANA İSTATİSTİK KARTLARI (Madde 5: Ödeme alanları kaldırıldı) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOPLAM ÖĞRENCİ', value: totalStudents, icon: Users, color: 'text-primary', bg: 'from-primary/10 to-primary/5' },
          { label: 'MASADA OLANLAR', value: studyingStudents, icon: Clock, color: 'text-secondary', bg: 'from-secondary/10 to-secondary/5' },
          { label: 'CANLI DERSLER', value: students.filter(s => s.activeStream).length, icon: Video, color: 'text-blue-400', bg: 'from-blue-400/10 to-blue-400/5' },
          { label: 'GÖRÜŞMELER', value: appointments.length, icon: MessageSquare, color: 'text-emerald-400', bg: 'from-emerald-400/10 to-emerald-400/5' },
        ].map(card => (
          <div key={card.label} className="bg-surface/50 border border-border/50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover:bg-slate-800/40 hover:border-primary/40 hover:-translate-y-2 transition-all shadow-xl hover:shadow-primary/5 cursor-pointer">
             <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-inner group-hover:scale-110 transition-transform", card.bg)}>
                <card.icon className={clsx("w-7 h-7", card.color)} />
             </div>
             <div className="text-3xl font-black text-white mb-2 italic tracking-tighter">{card.value}</div>
             <div className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* 3. ÖĞRENCİ PERFORMANS ÖZETİ (Madde 4 & 13: Canlı Çalışma Detayları) */}
        <div className="bg-surface/60 backdrop-blur-xl border border-border/50 p-10 rounded-[3rem] shadow-2xl shadow-black/20 text-left">
           <div className="flex items-center justify-between mb-10 border-b border-border/50 pb-6">
              <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-4">
                 <Clock className="w-7 h-7 text-secondary" /> Öğrenci Performans Özeti
              </h3>
              <span className="text-[10px] font-black bg-secondary/10 text-secondary px-5 py-2 rounded-full tracking-widest italic">{studyingStudents} AKTİF</span>
           </div>

           <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {students.map(student => (
                <div key={student.id} 
                  onClick={() => navigate(`/coach/students/${student.id}`)}
                  className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-between group hover:bg-white/10 hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-2xl"
                >
                   <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-slate-900 border border-white/10 shadow-inner flex items-center justify-center text-primary font-black text-xl italic uppercase group-hover:bg-primary group-hover:text-white transition-all">
                         {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                         <div className="text-lg font-black text-white italic tracking-tighter uppercase leading-none mb-1 group-hover:text-primary transition-colors truncate">{student.name}</div>
                         {/* Madde 10: Hedef Bilgisi */}
                         <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest italic flex items-center gap-2">
                            <Target className="w-3 h-3" /> {student.universityGoal || 'Üniversite'} - {student.departmentGoal || 'Bölüm'}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end mr-4">
                         {student.isStudying ? (
                           <>
                             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">{student.currentTask || 'Ders'} Çalışıyor</span>
                             <span className="text-xs font-bold text-white opacity-40">{student.endTime || '--:--'}'a kadar</span>
                           </>
                         ) : (
                           <span className="text-[10px] font-black text-rose-400/50 uppercase tracking-widest italic">Şu an çalışmıyor</span>
                         )}
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* 4. YAKLAŞAN GÖRÜŞMELER & SON DENEME NET TRENDİ (Madde 6 & 9) */}
        <div className="space-y-10">
           {/* SON DENEME NET TRENDİ (Madde 6) */}
           <div className="bg-surface/50 border border-border/50 p-10 rounded-[3rem] shadow-xl text-left">
              <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-4 mb-8">
                 <TrendingUp className="w-7 h-7 text-primary" /> Son Deneme Net Trendi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {students.slice(0, 4).map(s => (
                   <div key={s.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                      <span className="text-sm font-bold text-white italic">{s.name}</span>
                      <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest border border-primary/20">
                         {s.lastExamType || 'TYT'} {s.lastExamNet || '0'} Net
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           {/* YAKLAŞAN GÖRÜŞMELER (Madde 7 & 9) */}
           <div className="bg-surface/60 backdrop-blur-xl border border-border/50 p-10 rounded-[3rem] shadow-2xl text-left">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-4">
                    <Calendar className="w-7 h-7 text-emerald-400" /> Yaklaşan Görüşmeler
                 </h3>
                 <button onClick={() => navigate('/coach/notes')} className="text-[10px] font-black text-primary uppercase tracking-widest italic hover:text-white transition-colors">TÜMÜ</button>
              </div>
              <div className="space-y-4">
                 {appointments.slice(0, 3).map(app => (
                   <div key={app.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-emerald-400">
                            <Clock className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="text-sm font-black text-white uppercase italic tracking-tight">{app.studentName}</div>
                            <div className="text-[10px] text-textMuted font-black uppercase italic opacity-40">{app.date} - {app.time}</div>
                         </div>
                      </div>
                      {app.zoomLink && (
                        <a href={app.zoomLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                           <Video className="w-5 h-5" />
                        </a>
                      )}
                   </div>
                 ))}
                 {appointments.length === 0 && (
                   <div className="py-10 text-center italic text-textMuted font-black uppercase text-[10px] opacity-30 tracking-widest">Yaklaşan görüşme bulunmuyor.</div>
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
