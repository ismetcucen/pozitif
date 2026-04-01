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
       <div className="text-primary font-black uppercase tracking-[0.2em] italic animate-pulse">İÇERİK YÜKLENİYOR...</div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-10">
       <div className="text-center italic text-white/20 font-black uppercase tracking-widest uppercase">MAKALEYE ULAŞILAMADI.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-left pb-32 selection:bg-primary/30">
      <div className="max-w-7xl mx-auto px-6 space-y-12 animate-fade-in relative z-20">
        
        {/* 1. HEADER & NAVIGATION (Ortalandı & Küçültüldü) */}
        <header className="pt-20 flex flex-col md:flex-row items-center justify-between gap-10">
          <button onClick={() => navigate('/blog')} className="flex items-center gap-4 text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic group">
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <ArrowLeft className="w-5 h-5" />
             </div>
             BLOG LİSTESİNE GERİ DÖN
          </button>
          
          <div className="flex items-center gap-6">
             <div className="text-center md:text-right">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest italic mb-1">YAYIN TARİHİ</p>
                <p className="text-lg font-black text-white italic tracking-tighter uppercase">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}</p>
             </div>
             <button className="w-12 h-12 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:bg-primary/20 hover:text-primary transition-all">
                <Share2 className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* 2. COVER IMAGE (Font Ayarı) */}
        <div className="relative h-[350px] md:h-[500px] rounded-[3rem] overflow-hidden group border border-white/10 shadow-2xl">
           <img 
              src={post.imageUrl || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80'} 
              className="w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-101"
              alt={post.title}
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
           <div className="absolute bottom-0 left-0 p-10 md:p-16">
              <span className="px-4 py-1.5 rounded-lg bg-primary text-white text-[9px] font-black uppercase tracking-widest italic mb-6 inline-block shadow-lg">#{post.category || 'REHBERLİK'}</span>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight">{post.title}</h1>
           </div>
      </div>

      {/* 3. CONTENT AREA (Okuma Genişliği Ortalandı & Metin Boyutu Ayarlandı) */}
      <div className="max-w-4xl mx-auto space-y-16">
         
         {/* SIDEBAR BİLGİ KARTLARI (Yatay ve Kompakt) */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6">
               <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0"><Zap className="w-6 h-6" /></div>
               <div>
                  <h4 className="text-[9px] font-black text-white uppercase tracking-widest italic opacity-40">ÖZET ÇIKARIM</h4>
                  <p className="text-white/60 text-xs font-medium italic leading-relaxed">{post.excerpt || 'Hazırlanıyor...'}</p>
               </div>
            </div>
            <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6">
               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-secondary shrink-0"><Clock className="w-6 h-6" /></div>
               <div>
                  <h4 className="text-[9px] font-black text-white uppercase tracking-widest italic opacity-40">OKUMA SÜRESİ</h4>
                  <p className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">~6 Dakika</p>
               </div>
            </div>
         </div>

         {/* MAIN ARTICLE (Daha Okunaklı & Ortalanmış) */}
         <article className="bg-slate-900/30 border border-white/5 p-8 md:p-16 rounded-[3.5rem] shadow-2xl relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
               {/* Madde: İçerik fontu hafif küçültüldü ve netlik korundu */}
               <div className="text-slate-200 text-lg font-medium leading-[1.8] space-y-8 whitespace-pre-line">
                  {post.content || 'İçerik yükleniyor...'}
               </div>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-3">
               {(post.tags || []).map((tag, i) => (
                  <span key={i} className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest italic text-white/30">#{tag}</span>
               ))}
            </div>
         </article>
      </div>
      </div>
    </div>
  );
}
