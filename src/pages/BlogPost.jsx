import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft, Share2, Zap, Clock, ShieldCheck, ArrowRight
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
    <div className="flex items-center justify-center min-h-screen bg-background">
       <div className="text-primary font-bold uppercase tracking-widest animate-pulse">İÇERİK YÜKLENİYOR...</div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-10 text-center">
       <div className="saas-card p-12 text-lg font-bold text-textMuted uppercase tracking-widest uppercase">MAKALEYE ULAŞILAMADI.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-left pb-32 selection:bg-primary/20">
      <div className="max-w-7xl mx-auto px-6 space-y-12 animate-fade-in relative z-20">
        
        {/* 1. SaaS NAVIGATION */}
        <header className="pt-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <button onClick={() => navigate('/blog')} className="flex items-center gap-4 text-textSecondary hover:text-primary transition-all text-xs font-bold uppercase tracking-widest group">
             <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-soft">
                <ArrowLeft className="w-5 h-5" />
             </div>
             BLOG LİSTESİNE GERİ DÖN
          </button>
          
          <div className="flex items-center gap-6">
             <div className="text-center md:text-right">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 shadow-soft inline-block px-2 bg-blue-50 rounded">YAYIN TARİHİ</p>
                <p className="text-lg font-black text-textPrimary tracking-tighter uppercase">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}</p>
             </div>
             <button className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 hover:bg-slate-100 hover:text-primary transition-all shadow-soft group">
                <Share2 className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* 2. COVER IMAGE : SaaS STYLE */}
        <div className="relative h-[350px] md:h-[500px] rounded-saas-lg overflow-hidden group border border-slate-200 shadow-premium">
           <img 
              src={post.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80'} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-101"
              alt={post.title}
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />
           <div className="absolute bottom-0 left-0 p-10 md:p-16">
              <span className="px-4 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-widest mb-6 inline-block shadow-button">#{post.category || 'REHBERLİK'}</span>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-xl">{post.title}</h1>
           </div>
      </div>

      {/* 3. CONTENT AREA : SaaS STYLE */}
      <div className="max-w-4xl mx-auto space-y-12">
         
         {/* SIDEBAR BİLGİ KARTLARI (Kompakt ve Temiz) */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-8 rounded-saas shadow-soft flex items-center gap-6 group hover:border-primary/30 transition-all">
               <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shrink-0 shadow-soft"><Zap className="w-6 h-6" /></div>
               <div>
                  <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1">ÖZET ÇIKARIM</h4>
                  <p className="text-textSecondary text-xs font-semibold italic leading-relaxed">{post.excerpt || 'Hazırlanıyor...'}</p>
               </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-saas shadow-soft flex items-center gap-6 group hover:border-primary/30 transition-all">
               <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-warning shrink-0 shadow-soft"><Clock className="w-6 h-6" /></div>
               <div>
                  <h4 className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1">OKUMA SÜRESİ</h4>
                  <p className="text-xl font-bold text-textPrimary tracking-tighter uppercase leading-none italic">~6 Dakika</p>
               </div>
            </div>
         </div>

         {/* MAIN ARTICLE (Daha Okunaklı & SaaS Card) */}
         <article className="bg-white border border-slate-200 p-8 md:p-20 rounded-saas-lg shadow-premium relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 opacity-0 group-hover:opacity-100 blur-[80px] rounded-full transition-opacity duration-1000 pointer-events-none" />
            
            <div className="relative z-10">
               <div className="text-textPrimary text-lg font-medium leading-[1.8] space-y-8 whitespace-pre-line">
                  {post.content || 'İçerik yükleniyor...'}
               </div>
            </div>

            <div className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap gap-3">
               {(post.tags || []).map((tag, i) => (
                  <span key={i} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-textMuted hover:bg-white hover:text-primary hover:border-primary transition-all">#{tag}</span>
               ))}
            </div>
         </article>
      </div>
      </div>
    </div>
  );
}
