import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, BrainCircuit, Users, Target, 
  ArrowRight, Sparkles, Zap, Shield,
  Bot, Clock, TrendingUp, CheckCircle2,
  LayoutDashboard, Menu, X, Video, MessageSquare, Award, Plus
} from 'lucide-react';
import clsx from 'clsx';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
    window.scrollTo(0,0);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans selection:bg-blue-100">
      
      {/* NAVIGATION */}
      <nav className={clsx(
        "fixed top-0 left-0 w-full z-[110] transition-all duration-300 px-6 md:px-12 flex items-center justify-between",
        scrolled ? "bg-white/90 backdrop-blur-md border-b border-gray-200 py-4 shadow-sm" : "bg-transparent py-6"
      )}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
           <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm group-hover:bg-gray-800 transition-colors">
              <Plus className="w-6 h-6 text-white" strokeWidth={3} />
           </div>
           <span className="text-xl font-bold tracking-tight text-gray-900">PozitifKoç</span>
        </div>

        <div className="hidden md:flex items-center gap-4">
           <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">Giriş Yap</button>
           <button onClick={() => navigate('/register')} className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">Hemen Üye Ol</button>
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
           {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={clsx(
        "fixed inset-0 z-[105] bg-white transition-all duration-300 flex flex-col items-center justify-center space-y-6 p-8 text-center",
        isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
          <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="text-lg font-semibold text-gray-600 hover:text-gray-900">Giriş Yap</button>
          <button onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }} className="w-full max-w-xs py-4 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-sm">Hemen Üye Ol</button>
      </div>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-32 pb-16 md:pt-40 md:pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
         {/* TEXT SIDE */}
         <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700 mb-6 animate-fade-in">
               <Sparkles className="w-4 h-4" /> Sıradan Koçluğu Unutun.
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6 animate-slide-up">
               Eğitimde <br className="hidden md:block" />
               <span className="text-blue-600">Yapay Zeka</span> Devrimi.
            </h1>

            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed mb-8 animate-fade-in max-w-2xl mx-auto lg:mx-0">
               PDF'lerle, excel tablolarıyla ve yorucu telefon trafikleriyle uğraşmayı bırakın. Öğrencilerinizi saniyesinde analiz eden, motive eden ve canlı takip eden tek sisteme geçin.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in w-full sm:w-auto">
               <button onClick={() => navigate('/register?mode=coach')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-sm hover:bg-gray-800 transition-all hover:scale-105 flex items-center justify-center gap-3">
                  Eğitmen Olarak Başla <ArrowRight className="w-4 h-4" />
               </button>
               <button onClick={() => navigate('/register?mode=student')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors">
                  Öğrenci Kaydı
               </button>
            </div>
            
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-gray-500">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Ücretsiz Deneme</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Kredi Kartı Gerekmez</div>
            </div>
         </div>

         {/* IMAGE SIDE */}
         <div className="flex-1 w-full max-w-xl lg:max-w-none animate-slide-up" style={{ animationDelay: '200ms' }}>
            <img src="/hero-illustration.png" alt="PozitifKoç Platform Arayüzü" className="w-full h-auto drop-shadow-2xl rounded-2xl transform hover:-translate-y-2 transition-transform duration-500" />
         </div>
      </section>

      {/* COMPARISON SECTION (BIZ VS DIGERLERI) */}
      <section className="py-24 px-6 md:px-12 bg-gray-50 border-y border-gray-100">
         <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Neden PozitifKoç?</h2>
            <p className="text-gray-500 font-medium text-lg mb-16 max-w-2xl mx-auto">Eski nesil mesajlaşma ve takip uygulamalarının ötesine geçiyoruz.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
               {/* Sıradan Uygulamalar */}
               <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-sm opacity-70">
                  <h3 className="text-xl font-bold text-gray-500 mb-6 flex items-center gap-3">
                    <X className="w-6 h-6 text-red-500" /> Sıradan Uygulamalar
                  </h3>
                  <ul className="space-y-4">
                     <li className="flex items-start gap-3 text-gray-500"><X className="w-5 h-5 text-red-400 shrink-0 mt-0.5"/> PDF ve Excel dosyalarıyla manuel program yaparsınız.</li>
                     <li className="flex items-start gap-3 text-gray-500"><X className="w-5 h-5 text-red-400 shrink-0 mt-0.5"/> Öğrencinin "O an" ne yaptığını göremezsiniz.</li>
                     <li className="flex items-start gap-3 text-gray-500"><X className="w-5 h-5 text-red-400 shrink-0 mt-0.5"/> Deneme analizleri için dışarıdan ek sistemler gerekir.</li>
                     <li className="flex items-start gap-3 text-gray-500"><X className="w-5 h-5 text-red-400 shrink-0 mt-0.5"/> Motivasyon için sadece WhatsApp mesajı atarsınız.</li>
                  </ul>
               </div>

               {/* PozitifKoç */}
               <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl transform md:-translate-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Plus className="w-48 h-48 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                    <Sparkles className="w-7 h-7 text-blue-400" /> PozitifKoç
                  </h3>
                  <ul className="space-y-4 relative z-10">
                     <li className="flex items-start gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5"/> Tutor AI ile saniyeler içinde akıllı çalışma planları üretin.</li>
                     <li className="flex items-start gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5"/> Canlı Tracking Motoruyla öğrencinin anlık eylemlerini izleyin.</li>
                     <li className="flex items-start gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5"/> Tek tıkla derinlemesine AI hedef/üniversite analizi yapın.</li>
                     <li className="flex items-start gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5"/> XP, rozet ve seviye sistemiyle (Gamification) çalışmayı oyuna çevirin.</li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="relative z-10 py-24 px-6 md:px-12 text-center max-w-4xl mx-auto">
         <div className="space-y-8 bg-blue-50 border border-blue-100 p-12 md:p-16 rounded-[3rem]">
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
               Koçluk Tarzınızı <br className="hidden md:block"/> Yükseltmeye Hazır Mısınız?
            </h3>
            <p className="text-gray-500 font-medium text-lg">Öğrencileriniz daha iyisini hak ediyor. Siz de öyle.</p>
            <div className="flex justify-center mt-8">
               <button onClick={() => navigate('/register')} className="px-10 py-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-1">Hemen Başlayın</button>
            </div>
         </div>

         <div className="mt-24 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" strokeWidth={3} />
               </div>
               <span className="text-lg font-bold text-gray-900">PozitifKoç</span>
            </div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">© 2026 POZİTİFKOÇ SAAS PLATFORMU.</p>
         </div>
      </footer>

    </div>
  );
}
