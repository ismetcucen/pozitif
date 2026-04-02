import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { updateDoc, setDoc, doc, addDoc } from 'firebase/firestore';
import {
  CheckCircle, Target, Calendar, CheckSquare, Link, BookOpen, Play, Square, Timer, Award, Zap, Layers, User, ChevronDown, Clock, TrendingUp, Sparkles, X, ArrowRight, MousePointer2
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
    <div className=\"min-h-screen bg-background flex items-center justify-center p-6 text-primary font-bold uppercase tracking-widest animate-pulse\">
       VERİLER YÜKLENİYOR...
    </div>
  );

  return (
    <div className=\"space-y-6 md:space-y-10 animate-slide-up pb-20 text-left bg-background pt-4 md:pt-10 px-4 md:px-0\">
      
      {/* 1. ÜST BİLGİ ALANLARI */}
      <div className=\"grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8\">
         {/* YKS SAYAÇ */}
         <div className=\"xl:col-span-2 bg-white border border-slate-200 p-6 md:p-10 rounded-saas shadow-soft flex flex-col sm:flex-row items-center justify-between group overflow-hidden gap-6\">
            <div className=\"flex flex-col sm:flex-row items-center gap-6 md:gap-10 text-center sm:text-left\">
               <div className=\"text-center bg-blue-50 border-2 border-primary/10 w-24 h-24 md:w-32 md:h-32 rounded-saas shadow-soft flex flex-col items-center justify-center shrink-0\">
                  <div className=\"text-4xl md:text-5xl font-black text-primary tracking-tighter leading-none\">{daysToYKS}</div>
                  <div className=\"text-[8px] md:text-[10px] text-primary/60 font-bold uppercase tracking-widest mt-2\">GÜN KALDI</div>
               </div>
               <div>
                  <h2 className=\"text-2xl md:text-3xl font-black text-textPrimary uppercase tracking-tighter mb-2 italic\">YKS SÜRECİ🎯</h2>
                  <p className=\"text-textSecondary text-base md:text-lg font-medium opacity-70\">Hayallerine her gün bir adım daha yaklaş.</p>
               </div>
            </div>
         </div>

         {/* HEDEF ÜNİVERSİTE */}
         <div className=\"bg-white border border-slate-200 p-6 md:p-10 rounded-saas shadow-soft relative overflow-hidden group min-h-[160px] flex flex-col justify-center\">
            <div className=\"space-y-3 md:space-y-4\">
               <h3 className=\"text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-2\">
                  <Target className=\"w-4 h-4 text-secondary\" /> HAYALİNDEKİ HEDEF
               </h3>
               <div className=\"text-xl md:text-2xl font-black text-textPrimary uppercase tracking-tighter italic border-l-4 border-secondary pl-3 md:pl-4 line-clamp-1\">{targetUni || 'HEDEF BELİRLE'}</div>
               <div className=\"text-base md:text-lg font-bold text-textSecondary uppercase tracking-tighter pl-3 md:pl-4 line-clamp-1\">{targetDept || 'BÖLÜM BELİRLE'}</div>
            </div>
         </div>
      </div>

      {/* 2. ÇALIŞMA MASASI (KRONOMETRE) */}
      <div className={clsx(\"p-6 md:p-12 rounded-saas-lg border transition-all shadow-premium\", isStudying ? \"bg-emerald-50 border-emerald-200\" : \"bg-white border-slate-200\")}>
         <div className=\"flex flex-col xl:flex-row items-center justify-between gap-8 md:gap-10\">
            <div className=\"flex items-center gap-6 md:gap-8 w-full\">
               <div className={clsx(\"w-16 h-16 md:w-20 md:h-20 rounded-saas border flex items-center justify-center transition-all shadow-soft shrink-0\", isStudying ? \"bg-white text-emerald-500 border-emerald-200 animate-pulse\" : \"bg-slate-50 text-slate-300 border-slate-100\")}>
                  <Timer className=\"w-8 h-8 md:w-10 md:h-10\" />
               </div>
               <div>
                  <h3 className=\"text-xl md:text-2xl font-black text-textPrimary uppercase tracking-tighter mb-1 italic underline decoration-primary/30 underline-offset-4\">Ders Masası</h3>
                  <div className=\"flex items-center gap-2\">
                     <div className={clsx(\"w-2.5 h-2.5 rounded-full\", isStudying ? \"bg-emerald-500 animate-ping\" : \"bg-slate-300\")} />
                     <span className={clsx(\"text-[10px] font-bold uppercase tracking-widest\", isStudying ? \"text-emerald-600\" : \"text-slate-400\")}>
                       {isStudying ? `${studySubject} ODAKLANDI` : 'MOLA VERİLİYOR'}
                     </span>
                  </div>
               </div>
            </div>

            <div className=\"flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full xl:w-auto\">
               <div className=\"text-5xl md:text-6xl font-black text-textPrimary font-mono tracking-tighter bg-white px-8 md:px-10 py-4 md:py-5 rounded-saas border border-slate-200 shadow-soft w-full md:min-w-[250px] text-center\">
                  {formatTime(studyTime)}
               </div>
               
               <div className=\"flex flex-col sm:flex-row gap-3 w-full md:w-auto\">
                  {!isStudying && (
                    <div className=\"flex gap-2 w-full\">
                      <input type=\"time\" value={studyEndTime} onChange={e => setStudyEndTime(e.target.value)} className=\"bg-slate-50 border border-slate-200 text-textPrimary font-bold text-xs p-3.5 md:p-4 rounded-xl outline-none focus:border-primary focus:bg-white transition-all w-28 md:w-32 shadow-soft\" title=\"Bitiş Vakti\" />
                      <select value={studySubject} onChange={e => setStudySubject(e.target.value)} className=\"flex-1 bg-slate-50 border border-slate-200 text-textPrimary font-bold text-xs p-3.5 md:p-4 rounded-xl outline-none focus:border-primary focus:bg-white transition-all md:w-48 shadow-soft\">
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  <button onClick={toggleStudy} className={clsx(\"w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-button text-white active:scale-95\", isStudying ? \"bg-danger\" : \"bg-success\")}>
                     {isStudying ? 'Mola Ver' : 'BAŞLA'}
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* 3. KONU ANALİZİ */}
      <div className=\"bg-white border border-slate-200 p-6 md:p-10 rounded-saas shadow-soft\">
         <h3 className=\"text-xl md:text-2xl font-black text-textPrimary uppercase tracking-tighter flex items-center gap-3 md:gap-4 mb-8 md:mb-10 pb-5 md:pb-6 border-b border-slate-100 italic\">
            <Zap className=\"w-6 h-6 md:w-8 md:h-8 text-warning\" /> KONU HAKİMİYETİ
         </h3>
         <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6\">
            {Object.entries(CURRICULUM).map(([sub, topics]) => (
              <div key={sub} className=\"bg-slate-50/50 border border-slate-200 rounded-saas overflow-hidden group hover:border-primary/30 transition-all\">
                 <button onClick={() => setExpandedSubject(expandedSubject === sub ? null : sub)} className=\"w-full p-6 md:p-8 flex items-center justify-between hover:bg-white transition-all\">
                    <span className=\"text-base md:text-lg font-bold text-textPrimary uppercase tracking-tight\">{sub}</span>
                    <ChevronDown className={clsx(\"w-5 h-5 text-slate-400 transition-transform\", expandedSubject === sub && \"rotate-180\")} />
                 </button>
                 {expandedSubject === sub && (
                    <div className=\"p-3 md:p-4 space-y-2 md:space-y-3 bg-white border-t border-slate-200\">
                       {topics.map(t => {
                          const val = selfAssessments?.[`${sub}__${t}`];
                          return (
                            <div key={t} className=\"flex flex-col lg:flex-row items-center justify-between p-4 md:p-5 bg-slate-50 border border-slate-100 rounded-xl gap-3\">
                               <span className=\"text-xs md:text-sm font-semibold text-textPrimary text-center lg:text-left w-full lg:w-auto\">{t}</span>
                               <div className=\"flex gap-2 w-full lg:w-auto\">
                                  {['knows','needs_review','dont_know'].map(opt => (
                                    <button 
                                      key={opt}
                                      onClick={() => handleSelfAssess(sub, t, val === opt ? null : opt)}
                                      className={clsx(\"flex-1 px-3 py-2 md:py-2.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border\", 
                                        val === opt 
                                          ? (opt === 'knows' ? \"bg-success text-white border-transparent shadow-soft\" : opt === 'needs_review' ? \"bg-warning text-white border-transparent shadow-soft\" : \"bg-danger text-white border-transparent shadow-soft\")
                                          : \"bg-white text-slate-400 border-slate-200 hover:bg-slate-50\")}
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
      
      {/* 4. HAFTALIK PROGRAM (Duyarlı Tablo) */}
      <div className=\"bg-white border border-slate-200 p-6 md:p-10 rounded-saas shadow-soft overflow-hidden\">
         <div className=\"flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 md:mb-10\">
            <div className=\"flex items-center gap-3\">
               <div className=\"w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-secondary border border-purple-100 shadow-soft\">
                  <Calendar className=\"w-6 h-6\" />
               </div>
               <h3 className=\"text-xl md:text-2xl font-black text-textPrimary uppercase tracking-tighter italic\">Haftalık Ajandam</h3>
            </div>
            <div className=\"flex items-center gap-2 text-primary animate-pulse md:hidden\">
               <MousePointer2 className=\"w-4 h-4\" />
               <span className=\"text-[9px] font-bold uppercase tracking-widest\">Kaydırın</span>
            </div>
         </div>
         <div className=\"overflow-x-auto pb-4 custom-scrollbar -mx-2 px-2\">
            <div className=\"min-w-[1000px] border border-slate-200 rounded-saas overflow-hidden shadow-soft\">
               <div className=\"grid grid-cols-8 bg-slate-50 border-b border-slate-200\">
                  <div className=\"p-4 md:p-5 text-center text-slate-400 font-bold text-[10px] md:text-[11px] uppercase tracking-widest border-r border-slate-200\">ZAMAN</div>
                  {DAYS.map(d => <div key={d} className=\"p-4 md:p-5 text-center text-textPrimary font-bold text-[10px] md:text-[11px] uppercase tracking-widest border-r border-slate-200\">{d}</div>)}
               </div>
               {HOURS.map(h => (
                  <div key={h} className=\"grid grid-cols-8 border-b border-slate-100\">
                     <div className=\"p-3 md:p-4 text-center text-slate-400 font-bold text-[9px] md:text-[10px] bg-slate-50/50 border-r border-slate-100\">{h}</div>
                     {DAYS.map(d => {
                        const p = plans.find(p => p.day === d && p.time === h);
                        return (
                          <div key={`${d}-${h}`} className={clsx(\"p-2 h-14 md:h-16 flex items-center justify-center text-center text-[9px] md:text-[10px] font-bold uppercase tracking-tight border-r border-slate-100 transition-colors\", p ? \"bg-blue-50/50 text-primary font-black\" : \"text-slate-300\")}>
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
