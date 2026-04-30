import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, CheckCircle2, 
  Target, Sparkles, TrendingDown, Clock
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { aiHub } from '../../modules/ai-hub/AIService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AnalysisDashboard({ studentId }) {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [insight, setInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    if (!studentId) return;
    
    const q = query(
      collection(db, 'exams'), 
      where('studentId', '==', studentId),
      orderBy('createdAt', 'asc')
    );
    
    const unsub = onSnapshot(q, (snap) => {
      const examData = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: new Date(data.date || data.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          net: data.totalNet || data.net || 0,
          rawDate: data.createdAt || data.date,
          wrongSubjects: data.wrongSubjects || []
        };
      });
      setExams(examData);
      setLoading(false);
    });

    return () => unsub();
  }, [studentId]);

  const runAIAnalysis = async () => {
    if (!userData?.isVIP) {
      setShowVipModal(true);
      return;
    }

    if (exams.length === 0) {
      toast.error('Analiz için henüz yeterli deneme verisi yok.');
      return;
    }
    
    setAiLoading(true);
    toast.loading('Yapay Zeka deneme verilerini inceliyor...');
    try {
      const stats = exams.map(e => ({ name: e.name, net: e.net, wrongSubjects: e.wrongSubjects }));
      const analysis = await aiHub.analyzePerformance(studentId, stats);
      
      setInsight({
        score: analysis.score || 0,
        risk: analysis.risk || 'Bilinmiyor',
        message: analysis.insight || 'Analiz tamamlandı.',
        badges: analysis.badges || []
      });
      toast.dismiss();
      toast.success('AI Analizi Tamamlandı!', { icon: '✨' });
    } catch (err) {
      toast.dismiss();
      toast.error('Analiz başarısız: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Metrics Calculation
  const avgNet = exams.length > 0 ? (exams.reduce((acc, curr) => acc + curr.net, 0) / exams.length).toFixed(1) : 0;
  
  let developmentRate = 0;
  let isDropping = false;
  if (exams.length >= 2) {
    const lastExam = exams[exams.length - 1].net;
    const prevExam = exams[exams.length - 2].net;
    if (prevExam > 0) {
      developmentRate = (((lastExam - prevExam) / prevExam) * 100).toFixed(1);
    }
    isDropping = lastExam < prevExam;
  }

  if (loading) {
    return <div className="p-8 text-center text-text-muted italic animate-pulse font-black uppercase text-xs tracking-widest">Performans verileri yükleniyor...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl flex items-center gap-4 border border-borderLight border-b-4 border-b-secondary hover:border-b-secondary/70 shadow-sm transition-all">
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><Target className="w-5 h-5" /></div>
          <div>
             <p className="text-xs font-semibold uppercase text-textSecondary tracking-wide">Ortalama Net</p>
             <p className="text-xl font-black text-textPrimary">{avgNet}</p>
          </div>
        </div>

        <div className={`bg-white p-5 rounded-xl flex items-center gap-4 border border-borderLight border-b-4 shadow-sm transition-all ${isDropping ? 'border-b-red-400' : 'border-b-emerald-400'}`}>
          <div className={`p-3 rounded-xl ${isDropping ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
            {isDropping ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
          </div>
          <div>
             <p className="text-xs font-semibold uppercase text-textSecondary tracking-wide">Son İvme</p>
             <p className="text-xl font-black text-textPrimary">{developmentRate > 0 ? '+' : ''}{developmentRate}%</p>
          </div>
        </div>

        <div className={`bg-white p-5 rounded-xl flex items-center gap-4 border border-borderLight border-b-4 shadow-sm transition-all ${isDropping ? 'border-b-red-400 bg-red-50/50' : 'border-b-emerald-400'}`}>
          <div className={`p-3 rounded-xl ${isDropping ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-emerald-50 text-emerald-500'}`}>
            {isDropping ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
             <p className="text-xs font-semibold uppercase text-textSecondary tracking-wide">Risk Durumu</p>
             <p className={`text-xl font-black ${isDropping ? 'text-red-500' : 'text-textPrimary'}`}>{isDropping ? 'Yüksek' : 'Düşük'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl flex items-center gap-4 border border-borderLight border-b-4 border-b-blue-400 shadow-sm transition-all">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-500"><Clock className="w-5 h-5" /></div>
          <div>
             <p className="text-xs font-semibold uppercase text-textSecondary tracking-wide">Girilen Deneme</p>
             <p className="text-xl font-black text-textPrimary">{exams.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-borderLight p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-textPrimary flex items-center gap-2">
              Net Gelişim Grafiği
              {isDropping && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full border border-red-200 animate-pulse">DİKKAT</span>}
            </h3>
            {exams.length === 0 && <span className="text-xs text-textSecondary">Veri yok</span>}
          </div>
          
          <div className="h-[280px] w-full">
            {exams.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={exams}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDropping ? '#ef4444' : '#6366f1'} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={isDropping ? '#ef4444' : '#6366f1'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)'}}
                    itemStyle={{color: '#1e293b', fontSize: '12px', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="net" stroke={isDropping ? '#ef4444' : '#6366f1'} strokeWidth={2.5} fillOpacity={1} fill="url(#colorNet)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-borderLight rounded-xl">
                 <p className="text-xs font-medium text-textSecondary">Henüz bir deneme sınavı girilmedi.</p>
               </div>
            )}
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="space-y-4">
          <div className={`bg-white rounded-xl border p-6 shadow-sm relative overflow-hidden ${insight?.risk === 'Yüksek' ? 'border-red-200 bg-red-50/30' : 'border-borderLight'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 flex items-center gap-2 ${insight?.risk === 'Yüksek' ? 'text-red-500' : 'text-secondary'}`}>
              <Sparkles className="w-4 h-4" /> AI ANALİST
            </h3>
            
            {insight ? (
              <div className="space-y-4">
                 <p className="text-sm font-medium text-textSecondary leading-relaxed">{insight.message}</p>
                 <div className="flex flex-wrap gap-2">
                    {insight.badges.map(b => (
                      <span key={b} className={`px-2 py-1 text-[10px] font-bold rounded-full ${insight.risk === 'Yüksek' ? 'bg-red-100 text-red-600' : 'bg-secondary/10 text-secondary'}`}>#{b}</span>
                    ))}
                 </div>
                 <div className="pt-3 border-t border-borderLight">
                    <p className="text-xs font-semibold text-textSecondary uppercase mb-2">Performans Skoru</p>
                    <div className="flex items-center gap-3">
                       <div className="flex-1 h-2 bg-section rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${insight.score > 70 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{width: `${insight.score}%`}} />
                       </div>
                       <span className={`font-black text-sm ${insight.score > 70 ? 'text-emerald-500' : 'text-red-500'}`}>{insight.score}</span>
                    </div>
                 </div>
                 <button onClick={runAIAnalysis} disabled={aiLoading} className="mt-2 text-xs font-semibold text-textSecondary hover:text-secondary transition-colors w-full text-center">
                    {aiLoading ? 'Güncelleniyor...' : 'Yeniden Analiz Et'}
                 </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-textSecondary text-sm leading-relaxed">
                   {userData?.isVIP ? 'Analizini başlatmak için butona bas.' : 'Bu özellik sadece Premium üyelere özeldir.'}
                </p>
                <button 
                  onClick={runAIAnalysis}
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center gap-2 bg-secondary text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-secondary/90 transition-colors shadow-sm shadow-secondary/20 disabled:opacity-50"
                >
                  {aiLoading ? 'Analiz ediliyor...' : (userData?.isVIP ? 'Analizi Başlat' : 'Premium\'a Geç')}
                </button>

                {/* VIP Upgrade Modal */}
                {showVipModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white border border-borderLight p-8 rounded-2xl max-w-md w-full shadow-2xl">
                      <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                           <Sparkles className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold text-textPrimary text-center mb-2">Premium Ayrıcalığı</h2>
                      <p className="text-textSecondary text-sm text-center mb-6 leading-relaxed">
                        Yapay Zeka destekli derin analiz sadece <strong className="text-amber-500">VIP</strong> üyelerimize özeldir.
                      </p>
                      
                      <div className="space-y-2 mb-6">
                         {['Sınırsız AI Deneme Analizi', 'Otomatik Yanlış Konu Tespiti', 'Öncelikli Veli Bildirimleri'].map((feat, idx) => (
                           <div key={idx} className="flex items-center gap-3 text-sm font-medium text-textSecondary">
                             <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {feat}
                           </div>
                         ))}
                      </div>

                      <div className="flex gap-3">
                        <button onClick={() => setShowVipModal(false)} className="flex-1 py-3 text-sm font-medium text-textSecondary hover:text-textPrimary border border-borderLight rounded-xl transition-colors">İptal</button>
                        <button onClick={() => { setShowVipModal(false); toast.success('Satın alma sayfasına yönlendiriliyor'); }} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold py-3 rounded-xl shadow-sm transition-all hover:opacity-90">VIP'ye Geç</button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
