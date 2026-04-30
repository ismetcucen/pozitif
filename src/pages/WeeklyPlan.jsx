import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, writeBatch, getDocs, where } from 'firebase/firestore';
import { ListTodo, Trash2, X, Link, PlayCircle, Sparkles, Copy, LayoutTemplate, RotateCcw, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const HOURS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','00:00'];

const PLAN_TEMPLATES = {
  "9_SINIF": [
    { day: "Pazartesi", time: "16:00", subject: "9. Sınıf Matematik", topic: "Mantık", type: "Konu Çalışması" },
    { day: "Salı", time: "16:00", subject: "9. Sınıf Edebiyat", topic: "Sözcükte Anlam", type: "Soru Çözümü" },
    { day: "Çarşamba", time: "16:00", subject: "9. Sınıf Fizik", topic: "Hız ve Hareket", type: "Konu Çalışması" },
    { day: "Cumartesi", time: "10:00", subject: "Genel Tekrar", topic: "Haftalık Özet", type: "Tekrar" }
  ],
  "10_SINIF": [
    { day: "Pazartesi", time: "17:00", subject: "10. Sınıf Matematik", topic: "Fonksiyonlar", type: "Konu Çalışması" },
    { day: "Salı", time: "17:00", subject: "10. Sınıf Kimya", topic: "Karışımlar", type: "Soru Çözümü" },
    { day: "Çarşamba", time: "17:00", subject: "10. Sınıf Edebiyat", topic: "Şiir Bilgisi", type: "Konu Çalışması" }
  ],
  "11_SAYISAL": [
    { day: "Pazartesi", time: "18:00", subject: "AYT Matematik", topic: "Trigonometri", type: "Soru Çözümü" },
    { day: "Salı", time: "18:00", subject: "AYT Fizik", topic: "Vektörler", type: "Konu Çalışması" },
    { day: "Çarşamba", time: "18:00", subject: "AYT Biyoloji", topic: "Sistemler", type: "Soru Çözümü" },
    { day: "Pazar", time: "10:00", subject: "TYT Denemesi", topic: "Genel TYT", type: "Deneme Çözümü" }
  ],
  "11_ESIT_AGIRLIK": [
    { day: "Pazartesi", time: "18:00", subject: "AYT Matematik", topic: "Diziler", type: "Konu Çalışması" },
    { day: "Salı", time: "18:00", subject: "Edebiyat", topic: "Roman", type: "Soru Çözümü" },
    { day: "Çarşamba", time: "18:00", subject: "Tarih", topic: "Osmanlı Tarihi", type: "Konu Çalışması" }
  ],
  "12_SAYISAL_YKS": [
    { day: "Pazartesi", time: "09:00", subject: "TYT Matematik", topic: "Problemler", type: "Soru Çözümü" },
    { day: "Salı", time: "09:00", subject: "AYT Matematik", topic: "Türev", type: "Konu Çalışması" },
    { day: "Çarşamba", time: "09:00", subject: "AYT Fizik", topic: "Modern Fizik", type: "Soru Çözümü" },
    { day: "Pazar", time: "09:00", subject: "TYT Denemesi", topic: "Zaman Yönetimi", type: "Deneme Çözümü" }
  ],
  "12_EA_YKS": [
    { day: "Pazartesi", time: "09:00", subject: "AYT Matematik", topic: "Logaritma", type: "Soru Çözümü" },
    { day: "Salı", time: "09:00", subject: "Edebiyat", topic: "Batı Edebiyatı", type: "Konu Çalışması" },
    { day: "Pazar", time: "09:00", subject: "TYT Denemesi", topic: "Genel Prova", type: "Deneme Çözümü" }
  ],
  "MEZUN_SAYISAL": [
    { day: "Pazartesi", time: "09:00", subject: "TYT Matematik", topic: "Sayılar", type: "Konu Çalışması" },
    { day: "Pazartesi", time: "14:00", subject: "AYT Fizik", topic: "Newton Yasaları", type: "Soru Çözümü" },
    { day: "Salı", time: "09:00", subject: "TYT Türkçe", topic: "Paragraf", type: "Soru Çözümü" },
    { day: "Salı", time: "14:00", subject: "AYT Matematik", topic: "Limit", type: "Konu Çalışması" },
    { day: "Çarşamba", time: "09:00", subject: "TYT Kimya", topic: "Kimya Bilimi", type: "Konu Çalışması" }
  ],
  "MEZUN_EA": [
    { day: "Pazartesi", time: "09:00", subject: "TYT Matematik", topic: "Problemler", type: "Soru Çözümü" },
    { day: "Pazartesi", time: "14:00", subject: "Edebiyat", topic: "Halk Edebiyatı", type: "Konu Çalışması" },
    { day: "Salı", time: "09:00", subject: "AYT Matematik", topic: "Parabol", type: "Soru Çözümü" },
    { day: "Salı", time: "14:00", subject: "Tarih", topic: "Dünya Tarihi", type: "Konu Çalışması" }
  ]
};

import { YKS_SUBJECTS } from '../data/yksSubjects';

// Flatten YKS_SUBJECTS into CURRICULUM for the dropdowns
const CURRICULUM = {};
Object.keys(YKS_SUBJECTS).forEach(category => {
  Object.keys(YKS_SUBJECTS[category]).forEach(subject => {
    const key = `${category} ${subject}`;
    CURRICULUM[key] = YKS_SUBJECTS[category][subject];
  });
});
CURRICULUM["Diğer (Kendi Dersim)"] = [];

export default function WeeklyPlan({ studentId: propStudentId }) {
  const { studentId: paramId } = useParams();
  const studentId = propStudentId || paramId;
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [plans, setPlans] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // Modal State - Timetable
  const [selectedSlot, setSelectedSlot] = useState(null); // { day, time }
  
  // Custom Dynamic Dropdown states
  const [planSubject, setPlanSubject] = useState('TYT Matematik');
  const [planSubjectCustom, setPlanSubjectCustom] = useState('');
  
  const [planTopic, setPlanTopic] = useState('Temel Kavramlar');
  const [planTopicCustom, setPlanTopicCustom] = useState('');
  
  const [planType, setPlanType] = useState('Konu Çalışması');
  const [planLink, setPlanLink] = useState('');
  const [planResource, setPlanResource] = useState(''); // Yeni: Seçilen Kitap
  const [studentLibrary, setStudentLibrary] = useState([]); // Yeni: Öğrencinin Kitapları

  useEffect(() => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
    
    // 1. Öğrencileri çek (Seçim kutusu için, eğer studentId verilmediyse)
    let unsubSt = () => {};
    if (!studentId) {
      const qSt = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
      unsubSt = onSnapshot(qSt, (snap) => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setStudents(arr);
        if (arr.length > 0 && !selectedStudentId) {
          setSelectedStudentId(arr[0].id); // İlk öğrenciyi varsayılan seç
        }
      });
    }

    // 2. Planları çek
    const qPlans = query(collection(db, 'weeklyPlans'), orderBy('createdAt', 'desc'));
    const unsubPlans = onSnapshot(qPlans, (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. Görevleri (Tasks) çek
    const qTasks = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 4. Öğrencinin Kütüphanesini çek
    let unsubLib = () => {};
    if (selectedStudentId) {
      unsubLib = onSnapshot(collection(db, 'library'), (snap) => {
        const libs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setStudentLibrary(libs.filter(l => l.studentId === selectedStudentId));
      });
    }

    return () => { unsubSt(); unsubPlans(); unsubTasks(); unsubLib(); };
  }, [selectedStudentId, studentId]);

  const handleClearPlan = async () => {
    if (!selectedStudentId) return;
    if (!window.confirm('Bu öğrencinin tüm haftalık programını silmek istediğinize emin misiniz?')) return;
    
    try {
      const q = query(collection(db, 'weeklyPlans'), where('studentId', '==', selectedStudentId));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      toast.success('Program başarıyla temizlendi.');
    } catch (err) {
      toast.error('Temizleme hatası: ' + err.message);
    }
  };

  const handleApplyTemplate = async (templateKey) => {
    if (!selectedStudentId) return;
    const template = PLAN_TEMPLATES[templateKey];
    if (!template) return;
    
    if (!window.confirm(`${templateKey.replace('_', ' ')} şablonunu uygulamak istediğinize emin misiniz? Mevcut programın üzerine eklenecektir.`)) return;

    try {
      const batch = writeBatch(db);
      template.forEach(item => {
        const newDocRef = doc(collection(db, 'weeklyPlans'));
        batch.set(newDocRef, {
          ...item,
          studentId: selectedStudentId,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      toast.success('Şablon başarıyla uygulandı!');
    } catch (err) {
      toast.error('Şablon hatası: ' + err.message);
    }
  };

  const handleSubjectChange = (e) => {
    const val = e.target.value;
    setPlanSubject(val);
    setPlanSubjectCustom('');
    if (CURRICULUM[val] && CURRICULUM[val].length > 0) {
      setPlanTopic(CURRICULUM[val][0]);
    } else {
      setPlanTopic('');
    }
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !selectedStudentId) return;

    const finalSubject = planSubject === 'Diğer (Kendi Dersim)' ? planSubjectCustom : planSubject;
    const finalTopic = planTopic === 'Diğer' ? planTopicCustom : planTopic;

    if (!finalSubject.trim()) {
      alert("Lütfen ders adı giriniz.");
      return;
    }

    try {
      await addDoc(collection(db, 'weeklyPlans'), {
        studentId: selectedStudentId,
        day: selectedSlot.day,
        time: selectedSlot.time,
        subject: finalSubject,
        topic: finalTopic,
        type: planType,
        link: planLink,
        resourceId: planResource || null,
        resourceName: studentLibrary.find(l => l.id === planResource)?.name || null,
        createdAt: new Date().toISOString()
      });
      setSelectedSlot(null);
      setPlanLink('');
      setPlanResource('');
    } catch (err) { alert(err.message); }
  };

  const handleDeletePlanCell = async (e, planId) => {
    e.stopPropagation();
    try { await deleteDoc(doc(db, 'weeklyPlans', planId)); } catch (err) { console.error(err); }
  };

  const currentPlans = plans.filter(p => p.studentId === selectedStudentId);

  return (
    <div className="space-y-6 animate-fade-in pb-20 pt-4 md:pt-6">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight flex items-center gap-3">
            <ListTodo className="text-primary w-6 h-6"/> Haftalık Ders Planı
          </h2>
          <p className="text-textSecondary mt-1 text-sm font-medium">
            Profesyonel şablonları kullanın veya takvime tıklayarak elle oluşturun.
          </p>
        </div>
        
        {selectedStudentId && (
          <div className="flex items-center gap-2">
             <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-soft">
                   <LayoutTemplate className="w-4 h-4" /> Şablon Uygula
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-borderLight rounded-xl shadow-premium opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-[150] overflow-hidden">
                   {Object.keys(PLAN_TEMPLATES).map(key => (
                     <button 
                        key={key} 
                        onClick={() => handleApplyTemplate(key)}
                        className="w-full text-left px-4 py-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0 uppercase tracking-wider flex items-center justify-between"
                      >
                       {key.replace('_', ' ')}
                       <Copy className="w-3 h-3 text-slate-300" />
                     </button>
                   ))}
                </div>
             </div>
             <button 
                onClick={handleClearPlan}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
             >
                <RotateCcw className="w-4 h-4" /> Temizle
             </button>
          </div>
        )}
      </header>

      {/* Öğrenci Seçici (Eğer prop girilmediyse) */}
      {!propStudentId && (
      <div className="bg-surface p-6 flex flex-col md:flex-row items-start md:items-center justify-between border border-borderLight rounded-saas shadow-soft gap-4">
         <h3 className="text-base font-semibold text-textPrimary">Öğrenci Seçimi</h3>
         <select 
           value={selectedStudentId}
           onChange={(e) => setSelectedStudentId(e.target.value)}
           className="w-full md:max-w-sm bg-background border border-borderLight rounded-lg p-3 text-textPrimary text-sm font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer shadow-inner-soft"
         >
           {students.length === 0 ? (
              <option value="">Lütfen Önce Sisteme Öğrenci Ekleyin</option>
           ) : (
              students.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))
           )}
         </select>
      </div>
      )}

      {!selectedStudentId ? (
        <div className="bg-surface border border-borderLight rounded-saas p-10 text-center py-20 shadow-soft">
           <h3 className="text-lg text-textPrimary font-semibold mb-2">Henüz Öğrenci Seçilmedi</h3>
           <p className="text-textSecondary text-sm">Lütfen işlem yapmak için üst menüden bir öğrenci seçin veya yeni öğrenci oluşturun.</p>
        </div>
      ) : (
        <div className="bg-surface border border-borderLight rounded-saas p-4 md:p-6 shadow-soft relative">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-base font-semibold text-textPrimary">Haftalık Çizelge</h3>
             <p className="text-textMuted text-xs font-medium hidden md:block">Hücreye tıklayarak etkinlik ekleyin.</p>
          </div>
          
          {/* DESKTOP GRID VIEW */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <div className="min-w-[1000px] mb-8">
               <div className="grid grid-cols-8 gap-0 border-t border-l border-borderLight rounded-lg overflow-hidden bg-background">
                  <div className="bg-surface border-r border-b border-borderLight p-3 text-center font-medium text-textSecondary text-xs">SAAT</div>
                  {DAYS.map(day => (
                    <div key={day} className="bg-surface border-r border-b border-borderLight p-3 text-center font-medium text-textPrimary text-sm">
                      {day}
                    </div>
                  ))}

                  {/* GÖREVLER SATIRI */}
                  <div className="contents">
                     <div className="bg-primary/5 border-r border-b border-borderLight p-2 flex items-center justify-center font-bold text-primary text-[10px] uppercase tracking-widest text-center shadow-inner">
                       GÖREVLER
                     </div>
                     {DAYS.map((day, idx) => {
                       const dayTasks = tasks.filter(t => t.studentId === selectedStudentId && t.targetDate && new Date(t.targetDate).toLocaleDateString('tr-TR', { weekday: 'long' }) === day);
                       return (
                         <div key={`task-${day}`} className="border-r border-b border-borderLight p-1 min-h-[4rem] bg-slate-50/50 flex flex-col gap-1 overflow-hidden">
                           {dayTasks.map(t => (
                             <div key={t.id} className="bg-amber-100/50 border border-amber-200 p-1.5 rounded text-[9px] leading-tight flex items-start gap-1">
                               <input type="checkbox" checked={t.done} readOnly className="mt-0.5 accent-amber-500 w-2 h-2 shrink-0" />
                               <span className={clsx("font-semibold text-amber-900", t.done && "line-through opacity-60")}>{t.title}</span>
                             </div>
                           ))}
                         </div>
                       )
                     })}
                  </div>

                  {HOURS.map(hour => (
                    <div key={hour} className="contents">
                       <div className="bg-surface border-r border-b border-borderLight p-2 flex items-center justify-center font-medium text-textSecondary text-xs">
                         {hour}
                       </div>
                       {DAYS.map(day => {
                         const cellPlan = currentPlans.find(p => p.day === day && p.time === hour);
                         
                         let bgColorClass = "hover:bg-section cursor-pointer transition-colors";
                         if (cellPlan) {
                           if (cellPlan.type === 'YouTube Videosu') bgColorClass = 'bg-danger/10 hover:bg-danger/20 border-l-2 border-danger';
                           else if (cellPlan.type === 'Deneme Çözümü') bgColorClass = 'bg-warning/10 hover:bg-warning/20 border-l-2 border-warning';
                           else if (cellPlan.type === 'Soru Çözümü') bgColorClass = 'bg-primary/10 hover:bg-primary/20 border-l-2 border-primary';
                           else if (cellPlan.type === 'Tekrar') bgColorClass = 'bg-secondary/10 hover:bg-secondary/20 border-l-2 border-secondary';
                           else bgColorClass = 'bg-success/10 hover:bg-success/20 border-l-2 border-success';
                         }

                         return (
                           <div 
                             key={`${day}-${hour}`} 
                             onClick={() => setSelectedSlot({day, time: hour})}
                             className={clsx("border-r border-b border-borderLight p-1 min-h-[4.5rem] h-auto relative group flex flex-col justify-start text-left px-1.5", bgColorClass)}
                           >
                             {cellPlan && (
                               <div className="w-full relative flex flex-col pt-1 pb-1">
                                 <p className="text-[10px] font-bold text-textPrimary leading-none mb-1">
                                   {cellPlan.type === 'YouTube Videosu' && <PlayCircle className="w-3 h-3 text-danger inline-block mr-0.5" />}
                                   {cellPlan.subject}
                                 </p>
                                 <span className="text-[9px] text-textSecondary font-semibold leading-tight line-clamp-3 mb-1" title={cellPlan.topic}>
                                   {cellPlan.topic}
                                 </span>
                                 <span className="text-[8px] bg-primary/10 text-primary px-1 py-0.5 rounded uppercase tracking-widest font-bold self-start mt-auto w-fit">
                                   {cellPlan.type}
                                 </span>
                                 {cellPlan.resourceName && (
                                   <div className="mt-1 flex items-center gap-1">
                                      <BookOpen className="w-2.5 h-2.5 text-blue-500" />
                                      <span className="text-[7.5px] font-black text-blue-600 uppercase tracking-tighter truncate leading-none">
                                        {cellPlan.resourceName}
                                      </span>
                                   </div>
                                 )}
                                 
                                 {cellPlan.link && (
                                   <a 
                                     href={cellPlan.link} 
                                     target="_blank" 
                                     rel="noreferrer" 
                                     onClick={(e) => e.stopPropagation()} 
                                     className="absolute bottom-[-2px] right-0 text-primary hover:text-primaryHover p-0.5"
                                     title="Bağlantıya Git"
                                   >
                                      <Link className="w-3 h-3" />
                                   </a>
                                 )}

                                 <button 
                                   onClick={(e) => handleDeletePlanCell(e, cellPlan.id)} 
                                   className="absolute top-[-4px] right-[-4px] opacity-0 group-hover:opacity-100 p-1 bg-surface text-danger rounded hover:bg-danger hover:text-white border border-borderLight transition-all z-10 shadow-soft"
                                   title="Planı Sil"
                                 >
                                   <X className="w-3 h-3" />
                                 </button>
                               </div>
                             )}
                           </div>
                         );
                       })}
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* MOBILE LIST VIEW */}
          <div className="md:hidden space-y-6">
            {DAYS.map(day => (
              <div key={day} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                   <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">{day}</h4>
                   <button 
                     onClick={() => setSelectedSlot({day, time: '09:00'})}
                     className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                   >
                     <Plus className="w-3 h-3" /> Ekle
                   </button>
                </div>
                <div className="space-y-2">
                  {currentPlans.filter(p => p.day === day).length > 0 ? (
                    currentPlans
                      .filter(p => p.day === day)
                      .sort((a,b) => a.time.localeCompare(b.time))
                      .map(p => (
                        <div key={p.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                               <p className="text-[10px] font-bold text-indigo-500 mb-0.5">{p.time}</p>
                               <p className="text-sm font-bold text-slate-900">{p.subject}</p>
                               <p className="text-xs text-slate-500 font-medium">{p.topic}</p>
                            </div>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-black rounded uppercase">
                              {p.type}
                            </span>
                          </div>
                          <button 
                            onClick={(e) => handleDeletePlanCell(e, p.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">Planlanmış etkinlik yok.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL FOR ADDING PLAN TO GRID */}
      {selectedSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm animate-fade-in">
           <div className="bg-surface w-full max-w-md p-6 rounded-saas-lg relative shadow-premium border border-borderLight">
              <button onClick={() => setSelectedSlot(null)} className="absolute top-5 right-5 text-textMuted hover:text-textPrimary transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="mb-6">
                 <h3 className="text-lg font-semibold text-textPrimary mb-1">Programa Ders Ekle</h3>
                 <p className="text-sm font-medium text-textSecondary">{selectedSlot.day} • {selectedSlot.time}</p>
              </div>
              
              <form onSubmit={handleSavePlan} className="space-y-4">
                
                {/* DERS MÜFREDAT SEÇİCİ */}
                <div>
                  <label className="block text-xs font-semibold text-textSecondary mb-1.5">Ders Adı</label>
                  <select value={planSubject} onChange={handleSubjectChange} className="w-full bg-background border border-borderLight rounded-lg p-3 text-textPrimary text-sm font-medium focus:outline-none focus:border-primary">
                    {Object.keys(CURRICULUM).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* EĞER "Diğer" seçildiyse: Serbest Ders Girişi */}
                {planSubject === 'Diğer (Kendi Dersim)' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-semibold text-textSecondary mb-1.5">Özel Ders Adı</label>
                    <input type="text" value={planSubjectCustom} onChange={(e)=>setPlanSubjectCustom(e.target.value)} placeholder="Örn: İngilizce, Müzik" className="w-full bg-background border border-borderLight rounded-lg p-3 text-textPrimary text-sm focus:outline-none focus:border-primary" required />
                  </div>
                )}

                {/* KONU MÜFREDAT SEÇİCİ (Serbest Yazım Değilse) */}
                {planSubject !== 'Diğer (Kendi Dersim)' && (
                  <div>
                    <label className="block text-xs font-semibold text-textSecondary mb-1.5">Konu Adı</label>
                    <select value={planTopic} onChange={(e) => setPlanTopic(e.target.value)} className="w-full bg-background border border-borderLight rounded-lg p-3 text-textPrimary text-sm font-medium focus:outline-none focus:border-primary">
                      {CURRICULUM[planSubject]?.map(t => <option key={t} value={t}>{t}</option>)}
                      <option value="Diğer">Farklı Konu (Kendim Yazacağım)</option>
                    </select>
                  </div>
                )}

                {/* EĞER "Konu = Diğer" seçildiyse VEYA Öğrenci kendi dersini yazdıysa, Serbest Konu Girişi */}
                {(planTopic === 'Diğer' || planSubject === 'Diğer (Kendi Dersim)') && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-semibold text-textSecondary mb-1.5">{planSubject === 'Diğer (Kendi Dersim)' ? 'Konu (Opsiyonel)' : 'Özel Konu Adı'}</label>
                    <input type="text" value={planTopicCustom} onChange={(e)=>setPlanTopicCustom(e.target.value)} placeholder="Özel konuyu buraya yazın..." className="w-full bg-background border border-borderLight rounded-lg p-3 text-textPrimary text-sm focus:outline-none focus:border-primary" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-textSecondary mb-1.5">Etkinlik Türü</label>
                  <select value={planType} onChange={(e) => setPlanType(e.target.value)} className="w-full bg-background border border-borderLight rounded-lg p-3 text-textPrimary text-sm font-medium focus:outline-none focus:border-primary">
                    <option>Konu Çalışması</option>
                    <option>Soru Çözümü</option>
                    <option>Tekrar</option>
                    <option>Deneme Çözümü</option>
                    <option>YouTube Videosu</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Çalışılacak Kaynak (Opsiyonel)</label>
                <select 
                  value={planResource}
                  onChange={(e) => setPlanResource(e.target.value)}
                  className="w-full bg-background border border-borderLight p-2.5 rounded-xl text-sm font-medium outline-none focus:border-primary"
                >
                  <option value="">Kaynak Seçilmedi (Boş)</option>
                  {studentLibrary.map(lib => (
                    <option key={lib.id} value={lib.id}>{lib.name} ({lib.subject})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">Materyal / Video Linki</label>
                <input 
                  type="url" 
                  value={planLink}
                  onChange={(e) => setPlanLink(e.target.value)}
                  placeholder="https://youtube.com/..." 
                  className="w-full bg-background border border-borderLight p-2.5 rounded-xl text-sm font-medium outline-none focus:border-primary" 
                />
              </div>  <button type="submit" className="w-full mt-4 bg-primary text-surface py-3 rounded-lg font-semibold hover:bg-primaryHover transition-colors shadow-soft">
                  Takvime Kaydet
                </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
