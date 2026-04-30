import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  BookOpen, Search, Plus, 
  Trash2, ExternalLink, X, 
  Filter, Tag, BarChart, Sparkles, PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import { useAuth } from '../context/AuthContext';

const CATEGORIES = {
  'TYT': ['Matematik', 'Türkçe', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Felsefe', 'Din Kültürü'],
  'AYT': ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat', 'Tarih', 'Coğrafya'],
  'KPSS': ['Matematik', 'Türkçe', 'Tarih', 'Coğrafya', 'Vatandaşlık', 'Eğitim Bilimleri', 'ÖABT']
};

const PRESET_RESOURCES = [
  // TYT MATEMATİK & TÜRKÇE
  { title: 'Antrenmanlarla Matematik 1', publisher: 'Antrenman Yayınları', difficulty: 'Kolay', examType: 'TYT', subject: 'Matematik', url: 'https://www.youtube.com/@RehberMatematik' },
  { title: 'TYT Matematik Soru Bankası', publisher: 'ÜçDörtBeş (345)', difficulty: 'Orta', examType: 'TYT', subject: 'Matematik' },
  { title: 'Sıfırdan Türkçe', publisher: 'Doktrin Yayınları', difficulty: 'Kolay', examType: 'TYT', subject: 'Türkçe' },
  { title: 'TYT Türkçe Soru Bankası', publisher: 'Limit Yayınları', difficulty: 'Zor', examType: 'TYT', subject: 'Türkçe' },
  
  // AYT MATEMATİK & FEN
  { title: 'AYT Matematik Fasikülleri', publisher: 'Apotemi', difficulty: 'Zor', examType: 'AYT', subject: 'Matematik' },
  { title: 'AYT Fizik Soru Bankası', publisher: 'Nihat Bilgin', difficulty: 'Zor', examType: 'AYT', subject: 'Fizik' },
  { title: 'AYT Kimya Soru Bankası', publisher: 'Orbital Yayınları', difficulty: 'Zor', examType: 'AYT', subject: 'Kimya' },
  { title: 'Selin Hoca AYT Notları', publisher: 'Selin Hoca', difficulty: 'Orta', examType: 'AYT', subject: 'Biyoloji', url: 'https://www.youtube.com/@SelinHoca' },

  // AYT EDEBİYAT & SOSYAL
  { title: 'Edebiyat Soru Bankası', publisher: 'Benim Hocam', difficulty: 'Orta', examType: 'AYT', subject: 'Edebiyat', url: 'https://www.youtube.com/@benimhocam' },
  { title: 'Tarih El Kitabı', publisher: 'Limit Yayınları', difficulty: 'Orta', examType: 'AYT', subject: 'Tarih' },

  // KPSS
  { title: 'KPSS Genel Yetenek Matematik', publisher: 'Benim Hocam', difficulty: 'Orta', examType: 'KPSS', subject: 'Matematik' },
  { title: 'KPSS Tarih Soru Bankası', publisher: 'İsem Yayıncılık', difficulty: 'Zor', examType: 'KPSS', subject: 'Tarih' },
  { title: 'Eğitim Bilimleri Soru Bankası', publisher: 'Pegem', difficulty: 'Zor', examType: 'KPSS', subject: 'Eğitim Bilimleri' },

  // YOUTUBE KANALLARI (REFERANS)
  { title: 'Mert Hoca Matematik', publisher: 'YouTube', difficulty: 'Orta', examType: 'TYT', subject: 'Matematik', url: 'https://www.youtube.com/@MertHoca' },
  { title: 'Vip Fizik', publisher: 'YouTube', difficulty: 'Orta', examType: 'AYT', subject: 'Fizik', url: 'https://www.youtube.com/@VIPFIZIK' },
  { title: 'Görkem Şahin Kimya', publisher: 'YouTube', difficulty: 'Orta', examType: 'AYT', subject: 'Kimya', url: 'https://www.youtube.com/@GorkemSahin' },
  { title: 'Rüştü Hoca Türkçe', publisher: 'YouTube', difficulty: 'Orta', examType: 'TYT', subject: 'Türkçe', url: 'https://www.youtube.com/@RustuHocaileTurkce' }
];

export default function Library() {
  const { userRole } = useAuth();
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState('TYT');
  const [activeSubject, setActiveSubject] = useState('Tümü');

  const [newRes, setNewRes] = useState({ 
    title: '', 
    publisher: '',
    difficulty: 'Orta',
    examType: 'TYT', 
    subject: '', 
    url: ''
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
    if (!newRes.title || !newRes.examType || !newRes.subject) return;
    try {
      await addDoc(collection(db, 'library'), {
        ...newRes,
        createdAt: new Date().toISOString()
      });
      setShowModal(false);
      setNewRes({ title: '', publisher: '', difficulty: 'Orta', examType: 'TYT', subject: '', url: '' });
      toast.success("Kaynak eklendi!");
    } catch (err) { toast.error(err.message); }
  };

  const handleSeed = async () => {
    if (!window.confirm("Profesyonel müfredat kaynaklarını (30+ kaynak ve YouTube kanalı) kütüphanenize yüklemek istiyor musunuz?")) return;
    
    const loadingToast = toast.loading('Kaynaklar veritabanına işleniyor...');
    try {
      for (const res of PRESET_RESOURCES) {
        const exists = resources.find(r => r.title === res.title && r.subject === res.subject);
        if (!exists) {
          await addDoc(collection(db, 'library'), {
            ...res,
            createdAt: new Date().toISOString()
          });
        }
      }
      toast.dismiss(loadingToast);
      toast.success("Kaynak rehberi başarıyla yüklendi!");
    } catch (err) {
      toast.error('Yükleme hatası: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu kaynağı silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, 'library', id));
      toast.success("Kaynak silindi.");
    }
  };

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                       (r.publisher || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = r.examType === activeTab;
    const matchSubject = activeSubject === 'Tümü' || r.subject === activeSubject;
    return matchSearch && matchCategory && matchSubject;
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-primary font-black uppercase tracking-widest animate-pulse italic">
       KAYNAK REHBERİ HAZIRLANIYOR...
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">AKADEMİK ARŞİV</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 leading-tight italic uppercase tracking-tighter">
              KAYNAK <span className="text-primary">KÜTÜPHANESİ</span>
           </h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           {userRole !== 'student' && (
             <button onClick={handleSeed} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-50 text-amber-600 font-black text-[10px] uppercase tracking-widest border border-amber-100 hover:bg-amber-100 transition-all shadow-sm">
                <PlayCircle className="w-4 h-4" /> POPÜLERLERİ YÜKLE
             </button>
           )}
           <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Kitap, kanal veya yayınevi ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-primary transition-all shadow-inner-soft"
              />
           </div>
           {userRole !== 'student' && (
             <button onClick={() => setShowModal(true)} className="px-6 py-3.5 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-primaryHover transition-all flex items-center gap-2 shadow-button shrink-0">
                <Plus className="w-4 h-4" /> EKLE
             </button>
           )}
        </div>
      </header>

      <div className="space-y-6">
         <div className="flex flex-wrap bg-slate-100 border border-slate-200 p-1.5 rounded-3xl w-fit shadow-inner">
            {Object.keys(CATEGORIES).map(cat => (
              <button 
                 key={cat} 
                 onClick={() => { setActiveTab(cat); setActiveSubject('Tümü'); }}
                 className={clsx("px-8 py-3.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.1em]", 
                   activeTab === cat ? "bg-white text-primary shadow-premium" : "text-slate-500 hover:text-slate-900"
                 )}
              >
                 {cat}
              </button>
            ))}
         </div>

         <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveSubject('Tümü')}
              className={clsx("px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                activeSubject === 'Tümü' ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white text-slate-500 border-slate-200 hover:border-primary"
              )}
            >
               TÜMÜ
            </button>
            {CATEGORIES[activeTab].map(subj => (
               <button 
                 key={subj} 
                 onClick={() => setActiveSubject(subj)}
                 className={clsx("px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                   activeSubject === subj ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-primary"
                 )}
               >
                  {subj}
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map(res => (
          <div key={res.id} className="bg-white border border-slate-200 p-8 rounded-[3rem] flex flex-col justify-between group hover:border-primary/30 hover:shadow-premium transition-all duration-500 h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
             
             {userRole !== 'student' && (
               <button onClick={() => handleDelete(res.id)} className="absolute top-6 right-6 p-2.5 bg-slate-50 border border-slate-100 text-slate-300 rounded-xl opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all z-10">
                  <Trash2 className="w-4 h-4" />
               </button>
             )}
  
             <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-soft">
                   {res.publisher === 'YouTube' ? <PlayCircle className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                </div>
                
                <h4 className="text-xl font-black text-slate-900 leading-tight mb-4 pr-6 uppercase italic tracking-tighter">{res.title}</h4>
                
                <div className="flex flex-wrap gap-2 mb-8">
                   <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <Tag className="w-3.5 h-3.5 text-primary/40" /> {res.publisher || 'DİĞER'}
                   </span>
                   <span className={clsx(
                     "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest",
                     res.difficulty === 'Kolay' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                     res.difficulty === 'Orta' ? "bg-amber-50 text-amber-600 border-amber-100" :
                     "bg-red-50 text-red-600 border-red-100"
                   )}>
                      <BarChart className="w-3.5 h-3.5 opacity-40" /> {res.difficulty}
                   </span>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic mb-10 shadow-lg">
                   {res.subject}
                </div>
             </div>

             {res.url ? (
               <a href={res.url} target="_blank" rel="noreferrer" className="w-full py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primaryHover hover:shadow-glow transition-all flex items-center justify-center gap-3 relative z-10 group/btn">
                  {res.publisher === 'YouTube' ? 'KANALI İNCELE' : 'KAYNAĞA GİT'} <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
               </a>
             ) : (
               <div className="w-full py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-300 flex items-center justify-center uppercase tracking-widest italic">
                  Fiziksel Kaynak
               </div>
             )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white border border-slate-200 rounded-[3rem] w-full max-w-xl p-10 md:p-14 shadow-premium relative text-left">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                 <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">YENİ <span className="text-primary">KAYNAK</span></h3>
                 <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Alan</label>
                       <select value={newRes.examType} onChange={e => setNewRes({...newRes, examType: e.target.value, subject: ''})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-primary appearance-none" required>
                          {Object.keys(CATEGORIES).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Ders</label>
                       <select value={newRes.subject} onChange={e => setNewRes({...newRes, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-primary appearance-none" required disabled={!newRes.examType}>
                          <option value="">Seçiniz...</option>
                          {newRes.examType && CATEGORIES[newRes.examType].map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Kaynak Adı</label>
                    <input type="text" required placeholder="Örn: 3D TYT Matematik" value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-primary shadow-inner-soft" />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Yayınevi / Kanal</label>
                       <input type="text" placeholder="Örn: Bilgi Sarmal" value={newRes.publisher} onChange={e => setNewRes({...newRes, publisher: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-primary shadow-inner-soft" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Zorluk Seviyesi</label>
                       <select value={newRes.difficulty} onChange={e => setNewRes({...newRes, difficulty: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-primary appearance-none">
                          <option value="Kolay">Kolay (Başlangıç)</option>
                          <option value="Orta">Orta (Sınav Seviyesi)</option>
                          <option value="Zor">Zor (Derece)</option>
                       </select>
                    </div>
                 </div>

                 <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-button hover:shadow-glow hover:-translate-y-1 transition-all">
                    KÜTÜPHANEYE EKLE
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
