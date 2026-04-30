import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Messaging from '../../components/Messaging';
import { 
  ArrowLeft, Target, Book, Video, Calendar, 
  Sparkles, Save, Plus, Trash2, Clock, MessageSquare, Link as LinkIcon,
  BrainCircuit, ChevronDown, ChevronUp, CheckCircle2, FileImage, Download,
  LayoutGrid, ListFilter
} from 'lucide-react';
import { coachingService } from '../../modules/coaching/CoachingService';
import { aiHub } from '../../modules/ai-hub/AIService';
import { db } from '../../firebase';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { UNIVERSITIES } from '../../data/universities';
import { reportService } from '../../modules/reporting/ReportService';
import { YKS_SUBJECTS } from '../../data/yksSubjects';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('goals');
  const [loading, setLoading] = useState(true);
  const [selectedUni, setSelectedUni] = useState('');
  const [examAnalyses, setExamAnalyses] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [expandedExam, setExpandedExam] = useState(null);

  // Öğrenci bilgilerini dinle
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'students', id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStudent(data);
        if (data?.target?.university) setSelectedUni(data.target.university);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  // Deneme analizlerini dinle
  useEffect(() => {
    const q = query(
      collection(db, 'examAnalyses'),
      where('studentId', '==', id)
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Manuel sıralama
      msgs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setExamAnalyses(msgs.slice(0, 20));
    }, err => console.error('examAnalyses coach error:', err));
    return () => unsub();
  }, [id]);

  // Çalışma seanslarını dinle (Haftalık)
  useEffect(() => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const q = query(
      collection(db, 'studySessions'),
      where('studentId', '==', id),
      where('startTime', '>=', lastWeek)
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.startTime?.toMillis?.() || 0) - (a.startTime?.toMillis?.() || 0));
      setStudySessions(data);
    }, err => console.error('studySessions error:', err));
    return () => unsub();
  }, [id]);

  // Konu hakimiyetini dinle
  const [masteryData, setMasteryData] = useState({});
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'subjectMastery', id), (d) => {
      if (d.exists()) setMasteryData(d.data().levels || {});
    });
    return unsub;
  }, [id]);

  const handleUpdateGoals = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const uniVal = formData.get('university');
    const customUni = formData.get('customUniversity');
    const customDep = formData.get('customDepartment');
    
    const finalUni = uniVal === 'Diğer / Hedefsiz' ? (customUni || 'Diğer') : uniVal;
    const finalDep = uniVal === 'Diğer / Hedefsiz' ? (customDep || 'Diğer') : formData.get('department');

    const goalData = {
      university: finalUni,
      department: finalDep,
      goalRank: formData.get('goalRank'),
      grade: formData.get('grade'),
      field: formData.get('field')
    };
    try {
      await coachingService.updateStudentGoals(id, goalData);
      toast.success('Hedefler güncellendi!');
    } catch (err) {
      toast.error('Güncelleme başarısız.');
    }
  };

  const handleAISuggestion = async () => {
    toast.loading('AI program önerisi hazırlıyor...');
    const suggestion = await aiHub.getProgramSuggestion(student);
    toast.dismiss();
    toast.success('AI Önerisi Hazır!');
    console.log('AI Suggestion:', suggestion);
    // Suggestion would be applied to the program state
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse">YÜKLENİYOR...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-glass rounded-xl transition-all">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black italic tracking-tighter uppercase">{student?.name}</h1>
              {student?.currentStatus?.isStudying && (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black animate-pulse">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  CANLI: {student.currentStatus.subject}
                </div>
              )}
            </div>
            <p className="text-text-muted text-xs font-bold uppercase">{student?.grade}. Sınıf • {student?.field}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/parent/${id}`);
            toast.success('Veli Paneli linki kopyalandı! Veliye gönderebilirsiniz.');
          }}
          className="btn-premium bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
        >
          <LinkIcon className="w-4 h-4" /> VELİ PANELİ LİNKİ
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex gap-4 border-b border-glass-border flex-wrap">
        {['goals', 'program', 'mastery', 'resources', 'denemeler', 'rapor', 'mesaj'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-white'}`}
          >
            {tab === 'goals' ? 'Hedefler'
              : tab === 'program' ? 'Program'
              : tab === 'mastery' ? '🧠 Konu Hakimiyeti'
              : tab === 'resources' ? 'Kaynaklar'
              : tab === 'denemeler' ? '📊 Denemeler'
              : tab === 'rapor' ? '📈 Rapor'
              : 'Mesajlaşma'}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main>
        {activeTab === 'goals' && (
          <form onSubmit={handleUpdateGoals} className="glass-card p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted">Hedef Üniversite</label>
                <select name="university" value={selectedUni} onChange={e => setSelectedUni(e.target.value)} className="w-full bg-glass border border-glass-border rounded-xl px-4 py-3 appearance-none">
                  <option value="">Üniversite Seçin...</option>
                  {Object.keys(UNIVERSITIES).map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted">Hedef Bölüm</label>
                <select name="department" defaultValue={student?.target?.department} disabled={!selectedUni} className="w-full bg-glass border border-glass-border rounded-xl px-4 py-3 appearance-none disabled:opacity-50">
                  <option value="">Bölüm Seçin...</option>
                  {selectedUni && UNIVERSITIES[selectedUni] && UNIVERSITIES[selectedUni].map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedUni === 'Diğer / Hedefsiz' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-glass/30 rounded-xl border border-glass-border">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary">Manuel Üniversite Adı</label>
                  <input name="customUniversity" placeholder="Örn: X Üniversitesi" defaultValue={student?.target?.university} className="w-full bg-glass border border-primary/30 rounded-xl px-4 py-3 focus:border-primary outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary">Manuel Bölüm Adı</label>
                  <input name="customDepartment" placeholder="Örn: Y Bölümü" defaultValue={student?.target?.department} className="w-full bg-glass border border-primary/30 rounded-xl px-4 py-3 focus:border-primary outline-none" />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted">Hedef Sıralama</label>
                <input name="goalRank" defaultValue={student?.target?.goalRank} className="w-full bg-glass border border-glass-border rounded-xl px-4 py-3" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted">Sınıf</label>
                <select name="grade" defaultValue={student?.grade} className="w-full bg-glass border border-glass-border rounded-xl px-4 py-3 appearance-none">
                  <option value="5">5. Sınıf</option>
                  <option value="6">6. Sınıf</option>
                  <option value="7">7. Sınıf</option>
                  <option value="8">8. Sınıf</option>
                  <option value="9">9. Sınıf</option>
                  <option value="10">10. Sınıf</option>
                  <option value="11">11. Sınıf</option>
                  <option value="12">12. Sınıf</option>
                  <option value="Mezun">Mezun</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-text-muted">Alan</label>
                <select name="field" defaultValue={student?.field} className="w-full bg-glass border border-glass-border rounded-xl px-4 py-3 appearance-none">
                  <option value="LGS">LGS</option>
                  <option value="SAYISAL">Sayısal</option>
                  <option value="EŞİT AĞIRLIK">Eşit Ağırlık</option>
                  <option value="SÖZEL">Sözel</option>
                  <option value="YABANCI DİL">Yabancı Dil</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-premium bg-primary w-full justify-center">
              <Save className="w-5 h-5" /> GÜNCELLE
            </button>
          </form>
        )}

        {activeTab === 'program' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black italic tracking-tighter uppercase">Haftalık Program</h3>
              <div className="flex gap-2">
                 {/* Student Late Warning */}
                 {student?.currentStatus?.isLate && (
                    <button 
                      onClick={() => coachingService.sendWhatsAppWarning('905000000000', student.name, 'Matematik')}
                      className="btn-premium bg-emerald-500 text-xs animate-bounce"
                    >
                      <MessageSquare className="w-4 h-4" /> WHATSAPP UYARISI
                    </button>
                 )}
                 <button onClick={handleAISuggestion} className="btn-premium bg-glass border border-glass-border text-xs">
                    <Sparkles className="w-4 h-4 text-primary" /> AI ÖNERİSİ AL
                 </button>
                 <button onClick={() => toast.success('Görev Ekleme Paneli Açıldı')} className="btn-premium bg-primary text-xs">
                    <Plus className="w-4 h-4" /> GÖREV EKLE
                 </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map(day => (
                <div key={day} className="glass-card p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">{day}</h4>
                    <span className="text-[10px] font-bold text-text-muted">0 Görev</span>
                  </div>
                  <div className="space-y-4">
                    {/* Tasks would be mapped here */}
                    <p className="text-text-muted text-xs italic">Henüz bir çalışma planlanmadı.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8">
              <h3 className="text-lg font-black italic tracking-tighter uppercase mb-6 flex items-center gap-2">
                <Book className="text-primary" /> Kaynak Kitaplar
              </h3>
              <div className="space-y-4 mb-6">
                {['Konu Anlatım', 'Soru Bankası', 'Deneme', 'Fasikül'].map(cat => (
                  <div key={cat} className="flex justify-between items-center p-3 bg-glass border border-glass-border rounded-xl">
                    <span className="text-xs font-bold">{cat}</span>
                    <Plus className="w-4 h-4 text-primary cursor-pointer hover:scale-110" />
                  </div>
                ))}
              </div>
              <p className="text-text-muted text-[10px] font-medium italic">Toplam 0 kayıtlı kaynak.</p>
            </div>
            <div className="glass-card p-8">
              <h3 className="text-lg font-black italic tracking-tighter uppercase mb-6 flex items-center gap-2">
                <Video className="text-secondary" /> Takip Edilen Kanallar
              </h3>
              <div className="space-y-4 mb-6">
                <div className="bg-glass border border-glass-border rounded-xl p-4">
                  <p className="text-text-muted text-xs italic">Henüz YouTube kanalı eklenmedi.</p>
                </div>
              </div>
              <button className="btn-premium bg-secondary w-full text-xs">
                + KANAL EKLE
              </button>
            </div>
          </div>
        )}
        {activeTab === 'denemeler' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-black italic tracking-tighter uppercase">Deneme Analizleri</h3>
              <span className="text-xs font-bold bg-glass border border-glass-border px-2 py-1 rounded-full ml-auto">{examAnalyses.length} analiz</span>
            </div>

            {examAnalyses.length === 0 ? (
              <div className="glass-card p-10 text-center text-text-muted">
                <FileImage className="w-10 h-10 opacity-30 mx-auto mb-3" />
                <p className="text-sm">Öğrenci henüz deneme yüklemedi.</p>
              </div>
            ) : (
              examAnalyses.map(item => (
                <div key={item.id} className="glass-card overflow-hidden">
                  <button
                    onClick={() => setExpandedExam(expandedExam === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-glass/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{item.examName}</p>
                        <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {item.createdAt?.toDate
                            ? item.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Tarih yok'}
                        </p>
                      </div>
                    </div>
                    {expandedExam === item.id
                      ? <ChevronUp className="w-4 h-4 text-text-muted" />
                      : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </button>

                  {expandedExam === item.id && (
                    <div className="border-t border-glass-border p-6 space-y-5">
                      {item.imageUrl && (
                        <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={item.imageUrl}
                            alt="Deneme"
                            className="max-h-56 rounded-xl object-contain border border-glass-border hover:opacity-80 transition-opacity"
                          />
                        </a>
                      )}
                      <div className="bg-glass/30 border border-glass-border rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <BrainCircuit className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Analizi</span>
                        </div>
                        <pre className="text-xs text-text-muted whitespace-pre-wrap font-sans leading-relaxed">{item.analysisText}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'mastery' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-black italic tracking-tighter uppercase">Müfredat Hakimiyeti</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(YKS_SUBJECTS).map(subject => {
                const topics = YKS_SUBJECTS[subject] || [];
                const mastered = topics.filter(t => masteryData[`${subject}_${t}`] === 'mastered').length;
                const learning = topics.filter(t => masteryData[`${subject}_${t}`] === 'learning').length;
                const progress = Math.round(((mastered * 1 + learning * 0.5) / topics.length) * 100) || 0;

                return (
                  <div key={subject} className="glass-card p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase text-primary tracking-widest">{subject}</h4>
                      <span className="text-[10px] font-bold text-text-muted">{mastered}/{topics.length} Konu</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-text-muted">Gelişim</span>
                          <span className="text-primary">%{progress}</span>
                       </div>
                       <div className="h-1.5 bg-glass border border-glass-border rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="flex-1 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-center">
                          <p className="text-[9px] font-bold text-emerald-600 uppercase">Tamamlanan</p>
                          <p className="text-sm font-black text-emerald-700">{mastered}</p>
                       </div>
                       <div className="flex-1 p-2 bg-blue-500/5 border border-blue-500/10 rounded-lg text-center">
                          <p className="text-[9px] font-bold text-blue-600 uppercase">Çalışılan</p>
                          <p className="text-sm font-black text-blue-700">{learning}</p>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'rapor' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-black italic tracking-tighter uppercase">Haftalık Çalışma Raporu</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={async () => {
                    const stats = {
                      totalHours: (studySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60).toFixed(1),
                      solvedQuestions: 0, // Bu veri henüz takip edilmiyor, mock veya 0
                      completionRate: 85, // Mock veri, görevlerden hesaplanabilir
                      lastExamNet: examAnalyses[0]?.analysisText?.match(/(\d+) net/)?.[1] || '-'
                    };
                    toast.loading('PDF Raporu Hazırlanıyor...');
                    await reportService.generateParentReport(student, stats);
                    toast.dismiss();
                    toast.success('Rapor oluşturuldu!');
                  }}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  <BrainCircuit className="w-4 h-4" /> VELİ GELİŞİM RAPORU (PDF)
                </button>
                <button 
                  onClick={() => {
                    const headers = ['Tarih', 'Ders', 'Konu', 'Tür', 'Süre (Dakika)'];
                    const rows = studySessions.map(s => [
                      s.startTime?.toDate().toLocaleDateString('tr-TR'),
                      s.subject,
                      s.topic,
                      s.activityType,
                      s.duration
                    ]);
                    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${student?.name || 'ogrenci'}_haftalik_rapor.csv`;
                    link.click();
                  }}
                  className="flex items-center gap-2 bg-glass border border-glass-border px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/10 transition-colors"
                >
                  <Download className="w-4 h-4" /> Raporu İndir (.CSV)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="glass-card p-5">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Toplam Seans</p>
                  <p className="text-2xl font-black text-primary">{studySessions.length}</p>
               </div>
               <div className="glass-card p-5">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Toplam Süre</p>
                  <p className="text-2xl font-black text-primary">
                    {Math.round(studySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0))} dk
                  </p>
               </div>
               <div className="glass-card p-5">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">En Çok Çalışılan</p>
                  <p className="text-lg font-bold text-primary truncate">
                    {studySessions.length > 0 ? studySessions[0].subject : '-'}
                  </p>
               </div>
            </div>

            <div className="glass-card overflow-hidden">
               <table className="w-full text-left text-xs">
                  <thead className="bg-glass border-b border-glass-border">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase tracking-widest opacity-50">Tarih</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest opacity-50">Ders / Konu</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest opacity-50">Tür</th>
                      <th className="px-6 py-4 font-black uppercase tracking-widest opacity-50">Süre</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border">
                    {studySessions.map(s => (
                      <tr key={s.id} className="hover:bg-glass/30 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          {s.startTime?.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold">{s.subject}</p>
                          <p className="text-text-muted">{s.topic}</p>
                        </td>
                        <td className="px-6 py-4 italic text-text-muted">{s.activityType}</td>
                        <td className="px-6 py-4 font-black text-primary">{s.duration} dk</td>
                      </tr>
                    ))}
                    {studySessions.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-text-muted italic">Bu hafta henüz veri bulunmuyor.</td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'mesaj' && (
          <div className="max-w-4xl mx-auto">
             <Messaging receiverId={id} receiverName={student?.name} />
          </div>
        )}
      </main>
    </div>
  );
}
