import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, setDoc, doc, addDoc, where } from 'firebase/firestore';
import {
  CheckCircle, Target, Calendar, CheckSquare, Link, BookOpen, Play, Square, Timer, Award, Zap, Layers, User, ChevronDown, Clock, TrendingUp, Sparkles, X, ArrowRight
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
      setSelfAssessments(snap.exists() ? snap.data() : { ...selfAssessments });
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

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
       <div className="text-primary font-bold uppercase tracking-widest animate-pulse">VERİLER YÜKLENİYOR...</div>
    </div>
  );

  return (
    <div className="space-y-10 animate-slide-up pb-20 text-left bg-background pt-10">
      
      {/* 1. ÜST BİLGİ ALANLARI */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* YKS SAYAÇ */}
         <div className="xl:col-span-2 bg-white border border-slate-200 p-10 rounded-saas shadow-soft flex items-center justify-between group overflow-hidden">
            <div className="flex items-center gap-10">
               <div className="text-center bg-blue-50 border-2 border-primary/10 w-32 h-32 rounded-saas shadow-soft flex flex-col items-center justify-center">
                  <div className="text-5xl font-black text-primary tracking-tighter leading-none">{daysToYKS}</div>
                  <div className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mt-2">GÜN KALDI</div>
               </div>
               <div>
                  <h2 className="text-3xl font-black text-textPrimary uppercase tracking-tighter mb-2 italic">YKS GERİ SAYIMI 🎯</h2>
                  <p className="text-textSecondary text-lg font-medium">Hedeflerine her gün bir adım daha yaklaş.</p>
               </div>
            </div>
         </div>

         {/* HEDEF ÜNİVERSİTE */}
         <div className="bg-white border border-slate-200 p-10 rounded-saas flex flex-col justify-center shadow-soft relative overflow-hidden group">
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 group-hover:text-primary transition-colors">
                  <Target className="w-5 h-5 text-secondary" /> HAYALİNDEKİ HEDEF
               </h3>
               <div className="text-2xl font-black text-textPrimary uppercase tracking-tighter italic border-l-4 border-secondary pl-4">{targetUni || 'Üniversite Belirlenmedi'}</div>
               <div className="text-lg font-bold text-textSecondary uppercase tracking-tighter pl-4">{targetDept || 'Bölüm Belirlenmedi'}</div>
            </div>
         </div>
      </div>

      {/* 2. ÇALIŞMA MASASI (KRONOMETRE) - SaaS STYLE */}
      <div className={clsx("p-12 rounded-saas-lg border transition-all shadow-premium", isStudying ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200")}>
         <div className="flex flex-col xl:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8">
               <div className={clsx("w-20 h-20 rounded-saas border flex items-center justify-center transition-all shadow-soft", isStudying ? "bg-white text-emerald-500 border-emerald-200 animate-pulse" : "bg-slate-50 text-slate-300 border-slate-100")}>
                  <Timer className="w-10 h-10" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-textPrimary uppercase tracking-tighter mb-2 italic underline decoration-primary/30 underline-offset-4">Çalışma Masası</h3>
                  <div className="flex items-center gap-2">
                     <div className={clsx("w-2.5 h-2.5 rounded-full", isStudying ? "bg-emerald-500 animate-ping" : "bg-slate-300")} />
                     <span className={clsx("text-xs font-bold uppercase tracking-widest", isStudying ? "text-emerald-600" : "text-slate-400")}>
                       {isStudying ? `${studySubject} ÇALIŞIYOR` : 'MOLA VERİLİYOR'}
                     </span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-6 w-full xl:w-auto">
               <div className="text-6xl font-black text-textPrimary font-mono tracking-tighter bg-white px-10 py-5 rounded-saas border border-slate-200 shadow-soft min-w-[250px] text-center">
                  {formatTime(studyTime)}
               </div>
               
               <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  {!isStudying && (
                    <>
                      <input type="time" value={studyEndTime} onChange={e => setStudyEndTime(e.target.value)} className="bg-slate-50 border border-slate-200 text-textPrimary font-bold text-xs p-4 rounded-xl outline-none focus:border-primary focus:bg-white transition-all w-32 shadow-soft" title="Bitiş Vakti" />
                      <select value={studySubject} onChange={e => setStudySubject(e.target.value)} className="bg-slate-50 border border-slate-200 text-textPrimary font-bold text-xs p-4 rounded-xl outline-none focus:border-primary focus:bg-white transition-all w-48 shadow-soft">
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </>
                  )}
                  <button onClick={toggleStudy} className={clsx("px-12 py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-button text-white", isStudying ? "bg-danger hover:bg-red-600" : "bg-success hover:bg-emerald-600")}>
                     {isStudying ? 'Çalışmayı BİTİR' : 'MASAYA OTUR'}
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* 3. KONU ANALİZİ (MODERN AKORDEON) */}
      <div className="bg-white border border-slate-200 p-10 rounded-saas shadow-soft">
         <h3 className="text-2xl font-black text-textPrimary uppercase tracking-tighter flex items-center gap-4 mb-10 pb-6 border-b border-slate-100 italic">
            <Zap className="w-8 h-8 text-warning" /> KONU HAKİMİYET ANALİZİ
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(CURRICULUM).map(([sub, topics]) => (
              <div key={sub} className="bg-slate-50/50 border border-slate-200 rounded-saas overflow-hidden group hover:border-primary/30 transition-all">
                 <button onClick={() => setExpandedSubject(expandedSubject === sub ? null : sub)} className="w-full p-8 flex items-center justify-between hover:bg-white transition-all">
                    <span className="text-lg font-bold text-textPrimary uppercase tracking-tight">{sub}</span>
                    <ChevronDown className={clsx("w-5 h-5 text-slate-400 transition-transform", expandedSubject === sub && "rotate-180")} />
                 </button>
                 {expandedSubject === sub && (
                    <div className="p-4 space-y-3 bg-white border-t border-slate-200">
                       {topics.map(t => {
                          const val = selfAssessments?.[`${sub}__${t}`];
                          return (
                            <div key={t} className="flex flex-col lg:flex-row items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-xl gap-4">
                               <span className="text-sm font-semibold text-textPrimary">{t}</span>
                               <div className="flex gap-2 w-full lg:w-auto">
                                  {['knows','needs_review','dont_know'].map(opt => (
                                    <button 
                                      key={opt}
                                      onClick={() => handleSelfAssess(sub, t, val === opt ? null : opt)}
                                      className={clsx("flex-1 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border", 
                                        val === opt 
                                          ? (opt === 'knows' ? "bg-success text-white border-transparent shadow-soft" : opt === 'needs_review' ? "bg-warning text-white border-transparent shadow-soft" : "bg-danger text-white border-transparent shadow-soft")
                                          : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50")}
                                    >
                                      {opt === 'knows' ? 'Oldu' : opt === 'needs_review' ? 'Tekrar' : 'Eksik'}
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
      
      {/* 4. HAFTALIK PROGRAM (SaaS TABLE) */}
      <div className="bg-white border border-slate-200 p-10 rounded-saas shadow-soft overflow-hidden">
         <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-secondary border border-purple-100 shadow-soft">
               <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-textPrimary uppercase tracking-tighter italic">Haftalık Ders Programı</h3>
         </div>
         <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[1000px] border border-slate-200 rounded-saas overflow-hidden shadow-soft">
               <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200">
                  <div className="p-5 text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest border-r border-slate-200">SAAT</div>
                  {DAYS.map(d => <div key={d} className="p-5 text-center text-textPrimary font-bold text-[11px] uppercase tracking-widest border-r border-slate-200">{d}</div>)}
               </div>
               {HOURS.map(h => (
                  <div key={h} className="grid grid-cols-8 border-b border-slate-100">
                     <div className="p-4 text-center text-slate-400 font-bold text-[10px] bg-slate-50/50 border-r border-slate-100">{h}</div>
                     {DAYS.map(d => {
                        const p = plans.find(p => p.day === d && p.time === h);
                        return (
                          <div key={`${d}-${h}`} className={clsx("p-2 h-16 flex items-center justify-center text-center text-[10px] font-bold uppercase tracking-tight border-r border-slate-100 transition-colors", p ? "bg-blue-50/50 text-primary font-black" : "text-slate-300")}>
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
