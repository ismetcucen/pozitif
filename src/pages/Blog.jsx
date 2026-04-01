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
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  const featured = posts[0];
  const regular = posts.slice(1);

  return (
    <div className="space-y-16 animate-fade-in relative z-20 pb-20 text-left selection:bg-primary/20">
      
      {/* 1. HERO HEADER AREA */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left">
           <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-[0.3em] uppercase mb-6 italic transition-all hover:bg-white/10 shadow-lg shadow-primary/5">
              <Zap className="w-4 h-4 animate-pulse text-secondary" /> Rehberlik & Strateji Atölyesi
           </div>
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter uppercase italic leading-none">Pozitif <span className="text-glow text-primary">Rehber</span></h2>
           <p className="text-textMuted max-w-xl text-lg font-medium opacity-60 italic leading-relaxed">Sınav sürecinde motivasyonunu artıracak, stratejik hamleler yapmanı sağlayacak içerikler burada.</p>
        </div>

        <div className="relative w-full xl:w-96">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted opacity-50" />
           <input 
             type="text" 
             placeholder="İçeriklerde ara..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-surface/50 border border-border/50 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold text-white outline-none focus:border-primary transition-all shadow-inner italic"
           />
        </div>
      </header>

      {/* 2. FEATURED POST: PREMIUM DARK DESIGN */}
      {featured && !search && (
        <div 
          onClick={() => navigate(`/blog/${featured.id}`)}
          className="relative h-[500px] rounded-[4rem] overflow-hidden group cursor-pointer border border-white/5 shadow-2xl"
        >
           <img 
              src={featured.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80'} 
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 opacity-60"
              alt={featured.title}
           />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.9)_0%,_transparent_100%)] group-hover:opacity-90 transition-opacity" />
           
           <div className="absolute bottom-0 left-0 p-12 w-full xl:w-3/4">
              <div className="flex items-center gap-4 mb-6">
                 <span className="px-5 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-primary/20">ÖNE ÇIKAN</span>
                 <span className="flex items-center gap-2 text-[10px] text-white/50 font-black uppercase tracking-widest italic"><Calendar className="w-4 h-4" /> {new Date(featured.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-4xl xl:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight mb-8 group-hover:text-primary transition-colors">{featured.title}</h3>
              <p className="text-white/60 text-lg font-medium italic opacity-70 leading-relaxed mb-10 max-w-2xl line-clamp-2">{featured.excerpt}</p>
              <button className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all italic">OKUMAYA BAŞLA</button>
           </div>
        </div>
      )}

      {/* 3. REGULAR POSTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
         {loading ? (
            [1,2,3].map(i => <div key={i} className="h-96 bg-surface/40 rounded-[3rem] animate-pulse border border-border/50 shadow-sm" />)
         ) : (
            (search ? filtered : regular).map(post => (
              <div 
                key={post.id} 
                onClick={() => navigate(`/blog/${post.id}`)}
                className="bg-surface/50 border border-border/50 rounded-[3rem] overflow-hidden flex flex-col justify-between group cursor-pointer hover:bg-slate-800/60 hover:border-primary/40 hover:-translate-y-2 transition-all shadow-xl hover:shadow-primary/5 text-left h-full"
              >
                 <div className="relative h-56 overflow-hidden">
                    <img src={post.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70" alt={post.title} />
                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-full text-[8px] font-black text-primary uppercase tracking-widest italic border border-primary/20">#{post.category || 'REHBERLİK'}</div>
                 </div>
                 
                 <div className="p-8 pb-10 flex-1 flex flex-col justify-between">
                    <div>
                       <h4 className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h4>
                       <p className="text-[11px] text-textMuted font-medium opacity-60 italic line-clamp-3 mb-8">{post.excerpt}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                       <span className="flex items-center gap-2 text-[9px] text-textMuted font-black uppercase tracking-widest italic opacity-40">
                          <Calendar className="w-4 h-4 text-primary" /> {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}
                       </span>
                       <div className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center text-textMuted group-hover:bg-primary group-hover:text-white transition-all">
                          <ArrowRight className="w-5 h-5" />
                       </div>
                    </div>
                 </div>
              </div>
            ))
         )}
      </div>

    </div>
  );
}
