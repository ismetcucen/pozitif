import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Settings as SettingsIcon, Save, Key, Brain, Info, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
        if (settingsSnap.exists()) {
          setApiKey(settingsSnap.data().geminiApiKey || '');
        }
      } catch (error) {
        console.error('Ayarlar yüklenemedi:', error);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanKey = apiKey.trim();
      await setDoc(doc(db, 'settings', 'global'), {
        geminiApiKey: cleanKey,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setApiKey(cleanKey);
      toast.success('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi: ' + error.message);
    }
    setIsSaving(false);
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Ayarlar yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 pt-4 md:pt-6 text-left">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2 flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-indigo-600" /> Sistem Ayarları
          </h1>
          <p className="text-slate-600 text-sm font-medium">Platformun yapay zeka ve genel yapılandırma ayarlarını buradan yönetin.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API KEY SETTINGS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-indigo-600" />
               </div>
               <div>
                  <h3 className="text-base font-bold text-slate-900">Yapay Zeka Yapılandırması</h3>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Akıllı Rehberi etkinleştirmek için Google Gemini anahtarınızı girin.</p>
               </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" /> Google Gemini API Key
                </label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AI_... (AISTUDIO'dan alabilirsiniz)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-mono text-slate-900 focus:border-indigo-600 outline-none transition-all shadow-inner"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {isSaving ? <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <Save className="w-4 h-4" />}
                Ayarları Kaydet
              </button>
            </form>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900 mb-1">Güvenlik Notu</h4>
              <p className="text-xs text-emerald-700 font-medium leading-relaxed">Girdiğiniz API anahtarı veritabanında saklanır ve sadece sistem rehberi tarafından AI yanıtları üretmek için kullanılır. Asla 3. şahıslarla paylaşılmaz.</p>
            </div>
          </div>
        </div>

        {/* INFO SIDEBAR */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-indigo-500" /> Nasıl Anahtar Alınır?
              </h4>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">1</div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Google AI Studio'ya gidin.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">2</div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">"Get API Key" butonuna tıklayarak yeni bir anahtar oluşturun.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">3</div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Oluşturduğunuz anahtarı kopyalayıp buraya yapıştırın.</p>
                </li>
              </ul>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="mt-6 block text-center py-2 px-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
              >
                Google AI Studio Aç
              </a>
           </div>
        </div>
      </div>
    </div>
  );
}
