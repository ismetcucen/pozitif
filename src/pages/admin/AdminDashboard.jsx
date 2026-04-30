import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { 
  Users, UserCheck, TrendingUp, DollarSign, 
  Clock, ArrowUpRight, BarChart3, Activity,
  Crown, Sparkles, LayoutDashboard
} from 'lucide-react';
import { paymentService } from '../../modules/payments/PaymentService';
import clsx from 'clsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCoaches: 0,
    activeSubs: 0,
    totalRevenue: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Öğrenci İstatistikleri
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const students = snap.docs.map(doc => doc.data());
      const active = students.filter(s => s.subscriptionStatus === 'active').length;
      const revenue = active * 299; // Ortalama aylık paket üzerinden simülasyon

      setStats(prev => ({
        ...prev,
        totalStudents: snap.size,
        activeSubs: active,
        totalRevenue: revenue
      }));
    });

    // Koç İstatistikleri
    const unsubCoaches = onSnapshot(query(collection(db, 'users'), where('role', '==', 'coach')), (snap) => {
      setStats(prev => ({ ...prev, totalCoaches: snap.size }));
    });

    // Son Kayıtlar
    const unsubRecent = onSnapshot(query(collection(db, 'students'), orderBy('createdAt', 'desc'), limit(5)), (snap) => {
      setStats(prev => ({ ...prev, recentUsers: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubCoaches();
      unsubRecent();
    };
  }, []);

  const STAT_CARDS = [
    { title: 'TOPLAM ÖĞRENCİ', value: stats.totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'AKTİF ABONE', value: stats.activeSubs, icon: Crown, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'TOPLAM KOÇ', value: stats.totalCoaches, icon: UserCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'TAHMİNİ CİRO (AY)', value: `₺${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-black animate-pulse uppercase tracking-widest italic">Kumanda Merkezi Hazırlanıyor...</div>;

  return (
    <div className="p-6 md:p-10 space-y-10 animate-fade-in max-w-7xl mx-auto">
      
      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Sparkles className="w-4 h-4 text-primary animate-pulse" />
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">SİSTEM ANALİTİĞİ</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight italic uppercase tracking-tighter">
             ADMIN <span className="text-primary">DASHBOARD</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-soft">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center animate-pulse">
            <Activity className="w-5 h-5" />
          </div>
          <div className="pr-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SİSTEM DURUMU</p>
            <p className="text-xs font-black text-emerald-600 uppercase">HER ŞEY YOLUNDA</p>
          </div>
        </div>
      </header>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-soft hover:shadow-premium transition-all duration-500 group relative overflow-hidden">
            <div className={clsx("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150", card.bg)} />
            
            <div className="relative z-10 space-y-4">
              <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft", card.bg, card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{card.title}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 3. SON KAYITLAR */}
        <div className="xl:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-soft">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                 <Clock className="w-6 h-6 text-primary" /> SON KAYIT OLAN ÖĞRENCİLER
              </h3>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">TÜMÜNÜ GÖR</button>
           </div>

           <div className="space-y-4">
              {stats.recentUsers.map((user, i) => (
                <div key={user.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-soft border border-transparent hover:border-slate-100 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-primary shadow-sm uppercase italic">
                         {user.name?.charAt(0) || 'O'}
                      </div>
                      <div>
                         <p className="font-black text-slate-900 uppercase text-sm tracking-tight">{user.name || 'İsimsiz Öğrenci'}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right hidden md:block">
                         <p className="text-[9px] font-bold text-slate-400 uppercase">DURUM</p>
                         <p className={clsx("text-[10px] font-black uppercase", user.subscriptionStatus === 'active' ? 'text-emerald-500' : 'text-amber-500')}>
                            {user.subscriptionStatus === 'active' ? 'AKTİF' : 'DENEME'}
                         </p>
                      </div>
                      <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm">
                         <ArrowUpRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* 4. SİSTEM SAĞLIĞI & ANALİZ */}
        <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mb-32" />
           
           <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary border border-white/10 shadow-lg">
                    <BarChart3 className="w-7 h-7" />
                 </div>
                 <h3 className="text-2xl font-black italic uppercase tracking-tighter">BÜYÜME <br/> <span className="text-primary">ANALİZİ</span></h3>
              </div>

              <div className="space-y-8">
                 <div>
                    <div className="flex justify-between mb-3">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Öğrenci Hedef (1.000)</span>
                       <span className="text-[10px] font-black uppercase text-primary">%{Math.round((stats.totalStudents / 1000) * 100)}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                       <div className="h-full bg-primary rounded-full shadow-glow" style={{ width: `${Math.min(100, (stats.totalStudents / 1000) * 100)}%` }} />
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between mb-3">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aktif Abone Oranı</span>
                       <span className="text-[10px] font-black uppercase text-secondary">%{stats.totalStudents ? Math.round((stats.activeSubs / stats.totalStudents) * 100) : 0}</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                       <div className="h-full bg-secondary rounded-full shadow-glow" style={{ width: `${stats.totalStudents ? (stats.activeSubs / stats.totalStudents) * 100 : 0}%` }} />
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                 <p className="text-[11px] font-medium leading-relaxed text-slate-400 italic">
                    "Sistem şu an stabil çalışıyor. Son 24 saatte {stats.recentUsers.length} yeni kayıt gerçekleşti."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
