import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft, Calendar, User, 
  Share2, MessageSquare, Clock,
  BookOpen, Sparkles, Tag, ChevronLeft
} from 'lucide-react';
import clsx from 'clsx';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const docSnap = await getDoc(doc(db, 'blogPosts', id));
      if (docSnap.exists()) setPost({ id: docSnap.id, ...docSnap.data() });
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-primary font-bold uppercase tracking-widest animate-pulse italic">
       MAKALE HAZIRLANIYOR...
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-8">
       <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-soft border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300" />
       </div>
       <h1 className="text-3xl font-black text-slate-900 uppercase italic">YAZI BULUNAMADI</h1>
       <button onClick={() => navigate('/blog')} className="px-10 py-5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-saas shadow-button">BLOG'A DÖN</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden py-12 md:py-24 px-4 md:px-10 selection:bg-primary/20">
      
      {/* DEKORATİF ARKA PLAN */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-white via-transparent to-transparent opacity-50 z-0" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* GERİ DÖN & PAYLAŞ */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
           <button 
             onClick={() => navigate('/blog')}
             className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all shadow-soft group"
           >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> BLOG'A DÖN
           </button>
           <button className="p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all shadow-soft active:scale-90">
              <Share2 className="w-5 h-5" />
           </button>
        </div>

        <article className="bg-white border border-slate-200 rounded-saas-lg shadow-premium overflow-hidden animate-slide-up">
           
           {/* HEADER AREA */}
           <div className="p-8 md:p-16 border-b border-slate-100 bg-slate-50/30">
              <div className="flex flex-wrap items-center gap-4 mb-8 md:mb-10 text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                 <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-soft">
                    <Calendar className="w-4 h-4 text-primary" /> 
                    {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('tr-TR') : '31.03.2026'}
                 </span>
                 <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-soft">
                    <Tag className="w-4 h-4 text-secondary" /> {post.category || 'REHBERLİK'}
                 </span>
                 <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-soft">
                    <Clock className="w-4 h-4 text-warning" /> 5 DK OKUMA
                 </span>
              </div>
              <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight uppercase italic mb-8 md:mb-10">
                 {post.title}
              </h1>
              <div className="flex items-center gap-4 pt-8 border-t border-slate-200/50">
                 <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-black italic shadow-button">P</div>
                 <div>
                    <div className="text-sm font-black text-slate-900 uppercase">Pozitif Koç</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Akademi Yazarı</div>
                 </div>
              </div>
           </div>

           {/* CONTENT AREA */}
           <div className="p-8 md:p-20">
              <div className="prose prose-slate prose-lg md:prose-xl max-w-none text-slate-700 leading-relaxed font-medium">
                 {post.content?.split('\n').map((line, i) => (
                   <p key={i} className="mb-8 md:mb-10 first-letter:text-4xl first-letter:font-black first-letter:text-primary first-letter:mr-1 first-letter:float-left first-letter:mt-1">
                      {line}
                   </p>
                 ))}
              </div>
              
              {/* ALT AKSİYONLAR */}
              <div className="mt-20 pt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-6">
                    <button className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all font-black text-xs uppercase tracking-widest group">
                       <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" /> YORUM YAP
                    </button>
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">DİĞER YAZILARA GÖZ AT</span>
                    <button onClick={() => navigate('/blog')} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-primary hover:bg-primary hover:text-white transition-all shadow-soft group">
                       <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform rotate-180" />
                    </button>
                 </div>
              </div>
           </div>

        </article>

        {/* ALTCTA: ÖĞRENCİ PANELİ */}
        <div className="mt-20 p-10 md:p-14 bg-slate-900 rounded-saas-lg shadow-premium text-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative z-10 space-y-8">
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none italic">BAŞARIYI <span className="text-primary not-italic opacity-100 uppercase italic">ŞANSA BIRAKMA</span></h3>
              <p className="text-slate-400 font-medium text-sm md:text-base opacity-70">En güncel stratejiler ve analizlerle hedeflerine hemen ulaş.</p>
              <button 
                onClick={() => navigate('/student-login')}
                className="px-10 py-5 bg-white text-primary rounded-saas font-black text-xs uppercase tracking-widest shadow-premium hover:shadow-glow hover:-translate-y-1 transition-all"
              >
                 ÜCRETSİZ BAŞLA
              </button>
           </div>
        </div>

      </div>

    </div>
  );
}
