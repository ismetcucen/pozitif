import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  BookOpen, Search, Filter, Plus, 
  ChevronRight, Calendar, User, Tag,
  ArrowRight, Sparkles, Zap, BrainCircuit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'blogPosts'), (snap) => {
      const allPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      allPosts.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setPosts(allPosts);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = posts.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.excerpt?.toLowerCase().includes(search.toLowerCase())
  );

  const featured = posts[0];
  const regular = posts.slice(1);

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-primary font-black uppercase tracking-[0.2em] italic animate-pulse">
       İÇERİKLER YAZILIYOR...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-left selection:bg-primary/20 pb-40">
      <div className="max-w-7xl mx-auto px-6 space-y-16 animate-fade-in relative z-20">
        
        {/* 1. HEADER (Ortalandı & Font Küçültüldü) */}
        <header className="pt-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center md:text-left">
             <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-4 italic transition-all hover:bg-white/10">
                <Zap className="w-4 h-4 text-secondary" /> Rehberlik & Strateji Atölyesi
             </div>
             <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Pozitif <span className="text-glow text-primary">Rehber</span></h2>
             <p className="text-textMuted max-w-xl text-base font-medium opacity-60 leading-relaxed italic">Sınav sürecinde motivasyonunu artıracak stratejik içerikler.</p>
          </div>

          <div className="relative w-full md:w-80">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted opacity-50" />
             <input 
               type="text" 
               placeholder="İçeriklerde ara..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white outline-none focus:border-primary transition-all shadow-inner"
             />
          </div>
        </header>

        {/* 2. FEATURED POST (Ortalandı & Font Ayarı) */}
        {featured && !search && (
          <div 
            onClick={() => navigate(`/blog/${featured.id}`)}
            className="relative h-[450px] rounded-[3.5rem] overflow-hidden group cursor-pointer border border-white/5 shadow-2xl transition-transform hover:scale-[1.01]"
          >
             <img 
                src={featured.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'} 
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 opacity-50"
                alt={featured.title}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
             
             <div className="absolute bottom-0 left-0 p-10 xl:p-16 w-full md:w-2/3">
                <div className="flex items-center gap-4 mb-4">
                   <span className="px-4 py-1.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-widest italic">ÖNE ÇIKAN</span>
                   <span className="text-[10px] text-white/50 font-black uppercase tracking-widest italic">{new Date(featured.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-[1.1] mb-6 group-hover:text-primary transition-colors">{featured.title}</h3>
                <p className="text-white/60 text-base font-medium opacity-70 leading-relaxed mb-8 line-clamp-2 italic">{featured.excerpt}</p>
                <button className="px-8 py-3.5 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all italic">OKUMAYA BAŞLA</button>
             </div>
          </div>
        )}

        {/* 3. REGULAR POSTS GRID (Ortalandı) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filtered.map(post => (
             <div 
               key={post.id} 
               onClick={() => navigate(`/blog/${post.id}`)}
               className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-full group cursor-pointer hover:border-primary/30 hover:-translate-y-2 transition-all shadow-xl"
             >
                <div className="relative h-48 overflow-hidden">
                   <img src={post.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70" alt={post.title} />
                   <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white rounded-full text-[8px] font-black uppercase tracking-widest italic">#{post.category || 'REHBERLİK'}</div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col justify-between">
                   <div>
                      <h4 className="text-lg font-black text-white italic tracking-tighter uppercase leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                      <p className="text-[11px] text-textMuted font-medium opacity-60 leading-relaxed line-clamp-3 mb-6">{post.excerpt}</p>
                   </div>
                   
                   <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                      <span className="text-[9px] text-white/30 font-black uppercase tracking-widest italic">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}</span>
                      <div className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-white/30 group-hover:bg-primary group-hover:text-white transition-all">
                         <ArrowRight className="w-4 h-4" />
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
