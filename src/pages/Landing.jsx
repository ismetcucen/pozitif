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

  // Madde: Üst Menü Linklerini Yönetme
  const navItems = [
    { label: 'Özellikler', path: '#features' },
    { label: 'Nasıl Çalışır?', path: '#how-it-works' },
    { label: 'Fiyatlandırma', path: '#pricing' },
    { label: 'Blog', path: '/blog' } // Blog sayfası artık aktif!
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
    <div className="min-h-screen bg-[#0f172a] text-left selection:bg-primary/20 overflow-x-hidden">
      
      {/* 1. GHOST NAVIGATION (Düzeltildi) */}
      <nav className={clsx(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-500 py-6 px-10 flex items-center justify-between",
        scrolled ? "bg-slate-900/90 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent"
      )}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 transform rotate-3">
              <BrainCircuit className="text-white w-6 h-6" />
           </div>
           <span className="text-xl font-bold text-white tracking-tight">Pozitif Koç</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
           {navItems.map(item => (
             <button 
               key={item.label} 
               onClick={() => handleNavClick(item.path)} 
               className="text-[10px] font-black text-textMuted uppercase tracking-widest italic hover:text-white transition-colors"
             >
               {item.label}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/coach-login')} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-xs hover:bg-white/5 transition-all">EĞİTMEN GİRİŞİ</button>
           <button onClick={() => navigate('/student-login')} className="px-10 py-4 rounded-xl bg-primary text-white font-black text-xs tracking-widest shadow-[0_0_30px_rgba(107,76,255,0.4)] hover:scale-105 transition-all uppercase italic">ÖĞRENCİ GİRİŞİ 🚀</button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-48 pb-32 px-10 flex flex-col items-center justify-center text-center overflow-hidden">
         <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" />
         <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full animate-pulse-slow delay-1000 pointer-events-none" />
         
         <div className="relative z-10 max-w-5xl space-y-10">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-[0.4em] uppercase italic transition-all hover:bg-white/10 shadow-2xl shadow-primary/5">
               <Rocket className="w-5 h-5 animate-bounce text-secondary" /> Yeni Nesil Sınav Koçluğu Deneyimi
            </div>

            <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tight leading-[0.9]">Hedefe Giden <br /> En <span className="text-primary text-glow">Kısa</span> Yol.</h1>
            <p className="text-textMuted max-w-2xl mx-auto text-xl font-medium opacity-70 leading-relaxed">Pozitif Koç, yapay zeka destekli analizleri ve profesyonel takip araçlarıyla sınav sürecini dijital bir başarı öyküsüne dönüştürür.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
               <button onClick={() => navigate('/student-login')} className="w-full sm:w-[400px] py-9 rounded-[3rem] bg-primary text-white font-black text-xl uppercase tracking-[0.2em] shadow-[0_0_60px_rgba(107,76,255,0.6)] hover:scale-105 hover:bg-primaryHover transition-all italic flex items-center justify-center gap-4">
                  ÖĞRENCİ GİRİŞ YAP <ArrowRight className="w-8 h-8" />
               </button>
               <button onClick={() => navigate('/coach-login')} className="w-full sm:w-72 py-8 rounded-[3rem] bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all italic opacity-60 hover:opacity-100">
                  Eğitmen Portalı
               </button>
            </div>
         </div>
      </section>

      {/* 3. FEATURES (ID Eklendi) */}
      <section id="features" className="py-32 px-10 relative">
         <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'Yapay Zeka Analizi', desc: 'Deneme sonuçlarını analiz eden algoritma.', icon: Bot, color: 'from-primary to-blue-600' },
              { title: 'Anlık Takip Radarı', desc: 'Koçunun her an yanında olduğunu hisset.', icon: Clock, color: 'from-secondary to-orange-400' },
              { title: 'Strateji Atölyesi', desc: 'Sınav psikolojisi ve rehberlik içerikleri.', icon: Zap, color: 'from-emerald-400 to-teal-500' },
            ].map((feat, i) => (
              <div key={i} className="bg-surface/50 border border-border/50 p-10 rounded-[3rem] flex flex-col items-center text-center group hover:-translate-y-2 transition-all">
                 <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-glow", feat.color)}>
                    <feat.icon className="text-white w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-black text-white italic uppercase mb-4">{feat.title}</h3>
                 <p className="text-textMuted text-sm font-medium opacity-60 italic">{feat.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* 4. CTA FOOTER */}
      <footer className="py-32 px-10 bg-slate-950 border-t border-white/5 relative">
         <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-16">
            <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none text-center xl:text-left">Başarı İçin <br /> <span className="text-primary text-glow">Doğru Kapıdan</span> Başla.</h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
               <button onClick={() => navigate('/student-login')} className="px-14 py-8 rounded-[3.5rem] bg-primary text-white font-black text-lg uppercase tracking-[0.3em] shadow-2xl hover:scale-110 transition-all italic border-b-8 border-primaryHover active:border-b-0 active:translate-y-2">ÖĞRENCİ GİRİŞİ</button>
               <button onClick={() => navigate('/coach-login')} className="px-14 py-8 rounded-[3.5rem] bg-white/5 border border-white/10 text-white font-black text-lg uppercase tracking-[0.3em] hover:bg-white/10 transition-all italic border-b-8 border-white/10 active:border-b-0 active:translate-y-2">EĞİTMEN GİRİŞİ</button>
            </div>
         </div>
         <div className="mt-32 pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between opacity-30">
            <p className="text-[10px] font-black text-textMuted uppercase tracking-widest italic">© 2026 Pozitif Koç. Tüm Hakları Saklıdır.</p>
         </div>
      </footer>

    </div>
  );
}
