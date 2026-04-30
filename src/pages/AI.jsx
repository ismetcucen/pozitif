import React, { useState, useEffect } from 'react';
import { 
  Sparkles, AlertTriangle, TrendingUp, Users, 
  BrainCircuit, Zap, CheckCircle2, MessageSquare, ArrowUpRight
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function AI() { 
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const riskStudents = students.filter(s => {
    // Basic risk logic: dropping net or no study session in 3 days
    return s.currentStatus?.isLate || s.isDropping; 
  });

  const stats = [
    { label: 'AI Analiz Sayısı', value: '1,240', icon: BrainCircuit, color: 'text-blue-500' },
    { label: 'Tahmini Başarı Artışı', value: '%24', icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Riskli Öğrenci', value: riskStudents.length, icon: AlertTriangle, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">
            KOÇLUK <span className="text-primary">AI MERKEZİ</span>
          </h1>
          <p className="text-text-muted text-sm font-medium">Öğrencilerinin verilerini Yapay Zeka ile analiz et ve erken önlem al.</p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-black text-primary uppercase">Aktif Analiz Modu</span>
           </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="glass-card p-6 border-t-4 border-t-primary/20">
             <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-3 bg-white/5 rounded-xl", s.color)}><s.icon className="w-6 h-6" /></div>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Haftalık</span>
             </div>
             <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
             <p className="text-3xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Radar */}
        <div className="glass-card p-8 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-black italic tracking-tighter uppercase flex items-center gap-2">
                 <AlertTriangle className="text-amber-500" /> RİSK RADARI
              </h3>
              <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">DİKKAT GEREKTİRENLER</span>
           </div>

           <div className="space-y-4">
              {riskStudents.length > 0 ? riskStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center font-black text-amber-500">
                         {student.name?.[0]}
                      </div>
                      <div>
                         <p className="font-bold text-sm text-white">{student.name}</p>
                         <p className="text-[10px] text-text-muted uppercase font-bold">Son denemede net düşüşü tespit edildi</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => navigate(`/coach/students/${student.id}`)}
                     className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                   >
                     <ArrowUpRight className="w-4 h-4 text-white" />
                   </button>
                </div>
              )) : (
                <div className="py-12 text-center text-text-muted italic border border-white/10 border-dashed rounded-3xl">
                   Tüm öğrencileriniz şu an için güvenli bölgede!
                </div>
              )}
           </div>
        </div>

        {/* AI Insight Box */}
        <div className="glass-card p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden">
           <Sparkles className="absolute top-4 right-4 w-12 h-12 text-primary/10 pointer-events-none" />
           <div className="relative space-y-6">
              <h3 className="text-lg font-black italic tracking-tighter uppercase flex items-center gap-2">
                 <BrainCircuit className="text-primary" /> GENEL KOÇLUK ÖZETİ
              </h3>
              
              <div className="space-y-4">
                 <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p className="text-sm text-indigo-100 leading-relaxed italic">
                       "Öğrencilerin bu hafta matematik denemelerinde ortalama %12 daha fazla yanlış yaptığı tespit edildi. Genel bir 'Trigonometri' tekrar dersi veya dokümanı paylaşmanız önerilir."
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                       <p className="text-[10px] font-black text-text-muted uppercase mb-1">En Çok Zorlanılan</p>
                       <p className="text-sm font-bold text-white">Logaritma</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                       <p className="text-[10px] font-black text-text-muted uppercase mb-1">En Yüksek Başarı</p>
                       <p className="text-sm font-bold text-white">Paragraf</p>
                    </div>
                 </div>

                 <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                    Sınıf Genel Analizini Güncelle
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  ); 
}
