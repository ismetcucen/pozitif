import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  BookOpen, Calendar, ArrowRight, Search,
  Clock, Sparkles, BookMarked, Zap, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  'REHBERLİK':   { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-500' },
  'STRATEJİ':    { bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-500' },
  'MOTİVASYON':  { bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-500' },
  'SAĞLIK':      { bg: 'bg-emerald-50',text: 'text-emerald-600',dot: 'bg-emerald-500' },
  'DEFAULT':     { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
};

function getCat(cat) {
  return CATEGORY_COLORS[cat?.toUpperCase()] || CATEGORY_COLORS['DEFAULT'];
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc')), (snap) => {
      if (snap.empty) {
        // Fallback Mockup Data
        setPosts([
          {
            id: 'mock1',
            title: "YKS 2026: Yeni Nesil Sorularla Nasıl Başa Çıkılır?",
            category: "STRATEJİ",
            excerpt: "Sadece bilgi değil, yorumlama gücünün de ölçüldüğü yeni sistemde netlerini artırmanın yolları.",
            createdAt: { toDate: () => new Date() }
          },
          {
            id: 'mock2',
            title: "Sınav Senesinde Uyku Düzeni ve Beyin Fonksiyonları",
            category: "SAĞLIK",
            excerpt: "Neden gece çalışmamalısın? Uykunun öğrenme ve hafıza üzerindeki kritik etkileri.",
            createdAt: { toDate: () => new Date() }
          },
          {
            id: 'mock3',
            title: "Derece Yapan Öğrencilerin Günlük Program Sırları",
            category: "MOTİVASYON",
            excerpt: "İlk 1000'e giren öğrencilerin ortak alışkanlıkları ve zaman yönetimi teknikleri.",
            createdAt: { toDate: () => new Date() }
          }
        ]);
      } else {
        setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = posts.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#f8f8fc] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Yükleniyor...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f8fc] font-sans selection:bg-indigo-100">
      
      {/* HERO */}
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.2),transparent_50%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-36">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-8 backdrop-blur-sm">
            <Zap className="w-3 h-3" /> Yeni Nesil Eğitim İçerikleri
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white tracking-tighter leading-none uppercase mb-6">
            KOÇLUK<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 italic">
              BLOGU
            </span>
          </h1>

          <p className="text-slate-400 max-w-xl text-base md:text-lg font-semibold mb-12 leading-relaxed">
            YKS yolculuğunu daha akıllı planlaman için uzman stratejiler, psikoloji ve başarı hikayeleri.
          </p>

          {/* SEARCH */}
          <div className="relative max-w-lg">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Makale veya kategori ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white/10 transition-all backdrop-blur-sm"
            />
          </div>

          {/* STATS ROW */}
          <div className="flex flex-wrap gap-8 mt-16 pt-10 border-t border-white/10">
            {[
              { label: 'Makale', value: posts.length },
              { label: 'Konular', value: '12+' },
              { label: 'Okuyucu', value: '2K+' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">

        {/* Section Title */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
              {search ? `"${search}" için ${filtered.length} sonuç` : `${filtered.length} Makale`}
            </p>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {search ? 'Arama Sonuçları' : 'Tüm Yazılar'}
            </h2>
          </div>
          <TrendingUp className="w-6 h-6 text-slate-300" />
        </div>

        {/* GRID */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((post, i) => {
              const cat = getCat(post.category);
              const isFeatured = i === 0 && !search;
              return (
                <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className={`group cursor-pointer rounded-[2rem] overflow-hidden border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                    isFeatured
                      ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 border-indigo-500/30 text-white'
                      : 'bg-white border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  {/* Top color band */}
                  {!isFeatured && (
                    <div className={`h-1.5 ${cat.dot}`} />
                  )}

                  <div className="p-8 md:p-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        isFeatured ? 'bg-white/15 text-white' : `${cat.bg} ${cat.text}`
                      }`}>
                        {post.category || 'REHBERLİK'}
                      </span>
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${
                        isFeatured ? 'text-indigo-200' : 'text-slate-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" /> 4 dk
                      </div>
                    </div>

                    {isFeatured && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4 w-fit">
                        <Sparkles className="w-3 h-3" /> Öne Çıkan
                      </div>
                    )}

                    <h2 className={`font-black tracking-tight leading-tight uppercase line-clamp-3 mb-4 transition-colors ${
                      isFeatured
                        ? 'text-2xl md:text-4xl text-white'
                        : 'text-lg md:text-xl text-slate-900 group-hover:text-indigo-600'
                    }`}>
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className={`text-sm font-medium line-clamp-2 mb-6 leading-relaxed ${
                        isFeatured ? 'text-indigo-200' : 'text-slate-500'
                      }`}>
                        {post.excerpt}
                      </p>
                    )}

                    <div className={`mt-auto flex items-center justify-between pt-6 border-t ${
                      isFeatured ? 'border-white/10' : 'border-slate-100'
                    }`}>
                      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                        isFeatured ? 'text-indigo-300' : 'text-slate-400'
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {post.createdAt?.toDate
                          ? post.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'Yeni'}
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${
                        isFeatured
                          ? 'bg-white text-indigo-600'
                          : 'bg-slate-900 text-white group-hover:bg-indigo-600'
                      }`}>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <BookMarked className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase mb-2">Sonuç Bulunamadı</h3>
            <p className="text-slate-400 font-medium text-sm">Farklı bir arama terimi deneyin.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-24 relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.2),transparent_70%)]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Ücretsiz Başla
            </div>
            <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
              BAŞARIYA GİDEN<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 italic">DOĞRU YOLDASIN.</span>
            </h2>
            <p className="text-slate-400 font-semibold text-sm md:text-base max-w-md mx-auto">
              Seni anlayan akıllı bir sistemle YKS'ye hazırlanmaya hemen başla.
            </p>
            <button
              onClick={() => navigate('/student-login')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-50 transition-all hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
            >
              HEMEN KAYIT OL <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
