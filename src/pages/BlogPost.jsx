import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  BookOpen, Calendar, User, Tag, 
  ArrowLeft, Share2, Sparkles, Zap, 
  BrainCircuit, LayoutDashboard, Clock, 
  MessageSquareText, Shield, ArrowRight
} from 'lucide-react';
import clsx from 'clsx';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'blogPosts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
       <div className="text-primary font-black uppercase tracking-[0.4em] italic animate-pulse">İÇERİK YÜKLENİYOR...</div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-10">
       <div className="text-center italic text-white/20 font-black uppercase tracking-widest">MAKALEYE ULAŞILAMADI.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-left p-6 space-y-12 animate-fade-in relative z-20 pb-32 selection:bg-primary/30">
      
      {/* 1. HEADER & NAVIGATION */}
      <header className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-10">
        <button onClick={() => navigate('/blog')} className="flex items-center gap-4 text-white/40 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest italic group">
           <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
              <ArrowLeft className="w-6 h-6" />
           </div>
           BLOG LİSTESİNE GERİ DÖN
        </button>
        
        <div className="flex items-center gap-8">
           <div className="text-right">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest italic mb-1">YAYIN TARİHİ</p>
              <p className="text-xl font-black text-white italic tracking-tighter uppercase">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}</p>
           </div>
           <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:bg-primary hover:text-white transition-all shadow-xl">
              <Share2 className="w-6 h-6" />
           </button>
        </div>
      </header>

      {/* 2. COVER IMAGE */}
      <div className="max-w-7xl mx-auto relative h-[400px] xl:h-[650px] rounded-[4rem] overflow-hidden group border border-white/10 shadow-2xl">
         <img 
            src={post.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80'} 
            className="w-full h-full object-cover opacity-60"
            alt={post.title}
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
         <div className="absolute bottom-0 left-0 p-12 xl:p-20">
            <span className="px-6 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest italic shadow-2xl mb-8 inline-block">#{post.category || 'REHBERLİK'}</span>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">{post.title}</h1>
         </div>
      </div>

      {/* 3. CONTENT AREA (Yüksek Kontrast & Maksimum Okunabilirlik) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-20">
         
         {/* SIDEBAR */}
         <aside className="xl:col-span-1 space-y-8">
            <div className="bg-surface/40 border border-white/5 p-10 rounded-[3rem] shadow-xl">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Zap className="w-6 h-6" /></div>
                  <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic">Özet Çıkarım</h4>
               </div>
               <p className="text-white/60 text-sm font-medium italic leading-relaxed">{post.excerpt || 'Bu yazı için akıllı özet henüz hazırlanmamış.'}</p>
            </div>

            <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] text-center">
               <p className="text-[10px] font-black text-secondary uppercase tracking-widest italic mb-4 opacity-50">OKUMA SÜRESİ</p>
               <div className="flex items-center justify-center gap-4">
                  <Clock className="w-8 h-8 text-secondary" />
                  <span className="text-2xl font-black text-white italic tracking-tighter uppercase">~6 DAKİKA</span>
               </div>
            </div>
         </aside>

         {/* MAIN ARTICLE (Düzeltildi: Italik Kalktı, Kontrast Arttı) */}
         <article className="xl:col-span-3 bg-surface/30 border border-white/5 p-12 xl:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
               {/* Madde: İçerik artık dik (non-italic) ve saf beyaz */}
               <div className="text-slate-100 text-xl font-medium leading-[1.8] space-y-8 whitespace-pre-line">
                  {post.content || 'İçerik yükleniyor...'}
               </div>
            </div>

            <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap gap-4">
               {(post.tags || []).map((tag, i) => (
                  <span key={i} className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest italic text-white/30 hover:text-white transition-all">#{tag}</span>
               ))}
            </div>
         </article>
      </div>

    </div>
  );
}
