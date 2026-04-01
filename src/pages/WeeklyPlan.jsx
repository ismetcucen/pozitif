import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ListTodo, Trash2, X, Link, PlayCircle } from 'lucide-react';
import clsx from 'clsx';

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const HOURS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','00:00'];

const CURRICULUM = {
  "TYT Matematik": [ "Temel Kavramlar", "Sayı Basamakları", "Rasyonel Sayılar", "Üslü ve Köklü Sayılar", "Çarpanlara Ayırma", "Oran Orantı", "Problemler", "Mantık", "Kümeler", "Polinomlar" ],
  "AYT Matematik": [ "İkinci Dereceden Denklemler", "Eşitsizlikler", "Parabol", "Trigonometri", "Logaritma", "Diziler", "Limit ve Süreklilik", "Türev", "İntegral" ],
  "Geometri": [ "Doğruda ve Üçgende Açılar", "Özel Üçgenler", "Üçgende Alan", "Üçgende Benzerlik", "Çokgenler ve Dörtgenler", "Çember ve Daire", "Katı Cisimler", "Analitik Geometri" ],
  "Fizik": [ "Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet", "İş, Güç, Enerji", "Isı ve Sıcaklık", "Optik", "Dalgalar", "Elektrik ve Manyetizma", "Modern Fizik" ],
  "Kimya": [ "Kimya Bilimi", "Atom ve Periyodik Sistem", "Kimyasal Türler", "Maddenin Halleri", "Asit, Baz ve Tuzlar", "Modern Atom Teorisi", "Gazlar", "Sıvı Çözeltiler", "Tepkimelerde Hız ve Denge", "Organik Kimya" ],
  "Biyoloji": [ "Canlıların Temel Bileşenleri", "Hücre", "Kalıtım", "Ekoloji", "Sistemler", "Solunum", "Fotosentez" ],
  "Türkçe": [ "Sözcükte Anlam", "Cümlede Anlam", "Paragraf", "Ses Bilgisi", "Yazım Kuralları", "Noktalama", "Sözcük Türleri", "Cümlenin Ögeleri" ],
  "Tarih": [ "Tarih Bilimine Giriş", "İlk ve Orta Çağ", "İslam Tarihi", "Osmanlı Devleti", "İnkılap Tarihi", "Çağdaş Türk ve Dünya Tarihi" ],
  "Coğrafya": [ "Doğa ve İnsan", "Dünyanın Şekli", "Harita Bilgisi", "İklim", "Nüfus ve Yerleşme", "Ekonomik Faaliyetler" ],
  "Diğer (Kendi Dersim)": []
};

export default function WeeklyPlan() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const [plans, setPlans] = useState([]);
  
  // Modal State - Timetable
  const [selectedSlot, setSelectedSlot] = useState(null); // { day, time }
  
  // Custom Dynamic Dropdown states
  const [planSubject, setPlanSubject] = useState('TYT Matematik');
  const [planSubjectCustom, setPlanSubjectCustom] = useState('');
  
  const [planTopic, setPlanTopic] = useState('Temel Kavramlar');
  const [planTopicCustom, setPlanTopicCustom] = useState('');
  
  const [planType, setPlanType] = useState('Konu Çalışması');
  const [planLink, setPlanLink] = useState('');

  useEffect(() => {
    // 1. Öğrencileri çek (Seçim kutusu için)
    const qSt = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    const unsubSt = onSnapshot(qSt, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(arr);
      if (arr.length > 0 && !selectedStudentId) {
        setSelectedStudentId(arr[0].id); // İlk öğrenciyi varsayılan seç
      }
    });

    // 2. Planları çek
    const qPlans = query(collection(db, 'weeklyPlans'), orderBy('createdAt', 'desc'));
    const unsubPlans = onSnapshot(qPlans, (snap) => {
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubSt(); unsubPlans(); };
  }, [selectedStudentId]);

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
        createdAt: new Date().toISOString()
      });
      setSelectedSlot(null);
      
      // Reset defaults
      setPlanSubject('TYT Matematik');
      setPlanTopic('Temel Kavramlar');
      setPlanSubjectCustom('');
      setPlanTopicCustom('');
      setPlanType('Konu Çalışması');
      setPlanLink('');
    } catch (err) { alert(err.message); }
  };

  const handleDeletePlanCell = async (e, planId) => {
    e.stopPropagation();
    try { await deleteDoc(doc(db, 'weeklyPlans', planId)); } catch (err) { console.error(err); }
  };

  const currentPlans = plans.filter(p => p.studentId === selectedStudentId);

  return (
    <div className="space-y-6 animate-slide-up pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <ListTodo className="text-primary w-8 h-8"/> Haftalık Ders Planı (Izgara)
        </h2>
        <p className="text-textMuted mt-2 text-lg">
          Lütfen üstten bir öğrenci seçip, onun haftalık çizelgesine tıklayarak etkinlik ekleyin.
        </p>
      </header>

      {/* Öğrenci Seçici */}
      <div className="glass-card p-6 flex items-center justify-between border-primary/30 shadow-lg shadow-primary/10">
         <h3 className="text-xl font-semibold text-white">Öğrenci Seçimi</h3>
         <select 
           value={selectedStudentId}
           onChange={(e) => setSelectedStudentId(e.target.value)}
           className="w-full max-w-sm bg-surface/50 border border-border/50 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
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

      {!selectedStudentId ? (
        <div className="glass-panel p-10 text-center py-20">
           <h3 className="text-2xl text-white font-bold mb-2">Henüz Hiç Öğrenciniz Yok</h3>
           <p className="text-textMuted">Lütfen sol menüden "Öğrenci Kayıt ve Takip" sekmesine giderek bir öğrenci oluşturun.</p>
        </div>
      ) : (
        <div className="glass-panel p-6 overflow-x-auto custom-scrollbar relative animate-fade-in">
          <h3 className="text-xl font-semibold mb-6 text-white text-center">Gelişmiş Haftalık Çizelge (09:00 - 00:00)</h3>
          <p className="text-textMuted text-center text-sm mb-6">Öğrenciye etkinlik atamak istediğiniz gün ve saat hücresinin üzerine tıklayın.</p>
          
          <div className="min-w-[1000px] mb-8">
             <div className="grid grid-cols-8 gap-0 border-t border-l border-border/30 rounded-lg overflow-hidden">
                <div className="bg-surface/50 border-r border-b border-border/30 p-3 text-center font-bold text-textMuted text-sm">SAAT</div>
                {DAYS.map(day => (
                  <div key={day} className="bg-surface/80 border-r border-b border-border/30 p-3 text-center font-bold text-white text-sm">
                    {day}
                  </div>
                ))}

                {HOURS.map(hour => (
                  <div key={hour} className="contents">
                     <div className="bg-surface/30 border-r border-b border-border/30 p-2 flex items-center justify-center font-semibold text-textMuted text-xs">
                       {hour}
                     </div>
                     {DAYS.map(day => {
                       const cellPlan = currentPlans.find(p => p.day === day && p.time === hour);
                       
                       let bgColorClass = "hover:bg-primary/20 cursor-pointer transition-colors";
                       if (cellPlan) {
                         if (cellPlan.type === 'YouTube Videosu') bgColorClass = 'bg-red-600/20 hover:bg-red-600/30 border-l-2 border-red-500';
                         else if (cellPlan.type === 'Deneme Çözümü') bgColorClass = 'bg-orange-500/20 hover:bg-orange-500/30 border-l-2 border-orange-500';
                         else if (cellPlan.type === 'Soru Çözümü') bgColorClass = 'bg-blue-500/20 hover:bg-blue-500/30 border-l-2 border-blue-500';
                         else if (cellPlan.type === 'Tekrar') bgColorClass = 'bg-yellow-500/20 hover:bg-yellow-500/30 border-l-2 border-yellow-500';
                         else bgColorClass = 'bg-primary/20 hover:bg-primary/30 border-l-2 border-primary';
                       }

                       return (
                         <div 
                           key={`${day}-${hour}`} 
                           onClick={() => setSelectedSlot({day, time: hour})}
                           className={clsx("border-r border-b border-border/30 p-2 h-16 relative group flex flex-col justify-center", bgColorClass)}
                         >
                           {cellPlan && (
                             <div className="w-full relative flex flex-col leading-tight">
                               <p className="text-[10px] font-bold uppercase tracking-wider text-white opacity-90 truncate flex items-center gap-1">
                                 {cellPlan.type === 'YouTube Videosu' && <PlayCircle className="w-3 h-3 text-red-500" />}
                                 {cellPlan.subject}
                               </p>
                               <span className="text-xs text-textMuted truncate" title={cellPlan.topic}>
                                 {cellPlan.topic || cellPlan.type}
                               </span>
                               
                               {cellPlan.link && (
                                 <a 
                                   href={cellPlan.link} 
                                   target="_blank" 
                                   rel="noreferrer" 
                                   onClick={(e) => e.stopPropagation()} 
                                   className="absolute bottom-[-2px] right-0 text-blue-400 hover:text-white p-0.5"
                                   title="Bağlantıya Git"
                                 >
                                    <Link className="w-3 h-3" />
                                 </a>
                               )}

                               <button 
                                 onClick={(e) => handleDeletePlanCell(e, cellPlan.id)} 
                                 className="absolute top-[-4px] right-[-4px] opacity-0 group-hover:opacity-100 p-[2px] bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all z-10"
                                 title="Plani Sil"
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
      )}

      {/* MODAL FOR ADDING PLAN TO GRID */}
      {selectedSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="glass-card w-full max-w-md p-6 rounded-2xl relative shadow-2xl shadow-primary/20 border border-primary/30">
              <button onClick={() => setSelectedSlot(null)} className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="mb-6">
                 <h3 className="text-2xl font-bold text-white mb-1">Programa Ders Ekle</h3>
                 <p className="text-primary font-medium">{selectedSlot.day} • {selectedSlot.time}</p>
                 <p className="text-textMuted text-xs mt-1">Öğrenci: {students.find(s=>s.id===selectedStudentId)?.name}</p>
              </div>
              
              <form onSubmit={handleSavePlan} className="space-y-4">
                
                {/* DERS MÜFREDAT SEÇİCİ */}
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Ders Adı</label>
                  <select value={planSubject} onChange={handleSubjectChange} className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white focus:outline-none focus:border-primary">
                    {Object.keys(CURRICULUM).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* EĞER "Diğer" seçildiyse: Serbest Ders Girişi */}
                {planSubject === 'Diğer (Kendi Dersim)' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-textMuted mb-1.5">Özel Ders Adı</label>
                    <input type="text" value={planSubjectCustom} onChange={(e)=>setPlanSubjectCustom(e.target.value)} placeholder="Örn: İngilizce, Müzik" className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white focus:outline-none focus:border-primary" required />
                  </div>
                )}

                {/* KONU MÜFREDAT SEÇİCİ (Serbest Yazım Değilse) */}
                {planSubject !== 'Diğer (Kendi Dersim)' && (
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1.5">Konu Adı</label>
                    <select value={planTopic} onChange={(e) => setPlanTopic(e.target.value)} className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white focus:outline-none focus:border-primary">
                      {CURRICULUM[planSubject]?.map(t => <option key={t} value={t}>{t}</option>)}
                      <option value="Diğer">Farklı Konu (Kendim Yazacağım)</option>
                    </select>
                  </div>
                )}

                {/* EĞER "Konu = Diğer" seçildiyse VEYA Öğrenci kendi dersini yazdıysa, Serbest Konu Girişi */}
                {(planTopic === 'Diğer' || planSubject === 'Diğer (Kendi Dersim)') && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-textMuted mb-1.5">{planSubject === 'Diğer (Kendi Dersim)' ? 'Konu (Opsiyonel)' : 'Özel Konu Adı'}</label>
                    <input type="text" value={planTopicCustom} onChange={(e)=>setPlanTopicCustom(e.target.value)} placeholder="Özel konuyu buraya yazın..." className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Etkinlik Türü</label>
                  <select value={planType} onChange={(e) => setPlanType(e.target.value)} className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white focus:outline-none focus:border-primary">
                    <option>Konu Çalışması</option>
                    <option>Soru Çözümü</option>
                    <option>Tekrar</option>
                    <option>Deneme Çözümü</option>
                    <option>YouTube Videosu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Bağlantı (Video veya PDF Linki)</label>
                  <input type="url" value={planLink} onChange={(e) => setPlanLink(e.target.value)} placeholder="https://youtube.com/..." className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                </div>
                <button type="submit" className="w-full mt-2 bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity">
                  Takvime Kaydet
                </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
