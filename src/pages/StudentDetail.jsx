import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  Users, Calendar, Clock, Video, ListTodo, CheckSquare, 
  LineChart, Bot, BookOpen, MessageSquareText, Shield,
  ArrowLeft, ChevronRight, Zap, Target, TrendingUp, AlertCircle, Sparkles, UserCheck
} from 'lucide-react';
import clsx from 'clsx';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const docRef = doc(db, 'students', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStudent({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchStudent();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] animate-pulse text-primary font-black uppercase tracking-widest italic font-black uppercase tracking-widest italic italic">Yükleniyor...</div>;
  if (!student) return <div className="p-10 text-center italic text-textMuted font-black uppercase tracking-widest opacity-40">Öğrenci bulunamadı.</div>;

  return (
    <div className="space-y-10 animate-fade-in relative z-20 pb-20 text-left selection:bg-primary/30">
      
      {/* 1. HEADER & BACK AREA */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left flex flex-col xl:flex-row items-center gap-8">
           <button onClick={() => navigate('/coach/students')} className="flex items-center gap-4 text-textMuted hover:text-white transition-all text-[11px] font-black uppercase tracking-widest italic group">
             <div className="w-12 h-12 rounded-[1.25rem] bg-surface/50 border border-border/50 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
                <ArrowLeft className="w-6 h-6" />
             </div>
             Geri Dön
           </button>
           
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-primary/20 text-white font-black text-3xl italic uppercase">
                 {student.name.charAt(0)}
              </div>
              <div>
                 <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">{student.name}</h2>
                 <div className="flex items-center gap-4 text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50">
                   <span className="flex items-center gap-2"><Target className="w-4 h-4" /> {student.examField || 'SAYISAL'}</span>
                   <span className="w-1.5 h-1.5 rounded-full bg-border" />
                   <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> {student.grade || '12'}. Sınıf</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4 bg-surface/60 backdrop-blur-xl border border-border/50 p-6 rounded-[2.5rem] shadow-2xl shadow-primary/10 transition-all">
           <div className="text-right mr-4 border-r border-border/20 pr-6">
              <p className="text-[10px] text-textMuted font-black uppercase tracking-widest italic opacity-50 mb-1">Haftalık Performans</p>
              <div className="text-3xl font-black text-white italic tracking-tighter">%84</div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
              <TrendingUp className="w-7 h-7" />
           </div>
        </div>
      </header>

      {/* 2. ANA SEKMELER & İSTATİSTİKLER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* ÇALIŞMA DURUMU KARTI */}
        <div className={clsx("p-10 rounded-[3rem] border border-border/50 shadow-2xl relative transition-all duration-500 overflow-hidden", student.isStudying ? "bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10" : "bg-surface/60 border-border/50 opacity-100")}>
           <div className="flex items-center justify-between mb-10 border-b border-border/20 pb-6 relative z-10 transition-all">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                 <Clock className="w-7 h-7 text-secondary" /> Şu Anki Durum
              </h3>
              <div className={clsx("w-4 h-4 rounded-full animate-pulse shadow-glow", student.isStudying ? "bg-emerald-400 shadow-emerald-400/50" : "bg-slate-500")} />
           </div>
           
           <div className="relative z-10">
              <p className="text-3xl font-black text-white italic tracking-tighter mb-4 leading-none">{student.isStudying ? 'MASADAN BİLDİRİM VAR' : 'MOLA VERDİ'}</p>
              <p className="text-textMuted font-medium italic opacity-60 leading-relaxed mb-10">{student.isStudying ? 'Öğrenciniz şu an TYT Matematik - Fonksiyonlar testini çözüyor.' : 'Öğrenci bugün toplam 4 saat 32 dakika çalışma sergiledi.'}</p>
              
              <div className="flex items-center gap-4">
                 <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className={clsx("h-full shadow-glow transition-all duration-1000", student.isStudying ? "bg-emerald-400 w-[65%]" : "bg-slate-500 w-0")} />
                 </div>
                 <span className="text-[10px] font-black text-textMuted uppercase tracking-widest italic">{student.isStudying ? '%65 Hedef' : '0%'}</span>
              </div>
           </div>
        </div>

        {/* HAFTALIK ÖZET KARTI */}
        <div className="lg:col-span-2 bg-surface/50 border border-border/50 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-center">
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
              {[
                { label: 'Çözülen Soru', value: '1.240', icon: Target, color: 'text-primary' },
                { label: 'Çalışılan Süre', value: '38S 12D', icon: Clock, color: 'text-secondary' },
                { label: 'Deneme Ort.', value: '104.5', icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Kalan Gün', value: '84', icon: Calendar, color: 'text-blue-400' },
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-pointer hover:scale-110 transition-transform">
                   <div className={clsx("w-14 h-14 rounded-2xl bg-white/5 border border-white/5 mx-auto mb-6 flex items-center justify-center group-hover:bg-primary/20", stat.color.replace('text-', 'bg-').replace('text-', 'text-'))}>
                      <stat.icon className={clsx("w-7 h-7", stat.color)} />
                   </div>
                   <div className="text-2xl font-black text-white italic tracking-tighter mb-1">{stat.value}</div>
                   <div className="text-[9px] font-black text-textMuted uppercase tracking-widest italic opacity-40">{stat.label}</div>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* 3. DETAYLI MODÜL KISAYOLLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Haftalık Program', icon: ListTodo, color: 'from-primary to-blue-600', path: `/coach/weekly-plan/${student.id}` },
          { label: 'Görev Takvimi', icon: CheckSquare, color: 'from-secondary to-orange-400', path: `/coach/tasks/${student.id}` },
          { label: 'Deneme Sonuçları', icon: LineChart, color: 'from-emerald-400 to-teal-500', path: `/coach/exams/${student.id}` },
          { label: 'Görüşme Notları', icon: MessageSquareText, color: 'from-indigo-400 to-blue-500', path: `/coach/notes/${student.id}` },
        ].map((mod, i) => (
          <div key={i} className="bg-surface/50 border border-border/50 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-slate-800/60 hover:border-primary/40 hover:-translate-y-2 transition-all shadow-xl">
             <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-inner group-hover:scale-110 transition-transform shadow-2xl shadow-primary/20", mod.color)}>
                <mod.icon className="text-white w-7 h-7" />
             </div>
             <div className="text-lg font-black text-white italic tracking-tighter uppercase mb-4 group-hover:text-primary transition-colors">{mod.label}</div>
             <button onClick={() => navigate(mod.path)} className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center text-textMuted group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight className="w-5 h-5 transition-all" />
             </button>
          </div>
        ))}
      </div>

      {/* 4. AI KOÇ ASİSTANI YORUMU */}
      <div className="bg-white/5 border border-white/5 p-12 rounded-[4rem] text-center shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
         <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse"><Bot className="text-white w-6 h-6" /></div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase italic">AI Rehberlik Analizi</h3>
         </div>
         <p className="text-textMuted text-xl font-medium italic opacity-70 leading-relaxed max-w-4xl mx-auto mb-10">"{student.name}, son 3 denemesinde YKS Matematik netlerini istikrarlı olarak artırmış olsa da, paragraf sürelerinde bir yavaşlama hissediliyor. Haftalık plana 20 dakikalık odaklanma drilleri eklenmeli."</p>
         <div className="flex items-center justify-center gap-3">
            {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-1 bg-primary/20 rounded-full" />)}
            <span className="text-[10px] font-black text-primary uppercase tracking-widest italic font-black uppercase tracking-widest italic italic">Strateji Geliştirildi</span>
            {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-1 bg-primary/20 rounded-full" />)}
         </div>
      </div>

    </div>
  );
}
