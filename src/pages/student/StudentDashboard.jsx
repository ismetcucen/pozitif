import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, setDoc, doc, addDoc, where } from 'firebase/firestore';
import {
  CheckCircle, Target, Calendar, CheckSquare, Link, BookOpen, Play, Square, Timer, Award, Zap, Layers, User, ChevronDown, Clock, TrendingUp, Sparkles, X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];
const SUBJECTS = ['Matematik', 'Türkçe', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Geometri', 'Edebiyat', 'Deneme Çözümü', 'Genel Tekrar'];

const CURRICULUM = {
  "TYT Matematik": ["Temel Kavramlar", "Sayı Basamakları", "Rasyonel Sayılar", "Üslü ve Köklü Sayılar", "Çarpanlara Ayırma", "Oran Orantı", "Problemler", "Mantık", "Kümeler", "Polinomlar"],
  "AYT Matematik": ["İkinci Dereceden Denklemler", "Eşitsizlikler", "Parabol", "Trigonometri", "Logaritma", "Diziler", "Limit ve Süreklilik", "Türev", "İntegral"],
  "Fizik": ["Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet", "İş, Güç, Enerji", "Isı ve Sıcaklık", "Optik", "Dalgalar"],
  "Türkçe": ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Ses Bilgisi", "Yazım Kuralları", "Noktalama"]
};

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selfAssessments, setSelfAssessments] = useState({});
  const [isStudying, setIsStudying] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [studySubject, setStudySubject] = useState('Matematik');
  const [studyEndTime, setStudyEndTime] = useState('');
  const [targetUni, setTargetUni] = useState('');
  const [targetDept, setTargetDept] = useState('');
  const [expandedSubject, setExpandedSubject] = useState("TYT Matematik");
  const [loading, setLoading] = useState(true);

  // Geri Sayım
  const yksDate = '2025-06-14';
  const daysToYKS = Math.max(0, Math.ceil((new Date(yksDate) - new Date()) / (1000 * 60 * 60 * 24)));

  useEffect(() => {
    if (!currentUser) return;

    const unsubPlans = onSnapshot(query(collection(db, 'weeklyPlans'), where('studentId', '==', currentUser.uid)), (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubSelf = onSnapshot(doc(db, 'studentSelfAssessment', currentUser.uid), snap => {
      setSelfAssessments(snap.exists() ? snap.data() : {});
    });

    const unsubStudent = onSnapshot(doc(db, 'students', currentUser.uid), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setTargetUni(d.targetUni || '');
        setTargetDept(d.targetDept || '');
        setIsStudying(d.isStudying || false);
        setLoading(false);
      }
    });

    return () => { unsubPlans(); unsubSelf(); unsubStudent(); };
  }, [currentUser]);

  useEffect(() => {
    let int = null;
    if (isStudying) int = setInterval(() => setStudyTime(p => p + 1), 1000);
    else clearInterval(int);
    return () => clearInterval(int);
  }, [isStudying]);

  const toggleStudy = async () => {
    const next = !isStudying;
    setIsStudying(next);
    try {
      await updateDoc(doc(db, 'students', currentUser.uid), {
        isStudying: next,
        currentSubject: next ? studySubject : null,
        studyEndTime: next ? studyEndTime : null,
        lastStudyUpdate: new Date().toISOString()
      });
      if(!next) { setStudyTime(0); setStudyEndTime(''); }
    } catch(e) {}
  };

  const handleSelfAssess = async (sub, topic, val) => {
    const key = `${sub}__${topic}`;
    const ref = doc(db, 'studentSelfAssessment', currentUser.uid);
    try {
      const updates = { ...selfAssessments };
      if (val === null) delete updates[key]; else updates[key] = val;
      await setDoc(ref, updates);
    } catch(e) {}
  };

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-black italic tracking-widest uppercase animate-pulse">VERİLER YÜKLENİYOR...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-left p-2 sm:p-6 space-y-10 animate-fade-in relative z-20 pb-32">
      
      {/* 1. ÜST BİLGİ ALANLARI (Yüksek Kontrastlı) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* YKS SAYAÇ */}
         <div className="xl:col-span-2 bg-surface/40 border border-primary/20 p-10 rounded-[3rem] flex items-center justify-between group shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
            <div className="relative z-10 flex items-center gap-10">
               <div className="text-center bg-slate-900 border-2 border-primary/30 w-32 h-32 rounded-[2.5rem] flex flex-col items-center justify-center shadow-inner">
                  <div className="text-5xl font-black text-white italic tracking-tighter leading-none">{daysToYKS}</div>
                  <div className="text-[10px] text-primary font-black uppercase tracking-widest mt-2">GÜN KALDI</div>
               </div>
               <div>
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">YKS GERİ SAYIMI 🎯</h2>
                  <p className="text-textMuted text-lg font-medium opacity-60 italic leading-none">Dijital masanda hedeflerine bugün ne kadar yaklaştın?</p>
               </div>
            </div>
         </div>

         {/* HEDEF ÜNİVERSİTE */}
         <div className="bg-surface/40 border border-secondary/20 p-10 rounded-[3rem] flex flex-col justify-center group shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
               <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em] italic mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" /> HAYALİNDEKİ HEDEF
               </h3>
               <div className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none border-b border-white/5 pb-2">{targetUni || 'Üniversite Belirtilmedi'}</div>
               <div className="text-lg font-black text-white/50 italic tracking-tighter uppercase leading-none">{targetDept || 'Bölüm Belirtilmedi'}</div>
            </div>
         </div>
      </div>

      {/* 2. ÇALIŞMA MASASI (KRONOMETRE) - DEVASA ve NET */}
      <div className={clsx("p-12 rounded-[4rem] border-2 flex flex-col xl:flex-row items-center justify-between gap-10 transition-all shadow-[0_0_100px_rgba(0,0,0,0.5)]", isStudying ? "bg-emerald-500/10 border-emerald-400/40" : "bg-surface/60 border-white/5")}>
         <div className="flex items-center gap-8">
            <div className={clsx("w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all", isStudying ? "bg-emerald-400 text-white animate-pulse" : "bg-slate-900 text-white/20 border border-white/5")}>
               <Timer className="w-12 h-12" />
            </div>
            <div>
               <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Çalışma Masası</h3>
               <div className="flex items-center gap-3">
                  <div className={clsx("w-3 h-3 rounded-full", isStudying ? "bg-emerald-400 animate-ping" : "bg-slate-700")} />
                  <span className={clsx("text-xs font-black uppercase tracking-widest italic", isStudying ? "text-emerald-400" : "text-white/20")}>
                    {isStudying ? `${studySubject} ÇALIŞIYOR` : 'MASA ŞU AN BOŞ'}
                  </span>
               </div>
            </div>
         </div>

         <div className="flex flex-col md:flex-row items-center gap-8 w-full xl:w-auto">
            <div className="text-7xl font-black text-white font-mono tracking-tighter bg-slate-900 px-10 py-5 rounded-[2.5rem] border border-white/10 shadow-inner min-w-[280px] text-center">
               {formatTime(studyTime)}
            </div>
            
            <div className="flex flex-col gap-4 w-full md:w-auto">
               <div className="flex gap-2">
                  <input type="time" value={studyEndTime} onChange={e => setStudyEndTime(e.target.value)} className="bg-slate-900 border border-white/5 text-white font-black text-xs p-4 rounded-xl outline-none focus:border-emerald-400 italic w-32" disabled={isStudying} title="Bitiş Saati" />
                  <select value={studySubject} onChange={e => setStudySubject(e.target.value)} className="flex-1 bg-slate-900 border border-white/5 text-white font-black text-xs p-4 rounded-xl outline-none focus:border-emerald-400 italic appearance-none md:w-48" disabled={isStudying}>
                     {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
               <button onClick={toggleStudy} className={clsx("w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] italic transition-all shadow-2xl", isStudying ? "bg-rose-600 text-white hover:scale-105" : "bg-emerald-500 text-white hover:scale-105")}>
                  {isStudying ? 'ÇALIŞMAYI TAMAMLA' : 'MASAYA OTUR 🚀'}
               </button>
            </div>
         </div>
      </div>

      {/* 3. KONU ANALİZİ (Yüksek Kontrastlı Akordeon) */}
      <div className="bg-surface/40 border border-white/5 p-10 rounded-[3rem] shadow-2xl">
         <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
            <Zap className="w-8 h-8 text-primary" /> KONU HAKİMİYET ANALİZİ
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(CURRICULUM).map(([sub, topics]) => (
              <div key={sub} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden group">
                 <button onClick={() => setExpandedSubject(expandedSubject === sub ? null : sub)} className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-all">
                    <span className="text-lg font-black text-white uppercase italic tracking-tight">{sub}</span>
                    <ChevronDown className={clsx("w-6 h-6 text-primary transition-transform", expandedSubject === sub && "rotate-180")} />
                 </button>
                 {expandedSubject === sub && (
                    <div className="p-4 space-y-3 bg-slate-950/50 border-t border-white/5">
                       {topics.map(t => {
                          const val = selfAssessments?.[`${sub}__${t}`];
                          return (
                            <div key={t} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 gap-4">
                               <span className="text-sm font-bold text-white leading-tight opacity-80">{t}</span>
                               <div className="flex gap-2 w-full sm:w-auto">
                                  {['knows','needs_review','dont_know'].map(opt => (
                                    <button 
                                      key={opt}
                                      onClick={() => handleSelfAssess(sub, t, val === opt ? null : opt)}
                                      className={clsx("flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all border", 
                                        val === opt 
                                          ? (opt === 'knows' ? "bg-emerald-500 text-white border-emerald-400" : opt === 'needs_review' ? "bg-amber-500 text-white border-amber-400" : "bg-rose-500 text-white border-rose-400")
                                          : "bg-slate-900 text-white/20 border-white/5 hover:border-white/20")}
                                    >
                                      {opt === 'knows' ? 'OLDU' : opt === 'needs_review' ? 'TEKRAR' : 'EKSİK'}
                                    </button>
                                  ))}
                                </div>
                            </div>
                          );
                       })}
                    </div>
                 )}
              </div>
            ))}
         </div>
      </div>

      {/* 4. HAFTALIK PROGRAM (Net ve Büyük) */}
      <div className="bg-surface/40 border border-white/5 p-10 rounded-[3rem] shadow-2xl overflow-hidden">
         <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4 mb-10">
            <Calendar className="w-8 h-8 text-secondary" /> Haftalık Ders Programın
         </h3>
         <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[1200px] border border-white/5 rounded-[2rem] overflow-hidden bg-slate-900/50">
               <div className="grid grid-cols-8 bg-slate-900 border-b border-white/10">
                  <div className="p-5 text-center text-secondary font-black text-xs uppercase italic tracking-widest border-r border-white/5">SAAT</div>
                  {DAYS.map(d => <div key={d} className="p-5 text-center text-white font-black text-xs uppercase italic tracking-widest border-r border-white/5">{d}</div>)}
               </div>
               {HOURS.map(h => (
                  <div key={h} className="grid grid-cols-8 border-b border-white/5">
                     <div className="p-4 text-center text-white/30 font-black text-[10px] bg-slate-900/80 border-r border-white/5">{h}</div>
                     {DAYS.map(d => {
                        const p = plans.find(p => p.day === d && p.time === h);
                        return (
                          <div key={`${d}-${h}`} className={clsx("p-2 h-16 flex items-center justify-center text-center text-[10px] font-black uppercase italic tracking-tight border-r border-white/5 transition-all", p ? "bg-primary/20 text-primary shadow-inner" : "text-white/5")}>
                            {p?.subject || ''}
                          </div>
                        );
                     })}
                  </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
