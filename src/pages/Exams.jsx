import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { LineChart, Trash2, TrendingUp, BarChart2 } from 'lucide-react';
import clsx from 'clsx';

export default function Exams() { 
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-10 animate-slide-up pb-20 text-left">
      <header>
        <div className="flex items-center gap-4 mb-3">
           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <LineChart className="w-7 h-7" />
           </div>
           <h2 className="text-3xl font-black text-text tracking-tighter uppercase italic">Akademik Deneme Analizi</h2>
        </div>
        <p className="text-textMuted mt-2 text-lg font-medium pl-1">Öğrencilerin öğrenci panelinden girdikleri deneme sonuçlarını buradan eşzamanlı takip et.</p>
      </header>

      <div className="bg-white p-10 rounded-[2.5rem] border border-border shadow-xl shadow-slate-200/40">
        <div className="flex justify-between items-center mb-10 border-b border-border pb-6">
           <h3 className="text-xl font-black text-text uppercase tracking-tighter italic flex items-center gap-3">
              <TrendingUp className="text-secondary w-6 h-6" /> Sonuç Akışı
           </h3>
           <span className="text-[10px] font-black bg-primary/10 text-primary px-5 py-2 rounded-full uppercase tracking-widest border border-primary/20 shadow-sm">{exams.length} KAYITLI DENEME</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
            {exams.length === 0 ? (
               <div className="text-center py-32 border border-dashed border-border rounded-[3rem] bg-slate-50">
                  <BarChart2 className="w-20 h-20 text-textMuted mx-auto mb-6 opacity-10" />
                  <p className="text-textMuted text-xl font-black uppercase tracking-widest italic opacity-40">Henüz bir deneme sonucu girilmedi.</p>
               </div>
            ) : (
               exams.map((ex) => (
                  <div key={ex.id} className="bg-white p-8 rounded-[2rem] border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-slate-200/60 transition-all flex flex-wrap items-center justify-between group relative overflow-hidden shadow-sm">
                     <div className="flex items-center gap-6">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs border shadow-inner", 
                           ex.type === 'TYT' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-secondary/5 text-secondary border-secondary/10')}>
                           {ex.type}
                        </div>
                        <div className="text-left">
                           <h4 className="text-xl font-black text-text group-hover:text-primary transition-colors tracking-tighter uppercase italic">{ex.name}</h4>
                           <p className="text-[10px] text-textMuted mt-1 font-black uppercase tracking-widest opacity-60">Sınav Tarihi: {new Date(ex.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-6">
                        <div className="bg-slate-50 border border-border rounded-2xl px-8 py-4 text-center group-hover:bg-white group-hover:border-primary/20 transition-all shadow-inner group-hover:shadow-lg">
                           <p className="text-[9px] font-black text-textMuted uppercase mb-1 tracking-widest italic opacity-60">TOPLAM SONUÇ</p>
                           <div className="text-3xl font-black text-text italic tracking-tighter whitespace-nowrap">
                              {ex.net} <span className="text-sm opacity-40">NET</span>
                           </div>
                        </div>
                        
                        <button 
                           onClick={() => { if(window.confirm('Bu deneme kaydı silinsin mi?')) deleteDoc(doc(db, 'exams', ex.id)); }}
                           className="text-red-400 opacity-0 group-hover:opacity-100 p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                           title="Kaydı Sil"
                        >
                           <Trash2 className="w-5 h-5"/>
                        </button>
                     </div>
                  </div>
               ))
            )}
        </div>
      </div>
    </div>
  ); 
}
