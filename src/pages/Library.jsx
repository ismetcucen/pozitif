import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { 
  BookOpen, Search, Filter, Plus, 
  ChevronRight, FileText, Video, Link as LinkIcon, 
  Trash2, Download, ExternalLink, GraduationCap, X, 
  Zap, Clock, Sparkles, ChevronDown
} from 'lucide-react';
import clsx from 'clsx';

// Madde 17-20: Sınav ve Ders Yapısı
const EXAM_TYPES = {
  TYT: ['Türkçe', 'Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü'],
  AYT_SAYISAL: ['Matematik', 'Geometri', 'Fizik', 'Kimya', 'Biyoloji'],
  AYT_ESIT_AGIRLIK: ['Matematik', 'Geometri', 'TDE (Edebiyat)', 'Tarih-1', 'Coğrafya-1'],
  YDT: ['İngilizce']
};

export default function Library() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [newRes, setNewRes] = useState({ 
    title: '', 
    examType: '', // TYT, AYT_SAYISAL vb.
    subject: '', 
    url: '', 
    description: '' 
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'library'), (snap) => {
      setResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRes.title || !newRes.url) return;
    try {
      await addDoc(collection(db, 'library'), {
        ...newRes,
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      setNewRes({ title: '', examType: '', subject: '', url: '', description: '' });
      alert("✅ Kaynak başarıyla eklendi!");
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu kaynağı silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, 'library', id));
    }
  };

  const filtered = resources.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in relative z-20 pb-20 text-left">
      
      {/* 1. HEADER & ACTIONS (Madde 15 & 16) */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left">
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter uppercase italic leading-none">Kaynaklar</h2>
           <p className="text-textMuted text-lg font-medium opacity-60 italic leading-relaxed">Öğrencileriniz için önerilecek ders notları, videolar ve dokümanlar.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
           <div className="relative w-full xl:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted opacity-50" />
              <input 
                type="text" 
                placeholder="Kaynaklarda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface/50 border border-border/50 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white outline-none focus:border-primary transition-all shadow-inner italic"
              />
           </div>
           <button onClick={() => setShowModal(true)} className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all italic flex items-center justify-center gap-3">
              <Plus className="w-4 h-4" /> + Kaynak Ekle
           </button>
        </div>
      </header>

      {/* 2. KAYNAK LİSTESİ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map(res => (
          <div key={res.id} className="bg-surface/50 border border-border/50 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:bg-slate-800/60 transition-all shadow-xl text-left h-full">
             <div>
                <div className="flex items-center justify-between mb-6">
                   <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                      <BookOpen className="w-6 h-6" />
                   </div>
                   <button onClick={() => handleDelete(res.id)} className="w-8 h-8 flex items-center justify-center text-rose-500/30 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
                <h4 className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight mb-2 truncate">{res.title}</h4>
                <div className="flex items-center gap-2 mb-6">
                   <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase italic tracking-widest border border-primary/10">{res.examType?.replace('_', ' ')}</span>
                   <span className="px-3 py-1 bg-white/5 text-textMuted rounded-full text-[9px] font-black uppercase italic tracking-widest border border-white/5">{res.subject}</span>
                </div>
             </div>

             <a href={res.url} target="_blank" rel="noreferrer" className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest italic group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-3 shadow-md">
                KAYNAĞI GÖRÜNTÜLE <ExternalLink className="w-4 h-4" />
             </a>
          </div>
        ))}
      </div>

      {/* 3. KAYNAK EKLE MODAL (Madde 17-20) */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-fade-in">
           <div className="bg-surface border border-border/50 rounded-[3rem] w-full max-w-xl p-10 shadow-2xl relative text-left">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase italic">+ Kaynak Ekle</h3>
                 <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-textMuted hover:text-white">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50 pl-1">KAYNAK ADI</label>
                    <input type="text" required placeholder="Örn: 3D TYT Matematik Deneme" value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-primary italic" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50 pl-1">SINAV TÜRÜ</label>
                       <select value={newRes.examType} onChange={e => setNewRes({...newRes, examType: e.target.value, subject: ''})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-primary appearance-none italic" required>
                          <option value="">Seçiniz</option>
                          <option value="TYT">TYT</option>
                          <option value="AYT_SAYISAL">AYT Sayısal</option>
                          <option value="AYT_ESIT_AGIRLIK">AYT Eşit Ağırlık</option>
                          <option value="YDT">YDT</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50 pl-1">DERS</label>
                       <select value={newRes.subject} onChange={e => setNewRes({...newRes, subject: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-primary appearance-none italic" required disabled={!newRes.examType}>
                          <option value="">Seçiniz</option>
                          {newRes.examType && EXAM_TYPES[newRes.examType].map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-50 pl-1">KAYNAK LİNKİ (URL)</label>
                    <input type="url" required placeholder="https://..." value={newRes.url} onChange={e => setNewRes({...newRes, url: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-primary italic" />
                 </div>

                 <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-102 transition-all italic mt-4">KAYNAĞI SİSTEME EKLE</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
