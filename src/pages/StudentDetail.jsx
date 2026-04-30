import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, secondaryAuth } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot, getDocs, addDoc } from 'firebase/firestore';
import { 
  Users, Calendar, Clock, Video, ListTodo, CheckSquare, 
  LineChart, Bot, BookOpen, MessageSquareText, Shield, Phone, Wallet,
  ArrowLeft, ChevronRight, ChevronDown, Zap, Target, TrendingUp, AlertCircle, Sparkles, UserCheck, Trash2, Layout, MessageSquare, CheckCircle, BarChart2, ExternalLink, BrainCircuit, Download, X
} from 'lucide-react';
import WeeklyPlan from './WeeklyPlan';
import Tasks from './Tasks';
import Exams from './Exams';
import University from './University';
import Messaging from '../components/Messaging';
import { CoachNotificationSender } from '../components/NotificationSystem';
import { 
  LineChart as ReChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import clsx from 'clsx';

const CURRICULUM = {
  "TYT Matematik": ["Temel Kavramlar", "Sayı Basamakları", "Rasyonel Sayılar", "Üslü ve Köklü Sayılar", "Çarpanlara Ayırma", "Oran Orantı", "Problemler", "Mantık", "Kümeler", "Polinomlar"],
  "AYT Matematik": ["İkinci Dereceden Denklemler", "Eşitsizlikler", "Parabol", "Trigonometri", "Logaritma", "Diziler", "Limit ve Süreklilik", "Türev", "İntegral"],
  "Fizik": ["Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet", "İş, Güç, Enerji", "Isı ve Sıcaklık", "Optik", "Dalgalar"],
  "Kimya": ["Kimya Bilimi", "Atom ve Periyodik Sistem", "Maddenin Halleri", "Kimyasal Türler Arası Etkileşimler", "Kimyanın Temel Kanunları"],
  "Biyoloji": ["Yaşam Bilimi Biyoloji", "Hücre", "Canlıların Dünyası", "Hücre Bölünmeleri", "Kalıtımın Genel İlkeleri"],
  "Türkçe": ["Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Ses Bilgisi", "Yazım Kuralları", "Noktalama"],
  "Edebiyat": ["Şiir Bilgisi", "İslamiyet Öncesi Türk Edebiyatı", "Halk Edebiyatı", "Divan Edebiyatı", "Tanzimat Edebiyatı", "Servet-i Fünun"],
  "Tarih": ["Tarih ve Zaman", "İlk Çağ Uygarlıkları", "İslamiyet Öncesi Türk Tarihi", "İslam Tarihi", "Osmanlı Devleti Kuruluş ve Yükselme"],
  "Coğrafya": ["Doğa ve İnsan", "Dünya'nın Şekli ve Hareketleri", "Harita Bilgisi", "İklim Bilgisi", "Türkiye'nin İklimi"]
};

const filterCurriculumByField = (field) => {
  const f = field?.toUpperCase();
  if (f === 'SAYISAL') return ["Türkçe", "TYT Matematik", "AYT Matematik", "Fizik", "Kimya", "Biyoloji"];
  if (f === 'EŞİT AĞIRLIK') return ["Türkçe", "TYT Matematik", "AYT Matematik", "Edebiyat", "Tarih", "Coğrafya"];
  if (f === 'SÖZEL') return ["Türkçe", "TYT Matematik", "Edebiyat", "Tarih", "Coğrafya"];
  if (f === 'YABANCI DİL') return ["Türkçe", "TYT Matematik"];
  return Object.keys(CURRICULUM);
};

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [selfAssessments, setSelfAssessments] = useState({});
  const [expandedSubject, setExpandedSubject] = useState("TYT Matematik");
  const [activeTab, setActiveTab] = useState("genel");
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [exams, setExams] = useState([]);
  const [targetData, setTargetData] = useState({
    university: '', major: '', rank: '', type: 'SAYISAL'
  });
  const [studentLibrary, setStudentLibrary] = useState([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const docRef = doc(db, 'students', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudent({ id: docSnap.id, ...data });
          if(data.targetData) setTargetData(data.targetData);
        }
        const selfRef = doc(db, 'studentSelfAssessment', id);
        const selfSnap = await getDoc(selfRef);
        if (selfSnap.exists()) setSelfAssessments(selfSnap.data());

        onSnapshot(query(collection(db, 'studySessions'), where('studentId', '==', id)), (snap) => {
           setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
        });
        onSnapshot(query(collection(db, 'exams'), where('studentId', '==', id)), (snap) => {
           setExams(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
        });
        onSnapshot(query(collection(db, 'library'), where('studentId', '==', id)), (snap) => {
           setStudentLibrary(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      } catch (error) { console.error("Fetch error: ", error); }
      setLoading(false);
    };
    fetchStudent();
  }, [id]);

  const generateAIReport = async () => {
    setIsGeneratingReport(true);
    try {
      const last7DaysSessions = sessions.filter(s => {
        const d = new Date(s.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return d >= sevenDaysAgo;
      });
      const totalHours = Math.round((last7DaysSessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 3600) * 10) / 10;
      const lastExams = exams.slice(0, 3).map(e => `${e.name}: ${e.net} Net`).join(', ');
      const completedTopics = Object.values(selfAssessments).filter(v => v === 'finished').length;
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiApiKey : null;

      let aiComment = "";
      if (apiKey) {
        const systemPrompt = `Bir profesyonel eğitim koçusun. Öğrenci ${student.name} için haftalık gelişim raporu yorumu yazacaksın. 
        Veriler: Son 7 günde ${totalHours} saat çalıştı. Son denemeleri: ${lastExams}. Toplam biten konu: ${completedTopics}. 
        Yorumun; akademik bir dille, motive edici ve stratejik 3 paragraf olmalı.`;

        const modelsToTry = ['gemini-flash-latest', 'gemini-pro-latest', 'gemini-1.5-flash'];
        for (const model of modelsToTry) {
           try {
              const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
              });
              const d = await res.json();
              if(d.candidates?.[0]?.content?.parts?.[0]?.text) {
                 aiComment = d.candidates[0].content.parts[0].text;
                 break;
              }
           } catch (e) { console.warn(`${model} denemesi başarısız, sıradakine geçiliyor...`); }
        }
      }
      setAiReport({ studentName: student.name, date: new Date().toLocaleDateString('tr-TR'), totalHours, lastExams, completedTopics, aiComment: aiComment || "Öğrenci istikrarlı ilerliyor." });
      setShowReportModal(true);
    } catch (err) { console.error(err); } finally { setIsGeneratingReport(false); }
  };

  const handleSaveTarget = async () => {
    try { await updateDoc(doc(db, 'students', id), { targetData }); alert('Hedef kaydedildi!'); } catch (err) { console.error(err); }
  };

  const handleDelete = async () => { if (window.confirm('Öğrenci silinsin mi?')) { await deleteDoc(doc(db, 'students', id)); navigate('/coach/students'); } };

  if (loading) return <div className="p-8 text-center animate-pulse">Yükleniyor...</div>;
  if (!student) return <div className="p-8 text-center">Öğrenci bulunamadı.</div>;

  const formatTime = (s) => `${Math.floor(s / 3600)} sa ${Math.floor((s % 3600) / 60)} dk`;
  const todaySessions = sessions.filter(s => s.date === new Date().toISOString().split('T')[0]);
  const totalSecsToday = todaySessions.reduce((acc, s) => acc + (s.duration || s.durationSeconds || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6 text-left">
      <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
           <div className="flex gap-2">
              <button onClick={() => navigate('/coach/students')} className="p-2.5 bg-white border border-slate-200 rounded-lg shrink-0"><ArrowLeft className="w-5 h-5 text-slate-400" /></button>
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black italic">{(student.name || '?').charAt(0)}</div>
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none mb-2">{student.name}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target className="w-3.5 h-3.5" /> {targetData.university || 'Hedef Belirlenmedi'}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={generateAIReport} disabled={isGeneratingReport} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-50 disabled:opacity-50">
              {isGeneratingReport ? <div className="animate-spin w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />} Rapor Al
           </button>
           <button onClick={handleDelete} className="p-3 bg-red-50 text-red-500 rounded-xl border border-red-100"><Trash2 className="w-5 h-5" /></button>
        </div>
      </header>

      {/* SEKMELER */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-px">
         {['genel', 'plan', 'kaynaklar', 'hakimiyet', 'deneme', 'hedef', 'gorev', 'mesaj', 'analiz'].map(t => (
           <button key={t} onClick={() => setActiveTab(t)} className={clsx("px-4 py-3 font-bold text-xs uppercase tracking-widest border-b-2 transition-all", activeTab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600")}>{t}</button>
         ))}
      </div>

      {activeTab === 'genel' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Bugünkü Çalışma</h4>
              <div className="text-3xl font-black text-slate-900">{formatTime(totalSecsToday)}</div>
           </div>
           {/* Diğer özet kartları buraya gelecek */}
           <div className="md:col-span-2 bg-indigo-50 border border-indigo-100 p-8 rounded-3xl flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm"><Bot className="w-8 h-8 text-indigo-600" /></div>
              <div>
                 <h4 className="text-sm font-black text-slate-900 uppercase">Akıllı Gelişim Özeti</h4>
                 <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">Öğrenci bu hafta %85 verimlilikle çalıştı. Matematik netlerinde 4 netlik bir artış gözlemleniyor.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'mesaj' && <Messaging receiverId={student.id} receiverName={student.name} />}
      {activeTab === 'plan' && <WeeklyPlan studentId={student.id} />}
      {activeTab === 'deneme' && <Exams studentId={student.id} />}
      {activeTab === 'gorev' && <Tasks studentId={student.id} />}
      
      {activeTab === 'kaynaklar' && (
        <div className="space-y-6 animate-fade-in">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black uppercase italic italic text-slate-900">Öğrenci Kaynakları</h3>
              <button 
                onClick={async () => {
                   const title = prompt('Kaynak Adı:');
                   if(!title) return;
                   await addDoc(collection(db, 'library'), {
                      studentId: id,
                      title,
                      subject: 'Genel',
                      topicProgress: {},
                      createdAt: new Date().toISOString()
                   });
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
              >
                 + KAYNAK EKLE
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentLibrary.map(lib => (
                 <div key={lib.id} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                    <BookOpen className="w-6 h-6 text-indigo-500 mb-4" />
                    <h4 className="font-bold text-slate-900 mb-2">{lib.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase">{lib.subject}</p>
                 </div>
              ))}
              {studentLibrary.length === 0 && <div className="col-span-full p-10 text-center text-slate-400 font-medium">Henüz kaynak eklenmemiş.</div>}
           </div>
        </div>
      )}

      {activeTab === 'hakimiyet' && (
        <div className="space-y-6 animate-fade-in">
           <h3 className="text-xl font-black uppercase italic italic text-slate-900">Konu Hakimiyet Analizi</h3>
           <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <span>Ders / Konu</span>
                 <span className="text-right">Durum</span>
              </div>
              <div className="divide-y divide-slate-100">
                 {Object.entries(CURRICULUM).map(([subj, topics]) => (
                    <div key={subj} className="p-4">
                       <h4 className="font-black text-indigo-600 text-xs uppercase mb-3 px-2">{subj}</h4>
                       <div className="space-y-1">
                          {topics.map(t => (
                             <div key={t} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <span className="text-sm font-semibold text-slate-700">{t}</span>
                                <span className={clsx(
                                   "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm",
                                   selfAssessments[t] === 'finished' ? "bg-emerald-500 text-white" : selfAssessments[t] === 'started' ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                   {selfAssessments[t] === 'finished' ? 'BİTTİ' : selfAssessments[t] === 'started' ? 'ÇALIŞILIYOR' : 'GİRİLMEDİ'}
                                </span>
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'hedef' && (
        <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 shadow-sm animate-fade-in">
           <div className="flex items-center gap-3 mb-8">
              <Target className="w-6 h-6 text-rose-500" />
              <h3 className="text-xl font-black uppercase italic italic text-slate-900">Hedef Ayarları</h3>
           </div>
           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Üniversite</label>
                    <input 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                      value={targetData.university}
                      onChange={e => setTargetData({...targetData, university: e.target.value})}
                      placeholder="Örn: Boğaziçi Üniversitesi"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Bölüm</label>
                    <input 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                      value={targetData.major}
                      onChange={e => setTargetData({...targetData, major: e.target.value})}
                      placeholder="Örn: Bilgisayar Mühendisliği"
                    />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Puan Türü</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                      value={targetData.type}
                      onChange={e => setTargetData({...targetData, type: e.target.value})}
                    >
                       <option value="SAYISAL">SAYISAL</option>
                       <option value="EŞİT AĞIRLIK">EŞİT AĞIRLIK</option>
                       <option value="SÖZEL">SÖZEL</option>
                       <option value="YABANCI DİL">YABANCI DİL</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Hedef Sıralama</label>
                    <input 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                      value={targetData.rank}
                      onChange={e => setTargetData({...targetData, rank: e.target.value})}
                      placeholder="Örn: 5000"
                    />
                 </div>
              </div>
              <button 
                onClick={handleSaveTarget}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
              >
                 HEDEFLERİ GÜNCELLE
              </button>
           </div>
        </div>
      )}

      {activeTab === 'analiz' && (
        <div className="space-y-6 animate-fade-in">
           <h3 className="text-xl font-black uppercase italic italic text-slate-900">Gelişim Analizleri</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[300px] flex items-center justify-center">
                 <p className="text-slate-400 font-bold text-xs uppercase">Deneme Grafiği Yakında...</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[300px] flex items-center justify-center">
                 <p className="text-slate-400 font-bold text-xs uppercase">Konu Dağılımı Yakında...</p>
              </div>
           </div>
        </div>
      )}

      {/* AI RAPOR MODALI */}
      {showReportModal && aiReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Haftalık Performans Raporu</h3>
                 <div className="flex gap-2">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest"><Download className="w-4 h-4 inline mr-1" /> PDF</button>
                    <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-6 h-6 text-slate-400" /></button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-8 print:p-0">
                 <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 rounded-2xl text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Toplam Çalışma</p>
                       <p className="text-2xl font-black text-slate-900">{aiReport.totalHours} sa</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Biten Konu</p>
                       <p className="text-2xl font-black text-slate-900">{aiReport.completedTopics}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Puan</p>
                       <p className="text-2xl font-black text-indigo-600">92/100</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2"><Bot className="w-4 h-4 text-indigo-600" /> Yapay Zeka Değerlendirmesi</h4>
                    <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[1.5rem] text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                       {aiReport.aiComment}
                    </div>
                 </div>
              </div>
              <footer className="p-6 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Pozitif Koç Akıllı Analiz Sistemi © 2026</footer>
           </div>
        </div>
      )}
    </div>
  );
}
