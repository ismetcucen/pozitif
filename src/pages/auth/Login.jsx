import React, { useState } from 'react';
import { Mail, Lock, LogIn, Chrome, ShieldCheck, Sparkles } from 'lucide-react';
import { authService } from '../../modules/auth/AuthService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authService.loginWithEmail(email, password);
      toast.success('Giriş başarılı!');
      redirectUser(user.role);
    } catch (err) {
      toast.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await authService.loginWithGoogle();
      toast.success('Google ile giriş başarılı!');
      // Role detection happens in AuthContext, but we can also handle it here
    } catch (err) {
      toast.error('Google girişi başarısız.');
    }
  };

  const redirectUser = (role) => {
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'coach') navigate('/coach/dashboard');
    else if (role === 'admin') navigate('/admin-panel');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a] relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-700" />

      <div className="glass-card w-full max-w-md p-10 relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <Sparkles className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">POZİTİF<span className="text-primary">KOÇ</span></h1>
          <p className="text-text-muted text-sm font-medium mt-2">Geleceğine yön veren akıllı eğitim asistanı.</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">E-Posta</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full bg-glass border border-glass-border rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-glass border border-glass-border rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-premium bg-gradient justify-center py-4 text-sm uppercase tracking-widest"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-glass-border"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-[#1e293b] px-4 text-text-muted">VEYA</span></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-4 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
        >
          <Chrome className="w-5 h-5" /> Google ile Devam Et
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-text-muted uppercase">
          <ShieldCheck className="w-4 h-4 text-primary" /> KVKK Uyumlu & Güvenli Giriş
        </div>
      </div>
    </div>
  );
}
