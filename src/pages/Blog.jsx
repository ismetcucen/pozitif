import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  BookOpen, Calendar, Rocket, 
  ChevronRight, ArrowRight, Search,
  Tag, MessageSquare, Plus, Sparkles,
  BookMarked
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc')), (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
       <div className="text-primary font-bold uppercase tracking-widest animate-pulse italic">YÜKLENİYOR...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white relative py-12 md:py-24 px-6 md:px-10 selection:bg-blue-100 font-sans">
      
      {/* 1. SECTION: HERO HEADER */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-24">
         <div className="border-b-4 border-slate-900 pb-12 flex flex-col md:flex-row items-end justify-between gap-10">
            <div className="text-left">
               <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-black tracking-[0.2em] uppercase mb-8">
                  <Sparkles className="w-4 h-4 text-warning" /> YENİ NESİL BLOG
               </div>
               <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none uppercase mb-2">
                  BLOG <span className="text-primary underline decoration-slate-900 underline-offset-8 italic">ATÖLYESİ</span>
               </h1>
               <p className="text-slate-500 max-w-2xl text-lg md:text-xl font-bold mt-6">
                  Sınav yolculuğunda sana rehberlik edecek en güncel içerikler, koçlarımızın profesyonel kaleminden burada.
               </p>
            </div>
            <button 
              onClick={() => navigate('/coach/dashboard')}
              className="group px-10 py-6 bg-primary text-white font-black text-sm uppercase tracking-widest shadow-button hover:bg-slate-900 hover:shadow-premium transition-all flex items-center gap-4 shrink-0"
            >
               <Plus className="w-6 h-6" /> YENİ YAZI PAYLAŞ
            </button>
         </div>
      </div>

      {/* 2. SECTION: BLOG GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
        {posts.length > 0 ? (
          posts.map((post, i) => (
            <article 
              key={post.id}
              onClick={() => navigate(`/blog/${post.id}`)}
              className="group cursor-pointer flex flex-col h-full bg-white border-2 border-slate-100 rounded-3xl p-8 md:p-12 hover:border-primary hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] transition-all duration-500 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
               <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                     <span className="text-[10px] font-black text-primary uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-lg">
                        {post.category || 'REHBERLİK'}
                     </span>
                     <div className="h-1 w-1 rounded-full bg-slate-300" />
                     <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <Clock className="w-4 h-4" /> 4 DK
                     </div>
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-[1.1] uppercase mb-8 line-clamp-3 group-hover:text-primary transition-colors italic">
                     {post.title}
                  </h2>
                  
                  <div className="mt-auto flex items-center justify-between pt-10 border-t border-slate-100">
                     <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <Calendar className="w-4 h-4" />
                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('tr-TR') : '31.03.2026'}
                     </div>
                     <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-soft group-hover:shadow-button">
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </div>
            </article>
          ))
        ) : (
          <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 rounded-saas-lg">
             <BookMarked className="w-20 h-20 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Şu an içerik bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* 3. SECTION: KANAL DAVETİ */}
      <div className="max-w-7xl mx-auto mt-32 relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
         <div className="relative z-10 space-y-10">
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none italic">
               Sınav Maratonunda <br /> <span className="text-secondary">Yalnız Değilsin.</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg font-bold">
               Hemen öğrenci paneline giriş yap, koçunla programını oluştur ve başarıyı planla.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
               <button 
                 onClick={() => navigate('/student-login')}
                 className="w-full sm:w-auto px-16 py-6 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-saas shadow-button hover:shadow-glow hover:-translate-y-1 transition-all"
               >
                  HEMEN BAŞLA
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
