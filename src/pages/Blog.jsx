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
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-primary font-bold uppercase tracking-widest animate-pulse">
       İÇERİKLER YAZILIYOR...
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-left selection:bg-primary/20 pb-40">
      <div className="max-w-7xl mx-auto px-6 space-y-16 animate-fade-in relative z-20">
        
        {/* 1. SaaS HEADER */}
        <header className="pt-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center md:text-left">
             <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary text-[10px] font-bold tracking-widest uppercase mb-4 shadow-soft">
                <Zap className="w-4 h-4 text-warning" /> Rehberlik & Strateji Atölyesi
             </div>
             <h2 className="text-4xl md:text-5xl font-black text-textPrimary tracking-tighter uppercase leading-none">Pozitif <span className="text-primary italic">Rehber</span></h2>
             <p className="text-textSecondary max-w-xl text-base font-medium opacity-80 leading-relaxed">Sınav sürecinde motivasyonunu artıracak stratejik içerikler.</p>
          </div>

          <div className="relative w-full md:w-80">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
             <input 
               type="text" 
               placeholder="İçeriklerde ara..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-textPrimary outline-none focus:border-primary focus:shadow-premium transition-all shadow-soft"
             />
          </div>
        </header>

        {/* 2. FEATURED POST: SaaS STYLE */}
        {featured && !search && (
          <div 
            onClick={() => navigate(`/blog/${featured.id}`)}
            className="relative h-[450px] rounded-saas-lg overflow-hidden group cursor-pointer border border-slate-200 shadow-premium transition-all hover:-translate-y-1"
          >
             <img 
                src={featured.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'} 
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                alt={featured.title}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
             
             <div className="absolute bottom-0 left-0 p-10 xl:p-16 w-full md:w-2/3">
                <div className="flex items-center gap-4 mb-4">
                   <span className="px-4 py-1.5 rounded-full bg-primary text-white text-[9px] font-bold uppercase tracking-widest">ÖNE ÇIKAN</span>
                   <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">{new Date(featured.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-[1.1] mb-6 group-hover:text-glow-soft transition-all">{featured.title}</h3>
                <button className="px-8 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-premium hover:bg-slate-50 transition-all flex items-center gap-2">OKUMAYA BAŞLA <ArrowRight className="w-4 h-4" /></button>
             </div>
          </div>
        )}

        {/* 3. REGULAR POSTS GRID: CLEAN SaaS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filtered.map(post => (
             <div 
               key={post.id} 
               onClick={() => navigate(`/blog/${post.id}`)}
               className="bg-white border border-slate-200 rounded-saas overflow-hidden flex flex-col h-full group cursor-pointer hover:border-primary/50 hover:shadow-premium transition-all shadow-soft"
             >
                <div className="relative h-48 overflow-hidden">
                   <img src={post.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={post.title} />
                   <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full text-[8px] font-black uppercase tracking-widest text-primary">#{post.category || 'REHBERLİK'}</div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col justify-between">
                   <div>
                      <h4 className="text-lg font-bold text-textPrimary tracking-tight uppercase leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                      <p className="text-xs text-textSecondary font-medium leading-relaxed line-clamp-3 mb-6">{post.excerpt}</p>
                   </div>
                   
                   <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                      <span className="text-[10px] text-textMuted font-bold uppercase tracking-widest">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}</span>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all">
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
