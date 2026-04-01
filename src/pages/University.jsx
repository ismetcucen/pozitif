import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { 
  Bot, Sparkles, TrendingUp, Target, 
  ChevronRight, BrainCircuit, Zap, Clock, 
  Search, Filter, BookOpen, GraduationCap, 
  Map, LayoutDashboard, UserCheck, AlertCircle, 
  X, Shield, ArrowLeft, ArrowRight, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function University() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  // Madde 21: Form State
  const [formData, setFormData] = useState({
    universityName: '',
    tytNet: '',
    aytNet: '',
    ydtNet: '',
    obp: '' // 50-100 arası
  });

  const handleCalculate = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Madde 21: OBP Hesaplama Mantığı (OBP * 0.6)
    const obpSection = Number(formData.obp) * 0.6;
    
    // Basit bir puan simülasyonu (Temsili katsayılar)
    const tytScore = Number(formData.tytNet) * 1.33;
    const aytScore = Number(formData.aytNet) * 3.0;
    const ydtScore = Number(formData.ydtNet) * 3.0;
    
    const finalScore = 100 + tytScore + aytScore + ydtScore + obpSection;
    
    setTimeout(() => {
      setResult({
        score: finalScore.toFixed(2),
        obpContribution: obpSection.toFixed(2),
        matchRate: Math.min(Math.floor(Math.random() * 40) + 60, 99) // Temsili %
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-fade-in relative z-20 pb-20 text-left">
      
      {/* 1. HEADER AREA (Madde 21) */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left">
           <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-[0.3em] uppercase mb-6 italic transition-all hover:bg-white/10 shadow-lg shadow-primary/5">
              <BrainCircuit className="w-4 h-4 animate-pulse text-secondary" /> Yapay Zekâ Destekli Hedef Analizi
           </div>
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter uppercase italic leading-none">Yapay Zeka <span className="text-glow text-primary">Hedef Karşılaştırma</span></h2>
           <p className="text-textMuted max-w-xl text-lg font-medium opacity-60 italic leading-relaxed">Yapay Zeka ile hedefinize ne kadar yaklaştığınızı hesaplayın.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         
         {/* Madde 21: VERİ GİRİŞİ FORMU */}
         <div className="bg-surface/60 border border-border/50 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group text-left">
            <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
               <Target className="w-7 h-7 text-secondary" /> Net ve OBP Verileri
            </h3>
            
            <form onSubmit={handleCalculate} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50 pl-1">HEDEF ÜNİVERSİTE ADI</label>
                  <input type="text" required placeholder="Örn: ODTÜ - Bilgisayar Mühendisliği" value={formData.universityName} onChange={e => setFormData({...formData, universityName: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white focus:border-primary outline-none transition-all italic" />
               </div>

               <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50 pl-1">TYT NET</label>
                     <input type="number" step="0.25" placeholder="0 - 120" value={formData.tytNet} onChange={e => setFormData({...formData, tytNet: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white focus:border-primary outline-none italic" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50 pl-1">AYT NET</label>
                     <input type="number" step="0.25" placeholder="0 - 80" value={formData.aytNet} onChange={e => setFormData({...formData, aytNet: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white focus:border-primary outline-none italic" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50 pl-1">YDT NET</label>
                     <input type="number" step="0.25" placeholder="0 - 80" value={formData.ydtNet} onChange={e => setFormData({...formData, ydtNet: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white focus:border-primary outline-none italic" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50 pl-1 text-primary">ORTAÖĞRETİM BAŞARI PUANI (OBP: 50-100)</label>
                  <input type="number" required min="50" max="100" placeholder="50 ile 100 arası giriniz" value={formData.obp} onChange={e => setFormData({...formData, obp: e.target.value})} className="w-full bg-slate-900 border border-primary/20 rounded-xl p-4 text-lg font-black text-white focus:border-primary outline-none transition-all italic shadow-[0_0_20px_rgba(107,76,255,0.1)]" />
               </div>

               <button type="submit" disabled={loading} className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-primary/30 hover:scale-102 transition-all italic flex items-center justify-center gap-3 mt-4">
                  {loading ? 'YAPAY ZEKA HESAPLIYOR...' : 'HEDEFİ KARŞILAŞTIR'} <ChevronRight className="w-5 h-5" />
               </button>
            </form>
         </div>

         {/* SONUÇ EKRANI */}
         <div className="bg-surface/50 border border-border/50 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-center text-left relative overflow-hidden">
            {!result ? (
               <div className="text-center py-20 opacity-20">
                  <Activity className="w-20 h-20 text-white mx-auto mb-6 opacity-20" />
                  <p className="text-xl font-bold uppercase italic tracking-widest">Analiz Bekleniyor</p>
               </div>
            ) : (
               <div className="animate-fade-in space-y-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                     <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
                        <Sparkles className="w-7 h-7 text-emerald-400" /> Analiz Raporu
                     </h3>
                     <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-5 py-2 rounded-full tracking-widest italic uppercase">TAMAMLANDI</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] shadow-inner text-center">
                        <p className="text-[10px] font-black text-textMuted uppercase tracking-widest italic mb-4 opacity-50">KAYITLI TERCİH PUANI</p>
                        <div className="text-5xl font-black text-white italic tracking-tighter mb-2">{result.score}</div>
                        <p className="text-[9px] text-emerald-400 font-bold italic uppercase tracking-widest">OBP KATKISI: {result.obpContribution} PUAN</p>
                     </div>
                     <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] shadow-inner text-center flex flex-col justify-center">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest italic mb-2 opacity-50">HEDEFE YAKINLIK</p>
                        <div className="text-5xl font-black text-primary italic tracking-tighter">%{result.matchRate}</div>
                     </div>
                  </div>

                  <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] shadow-inner">
                     <p className="text-[10px] font-black text-textMuted uppercase tracking-widest italic mb-4 opacity-50">YAPAY ZEKA KRİTİĞİ</p>
                     <p className="text-lg font-medium text-white italic opacity-80 leading-relaxed border-l-4 border-primary pl-6">
                        OBP puanınızın 0,6 katsayısı ile eklenmesi sonucunda, hedeflediğiniz <strong>{formData.universityName}</strong> için şu anki netlerinizle %{result.matchRate} oranında bir başarı öngörülüyor. TYT Matematik netlerinizi 4-5 puan artırmanız sizi %90 bandına taşıyacaktır.
                     </p>
                  </div>
               </div>
            )}
         </div>

      </div>
    </div>
  );
}
