import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft, Calendar, Share2, Clock,
  BookOpen, Sparkles, Tag, ChevronLeft, ArrowRight
} from 'lucide-react';

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const docSnap = await getDoc(doc(db, 'blogPosts', id));
      if (docSnap.exists()) setPost({ id: docSnap.id, ...docSnap.data() });
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8f8fc] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Makale Hazırlanıyor...</p>
      </div>
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-[#f8f8fc] flex flex-col items-center justify-center p-6 text-center gap-6">
      <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-sm border border-slate-200">
        <BookOpen className="w-10 h-10 text-slate-200" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 uppercase italic">Yazı Bulunamadı</h1>
      <button onClick={() => navigate('/blog')} className="px-10 py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">
        Blog'a Dön
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f8fc] font-sans selection:bg-indigo-100">

      {/* DARK HERO HEADER */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-10 pt-10 pb-16 md:pb-24">
          {/* NAV */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:bg-white/15 transition-all group backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Blog'a Dön
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:bg-white/15 transition-all backdrop-blur-sm"
            >
              <Share2 className="w-4 h-4" /> {copied ? 'Kopyalandı ✓' : 'Paylaş'}
            </button>
          </div>

          {/* META */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-[10px] font-black text-indigo-300 uppercase tracking-widest">
              <Tag className="w-3 h-3" /> {post.category || 'Rehberlik'}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Calendar className="w-3 h-3" />
              {post.createdAt?.toDate
                ? post.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Yazı Tarihi'}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Clock className="w-3 h-3" /> 5 dk okuma
            </span>
          </div>

          {/* TITLE */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight uppercase mb-10">
            {post.title}
          </h1>

          {/* AUTHOR */}
          <div className="flex items-center gap-4 pt-8 border-t border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
              P
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase">Pozitif Koç</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Akademi Yazarı</p>
            </div>
          </div>
        </div>
      </div>

      {/* ARTICLE BODY */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-20">
        <article className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-16">
            <div className="prose prose-slate prose-lg max-w-none">
              {post.content?.split('\n').filter(Boolean).map((line, i) => (
                <p
                  key={i}
                  className="text-slate-700 leading-relaxed mb-6 text-base md:text-lg font-medium"
                  style={i === 0 ? {} : {}}
                >
                  {i === 0 ? (
                    <>
                      <span className="float-left text-6xl font-black text-indigo-600 leading-none mr-3 mt-1">{line[0]}</span>
                      {line.slice(1)}
                    </>
                  ) : line}
                </p>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-8 md:px-16 pb-10 border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {['YKS', 'Strateji', 'Başarı'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  #{tag}
                </span>
              ))}
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all hover:shadow-lg active:scale-95"
            >
              <Share2 className="w-4 h-4" /> Paylaş
            </button>
          </div>
        </article>

        {/* CTA */}
        <div className="mt-12 relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.2),transparent_70%)]" />
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Ücretsiz Başla
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-tight">
              BAŞARIYA ŞANS BIRAKMAK MI?<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 italic">
                ASLA.
              </span>
            </h3>
            <p className="text-slate-400 font-semibold text-sm max-w-md mx-auto">
              Seni anlayan akıllı bir sistemle YKS'ye hazırlanmaya hemen başla.
            </p>
            <button
              onClick={() => navigate('/student-login')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-all hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
            >
              ÜCRETSİZ KAYIT OL <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NAV BOTTOM */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Tüm Yazılar
          </button>
        </div>
      </div>
    </div>
  );
}
