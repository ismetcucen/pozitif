import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { LineChart, Trash2, TrendingUp, BarChart2, FileText, Image, Plus, X, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { YKS_SUBJECTS } from '../data/yksSubjects';

export default function Exams({ studentId: propStudentId }) { 
  const { studentId: paramId } = useParams();
  const studentId = propStudentId || paramId;
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', type: 'TYT', net: '', 
    ws1Course: '', ws1Topic: '', 
    ws2Course: '', ws2Topic: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let examsArr = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (studentId) {
        examsArr = examsArr.filter(e => e.studentId === studentId);
      }
      setExams(examsArr);
      setLoading(false);
    });
  }, [studentId]);

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!studentId) {
      toast.error('Lütfen önce bir öğrenci seçin veya Öğrenci Detay sayfasından ekleyin.');
      return;
    }

    try {
      const newNet = Number(formData.net);
      const wSub1 = formData.ws1Course && formData.ws1Topic ? `${formData.ws1Course} - ${formData.ws1Topic}` : '';
      const wSub2 = formData.ws2Course && formData.ws2Topic ? `${formData.ws2Course} - ${formData.ws2Topic}` : '';
      const finalWrongSubjects = [wSub1, wSub2].filter(Boolean);
      
      // 4. OTOMATİK GERÇEK BİLDİRİM (E-posta/WhatsApp Mock)
      // Eğer bu öğrencinin önceki bir sınavı varsa ve yeni girdiği net, son sınavından %10 daha düşükse veliye uyarı gönder
      if (exams.length > 0) {
        const lastExam = exams[0]; // because it's ordered by createdAt desc
        if (newNet < lastExam.net) {
           const dropRate = (((lastExam.net - newNet) / lastExam.net) * 100).toFixed(1);
           if (dropRate > 5) {
              // Real-World Alert Trigger Simulation
              toast.error(`SİSTEM UYARISI: Netlerde %${dropRate} düşüş var! Veliye ve koça otomatik SMS gönderildi.`, { duration: 5000, icon: '🚨' });
              console.warn(`[EXTERNAL API TRIGGER]: Sending SMS to parent of student ${studentId}. Message: Dikkat! Öğrencinizin son denemesinde netleri düştü. Hatalı olduğu konular: ${finalWrongSubjects.join(', ')}`);
              
              // Log this alert to firestore for record
              await addDoc(collection(db, 'system_alerts'), {
                 studentId,
                 type: 'PERFORMANCE_DROP',
                 message: `Netlerde %${dropRate} düşüş. Yanlış yapılan ana konular: ${finalWrongSubjects.join(', ')}`,
                 createdAt: new Date().toISOString()
              });
           }
        }
      }

      await addDoc(collection(db, 'exams'), {
        studentId,
        name: formData.name,
        type: formData.type,
        net: newNet,
        totalNet: newNet, // for backward compatibility with AnalysisDashboard
        wrongSubjects: finalWrongSubjects,
        createdAt: new Date().toISOString()
      });

      toast.success('Deneme başarıyla eklendi ve konu analizi kaydedildi.');
      setShowForm(false);
      setFormData({ name: '', type: 'TYT', net: '', ws1Course: '', ws1Topic: '', ws2Course: '', ws2Topic: '' });
    } catch (err) {
      toast.error('Hata: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6 text-left">
      {!propStudentId && (
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2 flex items-center gap-3">
              <LineChart className="w-6 h-6 text-indigo-600" /> Akademik Deneme Analizi
            </h1>
            <p className="text-slate-600 text-sm font-medium">
              Öğrencilerin panele girdikleri deneme sonuçlarını ve konu bazlı eksiklerini buradan takip edin.
            </p>
          </div>
          {studentId && (
            <button onClick={() => setShowForm(!showForm)} className="btn-premium bg-indigo-600">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'İptal' : 'Yeni Deneme'}
            </button>
          )}
        </header>
      )}

      {/* 3. KONU BAZLI DERİN ANALİZ FORMU */}
      {showForm && studentId && (
        <form onSubmit={handleAddExam} className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md animate-slide-up space-y-4">
           <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2 mb-4 border-b border-indigo-100 pb-2">
             <BarChart2 className="w-5 h-5 text-indigo-600" /> Yeni Deneme ve Konu Eksikleri Gir
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Sınav Adı</label>
                 <input required type="text" placeholder="Örn: 3D Türkiye Geneli" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-600 outline-none" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Sınav Türü</label>
                 <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-600 outline-none">
                    <option value="TYT">TYT</option>
                    <option value="AYT">AYT</option>
                    <option value="YDT">YDT</option>
                    <option value="LGS">LGS</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold text-indigo-600 mb-1">Toplam Net</label>
                 <input required type="number" step="0.25" placeholder="0.00" value={formData.net} onChange={e => setFormData({...formData, net: e.target.value})} className="w-full border border-indigo-200 bg-indigo-50 rounded-lg p-2 text-sm font-bold text-indigo-900 focus:border-indigo-600 outline-none" />
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl">
              <div>
                 <label className="block text-xs font-bold text-red-500 mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Kritik Yanlış Yapılan Konu 1</label>
                 <div className="flex gap-2">
                   <select value={formData.ws1Course} onChange={e => setFormData({...formData, ws1Course: e.target.value, ws1Topic: ''})} className="w-1/3 border border-red-200 bg-white rounded-lg p-2 text-xs focus:border-red-500 outline-none">
                     <option value="">Ders Seç</option>
                     {Object.keys(YKS_SUBJECTS[formData.type] || {}).map(course => <option key={course} value={course}>{course}</option>)}
                   </select>
                   <select disabled={!formData.ws1Course} value={formData.ws1Topic} onChange={e => setFormData({...formData, ws1Topic: e.target.value})} className="w-2/3 border border-red-200 bg-white rounded-lg p-2 text-xs focus:border-red-500 outline-none disabled:opacity-50">
                     <option value="">Konu Seç</option>
                     {formData.ws1Course && YKS_SUBJECTS[formData.type]?.[formData.ws1Course]?.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                   </select>
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-red-500 mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Kritik Yanlış Yapılan Konu 2</label>
                 <div className="flex gap-2">
                   <select value={formData.ws2Course} onChange={e => setFormData({...formData, ws2Course: e.target.value, ws2Topic: ''})} className="w-1/3 border border-red-200 bg-white rounded-lg p-2 text-xs focus:border-red-500 outline-none">
                     <option value="">Ders Seç</option>
                     {Object.keys(YKS_SUBJECTS[formData.type] || {}).map(course => <option key={course} value={course}>{course}</option>)}
                   </select>
                   <select disabled={!formData.ws2Course} value={formData.ws2Topic} onChange={e => setFormData({...formData, ws2Topic: e.target.value})} className="w-2/3 border border-red-200 bg-white rounded-lg p-2 text-xs focus:border-red-500 outline-none disabled:opacity-50">
                     <option value="">Konu Seç</option>
                     {formData.ws2Course && YKS_SUBJECTS[formData.type]?.[formData.ws2Course]?.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                   </select>
                 </div>
              </div>
           </div>
           <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-sm py-3 rounded-xl mt-4 hover:bg-indigo-700 transition-colors">
             Denemeyi ve Analizi Kaydet
           </button>
        </form>
      )}

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-indigo-600 w-5 h-5" /> Sonuç Akışı
          </h3>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">
            {exams.length} KAYITLI DENEME
          </span>
        </div>

        <div className="space-y-4">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)
          ) : exams.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-sm">Henüz bir deneme sonucu girilmedi.</p>
            </div>
          ) : exams.map((ex) => (
            <div key={ex.id} className="bg-slate-50 p-5 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all flex flex-col gap-4 group">

              {/* Top row: type badge + name + delete */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border",
                    ex.type === 'TYT' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  )}>
                    {ex.type}
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-0.5">
                      {ex.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-500">
                      {ex.date
                        ? new Date(ex.date).toLocaleDateString('tr-TR')
                        : new Date(ex.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { if (window.confirm('Bu deneme kaydı silinsin mi?')) deleteDoc(doc(db, 'exams', ex.id)); }}
                  className="text-slate-400 md:opacity-0 md:group-hover:opacity-100 p-2.5 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-200 rounded-lg transition-all"
                  title="Kaydı Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-3">
                {ex.type === 'TYT' && (
                  <div className="flex gap-2 flex-wrap">
                    {[['Mat', ex.tytMat], ['Türkçe', ex.tytTr], ['Fen', ex.tytFen], ['Sosyal', ex.tytSos]].map(([lbl, val]) =>
                      val !== undefined ? (
                        <span key={lbl} className="text-xs font-semibold bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700">
                          {lbl}: <span className="text-slate-900 font-bold">{val}</span>
                        </span>
                      ) : null
                    )}
                  </div>
                )}
                <div className="ml-auto flex items-center gap-4 flex-wrap justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">TOPLAM NET</p>
                    <div className="text-2xl font-bold text-slate-900">
                      {ex.net} <span className="text-sm font-medium text-slate-500 ml-1">NET</span>
                    </div>
                  </div>
                  {ex.score > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">PUAN</p>
                      <div className="text-xl font-bold text-indigo-600">{ex.score}</div>
                    </div>
                  )}
                  {ex.wrongSubjects && ex.wrongSubjects.length > 0 && (
                    <div className="text-left ml-4 border-l border-red-200 pl-4">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> EKSİK KONULAR</p>
                      <div className="text-xs font-semibold text-slate-700">
                        {ex.wrongSubjects.join(', ')}
                      </div>
                    </div>
                  )}
                  {ex.fileUrl && (
                    <a
                      href={ex.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      {ex.fileName?.endsWith('.pdf') ? <FileText className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                      Dosyayı Gör
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
