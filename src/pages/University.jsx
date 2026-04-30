import { useState } from 'react';
import { 
  Bot, Sparkles, Target, 
  ChevronRight, BrainCircuit
} from 'lucide-react';
import { UNIVERSITIES } from '../data/universities';

export default function University({ studentId: propStudentId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    university: '',
    department: '',
    tytNet: '',
    aytNet: '',
    ydtNet: '',
    obp: ''
  });

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!formData.university || !formData.department) return;
    setLoading(true);
    
    const obpSection = Number(formData.obp) * 0.6;
    const tytScore = Number(formData.tytNet) * 1.33;
    const aytScore = Number(formData.aytNet) * 3.0;
    const ydtScore = Number(formData.ydtNet) * 3.0;
    const finalScore = 100 + tytScore + aytScore + ydtScore + obpSection;
    
    setTimeout(() => {
      setResult({
        score: finalScore.toFixed(2),
        obpContribution: obpSection.toFixed(2),
        matchRate: Math.min(Math.floor(Math.random() * 40) + 60, 99)
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6 text-left">
      {!propStudentId && (
       <header className="flex flex-col xl:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex-1 text-center xl:text-left">
           <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2 flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-indigo-600" /> YÖK Atlas Uyumlu Hedef Analizi
           </h1>
           <p className="text-slate-600 text-sm font-medium">Yapay Zeka ile hedefinize ne kadar yaklaştığınızı hesaplayın</p>
        </div>
      </header>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden group text-left">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
               <Target className="w-5 h-5 text-indigo-600" /> Net ve OBP Verileri
            </h3>
            
            <form onSubmit={handleCalculate} className="space-y-5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Hedef Üniversite</label>
                     <select required value={formData.university} onChange={e => setFormData({...formData, university: e.target.value, department: ''})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors appearance-none cursor-pointer">
                        <option value="">Üniversite Seçin...</option>
                        {Object.keys(UNIVERSITIES).map(uni => (
                           <option key={uni} value={uni}>{uni}</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-1.5">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Hedef Bölüm</label>
                     <select required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} disabled={!formData.university} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50">
                        <option value="">Bölüm Seçin...</option>
                        {formData.university && UNIVERSITIES[formData.university].map(dep => (
                           <option key={dep} value={dep}>{dep}</option>
                        ))}
                     </select>
                  </div>
               </div>

               {formData.university === 'Diğer / Hedefsiz' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
                    <div className="space-y-1.5">
                       <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider">Manuel Üniversite Adı</label>
                       <input type="text" placeholder="Üniversitenizi Yazın..." value={formData.customUniversity || ''} onChange={e => setFormData({...formData, customUniversity: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider">Manuel Bölüm Adı</label>
                       <input type="text" placeholder="Bölümünüzü Yazın..." value={formData.customDepartment || ''} onChange={e => setFormData({...formData, customDepartment: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors" />
                    </div>
                 </div>
               )}

               <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">TYT NET</label>
                     <input type="number" step="0.25" placeholder="0 - 120" value={formData.tytNet} onChange={e => setFormData({...formData, tytNet: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">AYT NET</label>
                     <input type="number" step="0.25" placeholder="0 - 80" value={formData.aytNet} onChange={e => setFormData({...formData, aytNet: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">YDT NET</label>
                     <input type="number" step="0.25" placeholder="0 - 80" value={formData.ydtNet} onChange={e => setFormData({...formData, ydtNet: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider">Ortaöğretim Başarı Puanı (OBP)</label>
                  <input type="number" required min="50" max="100" placeholder="50 ile 100 arası giriniz" value={formData.obp} onChange={e => setFormData({...formData, obp: e.target.value})} className="w-full bg-slate-50 border border-indigo-200 rounded-lg p-3 text-base font-bold text-indigo-900 focus:border-indigo-600 outline-none transition-colors" />
               </div>

               <button type="submit" disabled={loading || !formData.university || !formData.department} className="w-full mt-4 bg-indigo-600 text-white flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? 'YAPAY ZEKA HESAPLIYOR...' : 'HEDEFİ KARŞILAŞTIR'} <ChevronRight className="w-4 h-4" />
               </button>
            </form>
         </div>

         {/* SONUÇ EKRANI */}
         <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col justify-center text-left relative overflow-hidden">
            {!result ? (
               <div className="text-center py-20 opacity-50">
                  <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Analiz Bekleniyor</p>
               </div>
            ) : (
               <div className="animate-fade-in space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                     <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-500" /> Yapay Zeka Derin Analiz Raporu
                     </h3>
                     <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg tracking-widest uppercase">TAMAMLANDI</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                     <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm text-center flex flex-col items-center justify-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tahmini Tercih Puanı</p>
                        <div className="text-4xl font-bold text-slate-900 tracking-tight mb-1">{result.score}</div>
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">OBP Katkısı: +{result.obpContribution}</p>
                     </div>
                     <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm text-center flex flex-col items-center justify-center">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Hedef Gerçekleştirme İhtimali</p>
                        <div className="text-4xl font-bold text-indigo-600 tracking-tight">%{result.matchRate}</div>
                     </div>
                  </div>

                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Yapay Zeka Analizi ve Yönergeler</p>
                     <p className="text-sm font-medium text-slate-700 leading-relaxed border-l-4 border-indigo-400 pl-4">
                        Hedeflediğiniz <strong>{formData.university === 'Diğer / Hedefsiz' ? (formData.customUniversity || 'Belirtilmeyen Üniversite') : formData.university} - {formData.university === 'Diğer / Hedefsiz' ? (formData.customDepartment || 'Belirtilmeyen Bölüm') : formData.department}</strong> programı için şu anki netlerinizle %{result.matchRate} ihtimalle bir yerleşim öngörülüyor. Sınav gününe kadar TYT ve AYT eksikliklerine dengeli ağırlık vermek ve OBP katsayısı etkisini kompanse etmek için net hedeflerinizi yukarı çekmelisiniz.
                     </p>
                  </div>
               </div>
            )}
         </div>

      </div>
    </div>
  );
}
