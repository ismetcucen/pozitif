import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Rocket, BrainCircuit, Users, Target, 
  ArrowRight, Sparkles, Zap, Shield,
  Bot, Clock, TrendingUp, CheckCircle2,
  ChevronRight, Map, GraduationCap, LayoutDashboard
} from 'lucide-react';
import clsx from 'clsx';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Özellikler', path: '#features' },
    { label: 'Nasıl Çalışır?', path: '#how-it-works' },
    { label: 'Fiyatlandırma', path: '#pricing' },
    { label: 'Blog', path: '/blog' }
  ];

  const handleNavClick = (path) => {
    if (path.startsWith('/')) {
      navigate(path);
      window.scrollTo(0,0);
    } else {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary selection:bg-primary/20 overflow-x-hidden">
      
      {/* 1. SaaS NAVIGATION */}
      <nav className={clsx(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-300 py-4 px-10 flex items-center justify-between",
        scrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-soft" : "bg-transparent"
      )}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
           <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-button">
              <BrainCircuit className="text-white w-6 h-6" />
           </div>
           <span className="text-xl font-bold text-textPrimary tracking-tight">Pozitif Koç</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
           {navItems.map(item => (
             <button 
               key={item.label} 
               onClick={() => handleNavClick(item.path)} 
               className="text-sm font-semibold text-textSecondary uppercase tracking-widest hover:text-primary transition-colors"
             >
               {item.label}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/coach-login')} className="px-5 py-2.5 rounded-xl border border-slate-200 text-textPrimary font-bold text-xs hover:bg-slate-50 transition-all">KOÇ GİRİŞİ</button>
           <button onClick={() => navigate('/student-login')} className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-xs tracking-widest shadow-button hover:bg-primaryHover transition-all uppercase">ÖĞRENCİ GİRİŞİ</button>
        </div>
      </nav>

      {/* 2. MODERN HERO SECTION */}
      <section className="relative pt-48 pb-32 px-10 flex flex-col items-center justify-center text-center">
         <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-50" />
         
         <div className="relative z-10 max-w-5xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary text-[11px] font-bold tracking-widest uppercase">
               <Sparkles className="w-4 h-4 text-warning" /> YENİ NESİL SINAV KOÇLUĞU
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-textPrimary tracking-tight leading-[0.9]">Hedefe Giden <br /> En <span className="text-primary italic">Kısa</span> Yol.</h1>
            <p className="text-textSecondary max-w-2xl mx-auto text-xl font-medium tracking-tight leading-relaxed">Pozitif Koç, yapay zeka destekli analizleri ve profesyonel takip araçlarıyla sınav sürecini dijital bir başarı öyküsüne dönüştürür.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
               <button onClick={() => navigate('/student-login')} className="w-full sm:w-[350px] py-7 rounded-saas bg-primary text-white font-bold text-lg uppercase tracking-widest shadow-button hover:bg-primaryHover transition-all flex items-center justify-center gap-3 group">
                  ÖĞRENCİ GİRİŞ YAP <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
               </button>
               <button onClick={() => navigate('/coach-login')} className="w-full sm:w-64 py-7 rounded-saas bg-white border border-slate-200 text-textSecondary font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Koç Portalı
               </button>
            </div>
         </div>

         {/* PREVIEW IMAGE: CLEAN SaaS STYLE */}
         <div className="relative z-10 mt-32 max-w-[1200px] mx-auto p-4 bg-white border border-slate-200 rounded-saas-lg shadow-premium">
            <div className="bg-slate-50 rounded-saas overflow-hidden aspect-video flex items-center justify-center">
               <div className="flex flex-col items-center gap-6 opacity-30">
                  <BrainCircuit className="w-20 h-20 text-slate-300" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Mockup Preview Area</p>
               </div>
            </div>
         </div>
      </section>

      {/* 3. SaaS FEATURES: CLEAN GRID */}
      <section id="features" className="py-32 px-10 bg-slate-50 border-t border-slate-200">
         <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'Yapay Zeka Analizi', desc: 'Deneme sonuçlarını milimetrik analiz eden algoritma.', icon: Bot, color: 'bg-blue-50 text-primary border-blue-100' },
              { title: 'Anlık Takip Radarı', desc: 'Koçunun her an yanında olduğunu güvenle hisset.', icon: Clock, color: 'bg-orange-50 text-warning border-orange-100' },
              { title: 'Strateji Kütüphanesi', desc: 'Rehberlik içerikleriyle dolu zengin bir dijital kaynak.', icon: Zap, color: 'bg-purple-50 text-secondary border-purple-100' },
            ].map((feat, i) => (
              <div key={i} className="bg-white border border-slate-200 p-10 rounded-saas shadow-soft hover:shadow-premium hover:-translate-y-2 transition-all flex flex-col items-center text-center">
                 <div className={clsx("w-16 h-16 rounded-[1.25rem] border flex items-center justify-center mb-8", feat.color)}>
                    <feat.icon className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-bold text-textPrimary uppercase tracking-tighter mb-4">{feat.title}</h3>
                 <p className="text-textSecondary text-sm font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* 4. MODERN CTA FOOTER */}
      <footer className="py-32 px-10 bg-white border-t border-slate-200 relative">
         <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-16">
            <h3 className="text-4xl md:text-5xl font-black text-textPrimary tracking-tighter uppercase leading-none text-center xl:text-left">Başarı İçin <br /> <span className="text-primary italic">Doğru Kapıdan</span> Başla.</h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
               <button onClick={() => navigate('/student-login')} className="px-14 py-8 rounded-saas bg-primary text-white font-bold text-lg uppercase tracking-widest shadow-button hover:bg-primaryHover transition-all">ÖĞRENCİ GİRİŞİ</button>
               <button onClick={() => navigate('/coach-login')} className="px-14 py-8 rounded-saas bg-slate-100 text-textSecondary font-bold text-lg uppercase tracking-widest hover:bg-slate-200 transition-all">KOÇ GİRİŞİ</button>
            </div>
         </div>
         <div className="mt-32 pt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between opacity-50">
            <p className="text-xs font-bold text-textSecondary uppercase tracking-widest italic">© 2026 Pozitif Koç. Tüm Hakları Saklıdır.</p>
         </div>
      </footer>

    </div>
  );
}
