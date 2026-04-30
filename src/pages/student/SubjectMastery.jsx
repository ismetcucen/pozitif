import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, TrendingUp, Filter, Search, 
  ChevronRight, Brain, Star, Clock, Trophy 
} from 'lucide-react';
import { db } from '../../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { YKS_SUBJECTS } from '../../data/yksSubjects';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function SubjectMastery() {
  const { currentUser } = useAuth();
  const [masteryData, setMasteryData] = useState({});
  const [activeSubject, setActiveSubject] = useState(Object.keys(YKS_SUBJECTS)[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Firestore'dan verileri çek
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'subjectMastery', currentUser.uid), (d) => {
      if (d.exists()) {
        setMasteryData(d.data().levels || {});
      }
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const updateMastery = async (subject, topic, level) => {
    const key = `${subject}_${topic}`;
    const newLevels = { ...masteryData, [key]: level };
    
    try {
      await setDoc(doc(db, 'subjectMastery', currentUser.uid), {
        levels: newLevels,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      toast.success(`${topic} güncellendi!`, { id: 'mastery' });
    } catch (err) {
      toast.error('Güncelleme başarısız.');
    }
  };

  const calculateProgress = (subject) => {
    const topics = YKS_SUBJECTS[subject] || [];
    if (topics.length === 0) return 0;
    const mastered = topics.filter(t => masteryData[`${subject}_${t}`] === 'mastered').length;
    const learning = topics.filter(t => masteryData[`${subject}_${t}`] === 'learning').length;
    return Math.round(((mastered * 1 + learning * 0.5) / topics.length) * 100);
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse">KONU LİSTESİ HAZIRLANIYOR...</div>;

  const currentTopics = (YKS_SUBJECTS[activeSubject] || []).filter(t => 
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in pb-12">
      {/* Sidebar: Subject Selection */}
      <aside className="w-full lg:w-80 space-y-3">
        <div className="bg-white border border-borderLight rounded-2xl p-5 mb-6">
           <h3 className="text-sm font-black text-textPrimary uppercase tracking-tighter flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-secondary" /> MÜFREDAT PANELİ
           </h3>
           <p className="text-[10px] font-medium text-textSecondary uppercase tracking-widest leading-relaxed">
             Hangi konuda ne kadar derinleştiğini takip et, eksiklerini belirle.
           </p>
        </div>

        <div className="space-y-1">
          {Object.keys(YKS_SUBJECTS).map(subject => {
            const progress = calculateProgress(subject);
            return (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject)}
                className={clsx(
                  "w-full flex items-center justify-between p-4 rounded-xl transition-all border",
                  activeSubject === subject 
                    ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20" 
                    : "bg-white border-borderLight text-textSecondary hover:border-secondary/30"
                )}
              >
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-tight">{subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 h-1 bg-current/20 rounded-full overflow-hidden">
                      <div className="h-full bg-current" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[9px] font-black">%{progress}</span>
                  </div>
                </div>
                <ChevronRight className={clsx("w-4 h-4", activeSubject === subject ? "opacity-100" : "opacity-30")} />
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main: Topic List */}
      <main className="flex-1 space-y-6">
        {/* Search & Header */}
        <div className="bg-white border border-borderLight rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h2 className="text-xl font-black text-textPrimary uppercase tracking-tighter">{activeSubject} KONULARI</h2>
             <p className="text-xs text-textSecondary font-medium">Toplam {YKS_SUBJECTS[activeSubject]?.length || 0} konu başlığı</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
            <input 
              type="text" 
              placeholder="Konu ara..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-section border border-borderLight rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium w-full md:w-64 outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 px-2">
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-textSecondary">
              <div className="w-2 h-2 rounded-full border-2 border-borderLight" /> ÇALIŞILMADI
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> ÖĞRENİLİYOR
           </div>
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> USTALAŞILDI
           </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentTopics.map(topic => {
            const level = masteryData[`${activeSubject}_${topic}`] || 'none';
            return (
              <div 
                key={topic} 
                className={clsx(
                  "bg-white border rounded-2xl p-4 flex items-center justify-between transition-all hover:shadow-md",
                  level === 'mastered' ? "border-emerald-200 bg-emerald-50/20" : 
                  level === 'learning' ? "border-blue-200 bg-blue-50/20" : "border-borderLight"
                )}
              >
                <div className="flex-1 min-w-0 pr-4">
                   <p className={clsx(
                     "text-sm font-bold truncate",
                     level === 'mastered' ? "text-emerald-700" : 
                     level === 'learning' ? "text-blue-700" : "text-textPrimary"
                   )}>
                     {topic}
                   </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateMastery(activeSubject, topic, 'learning')}
                    className={clsx(
                      "p-2 rounded-lg transition-all",
                      level === 'learning' ? "bg-blue-500 text-white shadow-md" : "bg-section text-textSecondary hover:bg-blue-100"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => updateMastery(activeSubject, topic, 'mastered')}
                    className={clsx(
                      "p-2 rounded-lg transition-all",
                      level === 'mastered' ? "bg-emerald-500 text-white shadow-md" : "bg-section text-textSecondary hover:bg-emerald-100"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  {level !== 'none' && (
                    <button 
                      onClick={() => updateMastery(activeSubject, topic, 'none')}
                      className="p-2 text-textSecondary hover:text-red-500"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {currentTopics.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border border-borderLight border-dashed rounded-3xl">
               <Search className="w-10 h-10 mx-auto mb-3 text-borderLight" />
               <p className="text-sm font-bold text-textSecondary">Aradığın konu bu dersin müfredatında bulunamadı.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
