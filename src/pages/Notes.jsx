import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { MessageSquareText, Plus, Trash2, Calendar, Clock, Video, Edit2, Check } from 'lucide-react';
import clsx from 'clsx';

export default function Notes() { 
  const { studentId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    date: '',
    time: '',
    zoomLink: '',
    notes: ''
  });

   useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('date', 'asc'), orderBy('time', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, name: d.data().name }));
      setStudents(list);
      if (studentId) {
        const s = list.find(st => st.id === studentId);
        if (s) setFormData(f => ({ ...f, studentName: s.name }));
      }
    });

    return () => { unsubscribe(); unsubStudents(); };
  }, [studentId]);

  const filteredAppointments = studentId && students.length > 0
    ? appointments.filter(app => app.studentName === students.find(s => s.id === studentId)?.name)
    : appointments;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'appointments', editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'appointments'), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      setFormData({ studentName: '', date: '', time: '', zoomLink: '', notes: '' });
      alert("✅ Görüşme başarıyla kaydedildi!");
    } catch (error) { alert("Hata: " + error.message); }
    setLoading(false);
  };

  const handleEdit = (app) => {
    setEditingId(app.id);
    setFormData({
      studentName: app.studentName,
      date: app.date,
      time: app.time,
      zoomLink: app.zoomLink || '',
      notes: app.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2 flex items-center gap-3">
              <MessageSquareText className="w-6 h-6 text-indigo-600" /> Görüşme Notları
           </h1>
           <p className="text-slate-600 text-sm font-medium">Öğrencilerle yaptığınız tüm rehberlik seanslarını ve toplantı notlarını yönetin.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GÖRÜŞME EKLE ALANI */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm h-fit sticky top-24">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
             {editingId ? <Edit2 className="w-5 h-5 text-indigo-600"/> : <Plus className="w-5 h-5 text-indigo-600"/>}
             {editingId ? 'Notu Düzenle' : 'Yeni Not Ekle'}
          </h3>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Öğrenci Seçin</label>
               <select 
                 value={formData.studentName} 
                 onChange={e => setFormData({...formData, studentName: e.target.value})}
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 appearance-none"
                 required
               >
                  <option value="">Öğrenci Seçin...</option>
                  {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
               </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tarih</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600" required />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Saat</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600" required />
               </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Zoom Linki (Opsiyonel)</label>
               <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="url" placeholder="https://zoom.us/j/..." value={formData.zoomLink} onChange={e => setFormData({...formData, zoomLink: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-9 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600" />
               </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Görüşme Notu</label>
               <textarea rows="4" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 resize-none" placeholder="Görüşme detaylarını buraya not alın..."></textarea>
            </div>

            <div className="flex flex-col gap-3 pt-2">
               <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2">
                  {editingId ? <Check className="w-4 h-4"/> : <Plus className="w-4 h-4"/>} {editingId ? 'Güncellemeyi Kaydet' : 'Notu Kaydet'}
               </button>
               {editingId && (
                 <button type="button" onClick={() => { setEditingId(null); setFormData({ studentName: '', date: '', time: '', zoomLink: '', notes: '' }); }} className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    İptal Et
                 </button>
               )}
            </div>
          </form>
        </div>

        {/* GÖRÜŞME LİSTESİ */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-indigo-600" /> Kayıtlı Görüşmeler
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAppointments.map((app) => (
                 <div key={app.id} className="p-6 bg-white border border-slate-200 rounded-2xl group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", app.date < new Date().toISOString().split('T')[0] ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600")}>
                             <Clock className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="text-base font-semibold text-slate-900">{app.studentName}</h4>
                             <span className="text-xs font-semibold text-slate-500">{app.date} - {app.time}</span>
                          </div>
                       </div>
                       <div className="flex gap-1">
                          <button onClick={() => handleEdit(app)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => deleteDoc(doc(db, 'appointments', app.id))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4"/></button>
                       </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-6 border-l-2 border-indigo-200 pl-4">{app.notes || 'Görüşme notu bulunmuyor.'}</p>
                    
                    {app.zoomLink && (
                      <a href={app.zoomLink} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors">
                         <Video className="w-4 h-4" /> Zoom'a Katıl
                      </a>
                    )}
                 </div>
              ))}
              {filteredAppointments.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 font-medium text-sm border-2 border-dashed border-slate-200 rounded-2xl">Planlanmış bir görüşme bulunmuyor.</div>
              )}
           </div>
        </div>
      </div>
    </div>
  ); 
}
