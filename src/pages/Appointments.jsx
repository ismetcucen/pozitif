import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc, where, orderBy } from 'firebase/firestore';
import { 
  Calendar as CalendarIcon, Clock, Video, Plus, 
  ChevronRight, Search, Filter, X, 
  VideoIcon, MapPin, AlarmClock, AlertCircle, Sparkles
} from 'lucide-react';
import clsx from 'clsx';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newApp, setNewApp] = useState({ studentId: '', date: '', time: '', topic: 'Haftalık Görüşme', type: 'online' });

  useEffect(() => {
    const unsubApp = onSnapshot(collection(db, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    const unsubStud = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubApp(); unsubStud(); };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newApp.studentId || !newApp.date || !newApp.time) return;
    try {
      await addDoc(collection(db, 'appointments'), {
        ...newApp,
        studentName: students.find(s => s.id === newApp.studentId)?.name || 'Bilinmeyen',
        status: 'Yaklaşıyor'
      });
      setShowModal(false);
      setNewApp({ studentId: '', date: '', time: '', topic: 'Haftalık Görüşme', type: 'online' });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu randevuyu silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, 'appointments', id));
    }
  };

  return (
    <div className="space-y-10 animate-fade-in relative z-20 pb-20 text-left selection:bg-primary/30">
      
      {/* 1. HEADER & ACTIONS AREA */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left">
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter uppercase italic leading-none">Görüşme <span className="text-glow text-primary">Takvimi</span></h2>
           <p className="text-textMuted text-lg font-medium opacity-60 italic leading-relaxed">Öğrencilerinizle olan online veya yüz yüze görüşmelerinizi buradan planlayın.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
           <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted opacity-50" />
              <input 
                type="text" 
                placeholder="Randevularda ara..."
                className="w-full bg-surface/50 border border-border/50 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white outline-none focus:border-primary transition-all shadow-inner italic"
              />
           </div>
           <button onClick={() => setShowModal(true)} className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all italic flex items-center justify-center gap-3">
              <Plus className="w-4 h-4" /> Yeni Planlama
           </button>
        </div>
      </header>

      {/* 2. ANA LİSTE: DARK MODE STYLE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* YAKLAŞAN RANDEVULAR */}
        <div className="xl:col-span-2 bg-surface/60 backdrop-blur-xl border border-border/50 p-10 rounded-[3rem] shadow-2xl shadow-black/20 text-left relative overflow-hidden">
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
           
           <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
              <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-4">
                 <CalendarIcon className="w-7 h-7 text-secondary" /> Planlanan Görüşmeler
              </h3>
              <span className="text-[10px] font-black bg-secondary/10 text-secondary px-5 py-2 rounded-full tracking-widest italic uppercase">AJANDA</span>
           </div>

           <div className="space-y-6">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-28 bg-white/5 rounded-[2.5rem] animate-pulse border border-white/5 shadow-sm" />)
              ) : appointments.length === 0 ? (
                <div className="py-20 text-center italic text-textMuted font-black uppercase tracking-widest opacity-30">Planlanmıs bir görüşme bulunmuyor.</div>
              ) : (
                appointments.map(app => (
                  <div key={app.id} 
                    className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-8 hover:bg-white/10 hover:border-primary/40 transition-all shadow-sm hover:shadow-2xl group"
                  >
                     <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 shadow-inner flex flex-col items-center justify-center p-2 group-hover:bg-primary transition-all">
                           <p className="text-[10px] font-black text-primary group-hover:text-white uppercase leading-none mb-1">GÜN</p>
                           <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{app.date?.split('-')[2] || '—'}</p>
                        </div>
                        <div>
                           <div className="text-xl font-black text-white italic tracking-tighter uppercase leading-none mb-1 group-hover:text-primary transition-colors">{app.studentName}</div>
                           <div className="flex items-center gap-4 text-[10px] text-textMuted font-black uppercase tracking-widest italic opacity-50 truncate transition-all">
                              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary" /> {app.time}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-border" />
                              <span className="flex items-center gap-2"><Video className="w-4 h-4 text-blue-400" /> {app.type.toUpperCase()}</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div className="flex-1 sm:text-right">
                           <p className="text-[10px] text-textMuted font-black uppercase tracking-widest italic opacity-50 mb-1 leading-none truncate">Görüşme Konusu</p>
                           <p className="text-sm font-bold text-white italic opacity-80 truncate">{app.topic}</p>
                        </div>
                        <div className="flex gap-3">
                           <button onClick={() => handleDelete(app.id)} className="w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center text-textMuted hover:bg-rose-500/10 hover:text-rose-400 transition-all shadow-sm">
                              <X className="w-6 h-6" />
                           </button>
                           <button className="px-8 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all italic">BAĞLAN</button>
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* TAKVİM ÖZET VE NOTLAR */}
        <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(107,76,255,0.05)_100%)] pointer-events-none" />
           
           <div>
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse shadow-lg"><Sparkles className="text-white w-6 h-6" /></div>
                 <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase italic">Akıllı Planlama</h3>
              </div>
              <p className="text-textMuted text-lg font-medium italic opacity-70 leading-relaxed mb-10">Haftalık görüşme verimliliğini artırmak için öğrencilerin son haftalık performans raporlarını yayınlamayı unutmayın.</p>
           </div>
           
           <div className="space-y-6">
              <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] shadow-inner text-left">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic mb-2">BU HAFTA</p>
                 <div className="text-3xl font-black text-white italic tracking-tighter">12 Görüşme</div>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] shadow-inner text-left">
                 <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest italic mb-2">SIRADAKİ</p>
                 <div className="text-xl font-bold text-white italic opacity-80 truncate">Mert Yılmaz - 16:30</div>
              </div>
           </div>
        </div>
      </div>

      {/* YENİ RANDEVU MODALİ: DARK STYLE */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-fade-in">
           <div className="bg-surface border border-border/50 rounded-[3.5rem] w-full max-w-xl p-12 shadow-[0_0_100px_rgba(107,76,255,0.3)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Randevu Oluştur</h3>
                 <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-textMuted hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">ÖĞRENCİ SEÇİN</label>
                    <select 
                       value={newApp.studentId}
                       onChange={e => setNewApp({...newApp, studentId: e.target.value})}
                       className="w-full bg-slate-900/50 border border-border/50 rounded-2xl p-5 text-sm font-bold text-white italic outline-none focus:border-primary transition-all shadow-inner appearance-none"
                    >
                       <option value="">Öğrenci Seçiniz...</option>
                       {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">TARİH</label>
                       <input type="date" value={newApp.date} onChange={e => setNewApp({...newApp, date: e.target.value})} className="w-full bg-slate-900/50 border border-border/50 rounded-2xl p-5 text-sm font-bold text-white italic outline-none focus:border-primary transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">SAAT</label>
                       <input type="time" value={newApp.time} onChange={e => setNewApp({...newApp, time: e.target.value})} className="w-full bg-slate-900/50 border border-border/50 rounded-2xl p-5 text-sm font-bold text-white italic outline-none focus:border-primary transition-all shadow-inner" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">BAĞLANTI TÜRÜ</label>
                    <div className="grid grid-cols-2 gap-4">
                       {['online', 'fiziksel'].map(t => (
                         <button key={t} type="button" onClick={() => setNewApp({...newApp, type: t})} className={clsx("py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest italic border-2 transition-all", newApp.type === t ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-border/50 text-textMuted hover:border-white")}>
                            {t === 'online' ? <div className="flex items-center justify-center gap-3"><VideoIcon className="w-4 h-4" /> ONLINE</div> : <div className="flex items-center justify-center gap-3"><MapPin className="w-4 h-4" /> FİZİKSEL</div>}
                         </button>
                       ))}
                    </div>
                 </div>

                 <button type="submit" className="w-full py-5 bg-primary text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-105 transition-all italic mt-4">TAKİME EKLE</button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
