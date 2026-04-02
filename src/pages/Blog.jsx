import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  BookOpen, Calendar, Clock, 
  ChevronRight, ArrowRight, Search,
  Tag, MessageSquare, Plus, Sparkles
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
    <div className="min-h-screen bg-background flex items-center justify-center">
       <div className="text-primary font-bold uppercase tracking-widest animate-pulse italic">KÜTÜPHANEYE GİRİLİYOR...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden py-12 md:py-20 px-4 md:px-10 selection:bg-primary/20">
      
      {/* DEKORATİF ARKA PLAN ELEMENTLERİ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-white via-transparent to-transparent z-0" />
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute top-[200px] left-[-100px] w-96 h-96 bg-secondary/5 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 md:mb-24 text-center md:text-left">
           <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 border border-blue-200 text-primary text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm">
                 <Sparkles className="w-4 h-4 text-warning" /> BİLGİ ATÖLYESİ
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4 italic">
                 BLOG <span className="text-primary not-italic">ATÖLYESİ</span>
              </h1>
              <p className="text-slate-500 max-w-xl text-base md:text-lg font-medium leading-relaxed">Başarıyı sadece izleme, onu nasıl inşa edeceğini uzman koçlarımızın kaleminden öğren.</p>
           </div>

           <button 
             onClick={() => navigate('/coach/dashboard')}
             className="px-8 py-4 md:py-5 rounded-saas bg-primary text-white font-black text-xs uppercase tracking-widest shadow-button hover:bg-primaryHover transition-all flex items-center gap-3 active:scale-95 shrink-0"
           >
              <Plus className="w-5 h-5" /> YENİ YAZI EKLE
           </button>
        </header>

        {/* BLOG GRID */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
             {posts.map((post, i) => (
               <article 
                 key={post.id}
                 onClick={() => navigate(`/blog/${post.id}`)}
                 className="group relative bg-white border border-slate-200 rounded-saas-lg p-8 md:p-10 flex flex-col justify-between hover:border-primary/40 hover:shadow-premium transition-all cursor-pointer overflow-hidden animate-fade-in"
                 style={{ animationDelay: `${i * 100}ms` }}
               >
                  {/* HOVER EFEKTİ */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:scale-150 transition-transform" />
                  
                  <div className="relative z-10">
                     <div className="flex items-center justify-between gap-4 mb-8">
                        <Tag className="w-5 h-5 text-primary/40" />
                        <span className="text-[10px] font-bold text-primary bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest">{post.category || 'REHBERLİK'}</span>
                     </div>
                     
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase line-clamp-3 mb-6 group-hover:text-primary transition-colors italic">
                        {post.title}
                     </h2>
                  </div>

                  <div className="relative z-10 pt-10 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <Calendar className="w-4 h-4" />
                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('tr-TR') : '31.03.2026'}
                     </div>
                     <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-primary group-hover:text-primary transition-all">
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </article>
             ))}
          </div>
        ) : (
          <div className="py-32 text-center saas-card bg-white border-dashed">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-slate-300" />
             </div>
             <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Şu an içerik bulunmuyor.</p>
          </div>
        )}

      </div>

      {/* ALT CTA */}
      <div className="mt-32 max-w-4xl mx-auto px-6 py-16 md:py-20 bg-primary rounded-saas-lg shadow-premium text-center relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-32 translate-x-32 group-hover:scale-150 transition-transform duration-1000" />
         <div className="relative z-10 space-y-8">
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase">KENDİNİ GELİŞTİRMEYE <br /> <span className="italic opacity-80">HAZIR MISIN?</span></h3>
            <button 
              onClick={() => navigate('/student-login')}
              className="px-12 py-5 md:py-6 bg-white text-primary rounded-saas font-black text-sm uppercase tracking-[0.2em] shadow-premium hover:bg-slate-50 transition-all active:scale-95"
            >
               ÖĞRENCİ PANELİNE GİT
            </button>
         </div>
      </div>

    </div>
  );
}
