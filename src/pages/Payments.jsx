import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { 
  Wallet, TrendingUp, Clock, CheckCircle2, 
  Search, Filter, Plus, ChevronRight, 
  ArrowUpRight, ArrowDownLeft, Calendar, 
  X, AlertCircle, Sparkles, BrainCircuit,
  MessageSquare
} from 'lucide-react';
import clsx from 'clsx';

export default function Payments() {
  const [students, setStudents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Öğrencileri dinle
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Görüşmeleri dinle (Görüşme sayısını hesaplamak için)
    const unsubApps = onSnapshot(collection(db, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubStudents(); unsubApps(); };
  }, []);

  const totalRevenue = students.reduce((sum, s) => sum + (s.paymentStatus === 'Ödendi' ? (Number(s.fee) || 0) : 0), 0);
  const pendingRevenue = students.reduce((sum, s) => sum + (s.paymentStatus !== 'Ödendi' ? (Number(s.fee) || 0) : 0), 0);

  const handleUpdateStatus = async (id, status) => {
     try {
       await updateDoc(doc(db, 'students', id), { paymentStatus: status });
     } catch (err) { console.error(err); }
  };

  // Madde 14: Görüşme sayısını öğrenci ismine göre say
  const getMeetingCount = (studentName) => {
    return appointments.filter(app => app.studentName === studentName).length;
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10 animate-fade-in relative z-20 pb-20 text-left">
      
      {/* 1. HEADER AREA */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left">
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter uppercase italic leading-none">Ödeme <span className="text-glow text-primary">Takibi</span></h2>
           <p className="text-textMuted text-lg font-medium opacity-60 italic leading-relaxed">Öğrencilerinizin ödeme durumlarını ve koçluk bedellerini buradan yönetin.</p>
        </div>

        <div className="relative w-full xl:w-96">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted opacity-50" />
           <input 
             type="text" 
             placeholder="Öğrenci ara..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-surface/50 border border-border/50 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white outline-none focus:border-primary transition-all shadow-inner italic"
           />
        </div>
      </header>

      {/* 2. STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface/50 border border-primary/20 rounded-[3rem] p-10 flex items-center gap-8 group hover:-translate-y-2 transition-all shadow-2xl shadow-primary/5">
           <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Wallet className="w-8 h-8 text-primary" />
           </div>
           <div>
              <div className="text-4xl font-black text-white italic tracking-tighter">{totalRevenue.toLocaleString('tr-TR')}₺</div>
              <div className="text-[11px] font-black text-textMuted uppercase tracking-widest italic opacity-50">TOPLAM TAHSİLAT</div>
           </div>
        </div>
        <div className="bg-surface/50 border border-secondary/20 rounded-[3rem] p-10 flex items-center gap-8 group hover:-translate-y-2 transition-all shadow-2xl shadow-secondary/5">
           <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Clock className="w-8 h-8 text-secondary" />
           </div>
           <div>
              <div className="text-4xl font-black text-white italic tracking-tighter">{pendingRevenue.toLocaleString('tr-TR')}₺</div>
              <div className="text-[11px] font-black text-textMuted uppercase tracking-widest italic opacity-50">BEKLEYEN ÖDEME</div>
           </div>
        </div>
      </div>

      {/* 3. ÖĞRENCİ DETAYLARI LİSTESİ (Madde 14) */}
      <div className="bg-surface/60 backdrop-blur-xl border border-border/50 p-10 rounded-[3rem] shadow-2xl shadow-black/20 text-left">
           <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
              <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-4">
                 <Users className="w-7 h-7 text-primary" /> Öğrenci Detayları
              </h3>
              <span className="text-[10px] font-black bg-primary/10 text-primary px-5 py-2 rounded-full tracking-widest italic uppercase">FİNANSAL DURUM</span>
           </div>

           <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center animate-pulse italic text-textMuted font-black uppercase tracking-widest opacity-30">Yükleniyor...</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center italic text-textMuted font-black uppercase tracking-widest opacity-30">Kayıt bulunamadı.</div>
              ) : (
                filtered.map(student => (
                  <div key={student.id} 
                    className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 hover:border-primary/40 transition-all shadow-sm group"
                  >
                     {/* Öğrenci Bilgisi */}
                     <div className="flex items-center gap-5 w-full md:w-1/3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 shadow-inner flex items-center justify-center text-primary font-black text-lg italic uppercase group-hover:bg-primary group-hover:text-white transition-all">
                           {student.name.charAt(0)}
                        </div>
                        <div>
                           <div className="text-md font-black text-white italic tracking-tight uppercase group-hover:text-primary transition-colors">{student.name}</div>
                           <div className="text-[9px] text-textMuted font-black uppercase tracking-widest italic opacity-50 truncate">{student.email}</div>
                        </div>
                     </div>
                     
                     {/* Aylık Ücret */}
                     <div className="flex flex-col items-center md:items-start w-full md:w-1/4">
                         <span className="text-[9px] font-black text-textMuted uppercase tracking-widest italic opacity-40 mb-1">Aylık Ücret</span>
                         <span className="text-lg font-black text-white italic tracking-tighter">{student.fee || 0}₺</span>
                     </div>

                     {/* Görüşme Sayısı */}
                     <div className="flex flex-col items-center md:items-start w-full md:w-1/4">
                         <span className="text-[9px] font-black text-textMuted uppercase tracking-widest italic opacity-40 mb-1">Görüşme Sayısı</span>
                         <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-primary italic tracking-tighter">{getMeetingCount(student.name)}</span>
                            <MessageSquare className="w-4 h-4 text-primary opacity-30" />
                         </div>
                     </div>

                     {/* Ödeme Durumu */}
                     <div className="w-full md:w-auto">
                        <select 
                            value={student.paymentStatus || 'Bekliyor'}
                            onChange={(e) => handleUpdateStatus(student.id, e.target.value)}
                            className={clsx(
                              "w-full md:w-auto px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic outline-none transition-all shadow-inner",
                              student.paymentStatus === 'Ödendi' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            )}
                        >
                            <option value="Bekliyor">BEKLİYOR</option>
                            <option value="Ödendi">ÖDENDİ</option>
                            <option value="Gecikti">GECİKTİ</option>
                        </select>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

    </div>
  );
}
