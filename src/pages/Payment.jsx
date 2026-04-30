import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../modules/payments/PaymentService';
import { 
  CheckCircle2, Crown, Sparkles, 
  ShieldCheck, Zap, ArrowRight, BrainCircuit 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Payment() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const PLANS = [
    {
      id: 'monthly',
      name: 'Aylık Gelişim',
      price: '299',
      features: ['AI Asistan Erişimi', '7/24 Koç Desteği', 'Sınırsız Analiz', 'Haftalık Program'],
      color: 'primary'
    },
    {
      id: 'yearly',
      name: 'Yıllık Başarı',
      price: '2499',
      features: ['Tüm Aylık Özellikler', '%30 Tasarruf', 'Öncelikli Destek', 'Kişisel Gelişim Raporu'],
      color: 'secondary',
      popular: true
    }
  ];

  const handlePayment = async (plan) => {
    setLoading(true);
    toast.loading('Ödeme sayfasına yönlendiriliyorsunuz...');
    
    // Simüle edilmiş ödeme süreci
    setTimeout(async () => {
      try {
        await paymentService.activateSubscription(currentUser.uid, userData.role, plan.id);
        toast.dismiss();
        toast.success(`${plan.name} Paketiniz Aktif Edildi!`);
        navigate(userData.role === 'student' ? '/student/dashboard' : '/coach/dashboard');
      } catch (err) {
        toast.error('Ödeme sırasında bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 relative overflow-hidden flex flex-col items-center">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent)]" />
      
      <header className="relative z-10 text-center space-y-4 mb-16 animate-fade-in">
        <div className="inline-flex p-3 bg-white/5 rounded-2xl border border-white/10 mb-4">
          <Crown className="w-8 h-8 text-amber-500 animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
          POZİTİF <span className="text-primary">PREMIUM</span>
        </h1>
        <p className="text-text-muted max-w-xl text-sm md:text-lg font-medium leading-relaxed">
          {userData?.subscriptionStatus === 'trial' 
            ? 'Deneme süreniz başarıyla başladı. Tüm özellikleri sınırsız kullanmak için bir plan seçin.'
            : 'Sınav yolculuğunda bir adım öne geçmek için en uygun planı seç.'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl relative z-10 animate-slide-up">
        {PLANS.map((plan) => (
          <div 
            key={plan.id}
            className={`glass-card p-10 flex flex-col justify-between border-t-8 transition-all hover:scale-[1.02] ${plan.popular ? 'border-secondary shadow-2xl shadow-secondary/20' : 'border-primary'}`}
          >
            <div>
              {plan.popular && (
                <span className="bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full absolute -top-4 left-1/2 -translate-x-1/2 shadow-lg">
                  EN POPÜLER SEÇENEK
                </span>
              )}
              <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black italic">₺{plan.price}</span>
                <span className="text-text-muted text-xs font-bold uppercase tracking-widest">{plan.id === 'yearly' ? '/ yıl' : '/ ay'}</span>
              </div>

              <div className="space-y-4 mb-10">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => handlePayment(plan)}
              disabled={loading}
              className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-4 group active:scale-95 ${plan.popular ? 'bg-secondary text-white shadow-xl shadow-secondary/30 hover:bg-indigo-700' : 'bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primaryHover'}`}
            >
              {loading ? 'İŞLENİYOR...' : (
                <>PLAN SEÇ VE BAŞLA <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-20 relative z-10 flex flex-wrap justify-center gap-12 opacity-50">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck className="w-5 h-5" /> 256-bit SSL Güvenlik
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
          <Zap className="w-5 h-5" /> Anında Aktivasyon
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
          <BrainCircuit className="w-5 h-5" /> AI Desteği Dahil
        </div>
      </div>
    </div>
  );
}
