import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  Calendar as CalendarIcon, Clock, Video, Plus, 
  Search, X, VideoIcon, MapPin, Sparkles, Edit2
} from 'lucide-react';
import clsx from 'clsx';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newApp, setNewApp] = useState({ 
    studentId: '', 
    date: '', 
    time: '', 
    topic: 'Haftalık Görüşme', 
    type: 'online',
    zoomLink: '' 
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubApp = onSnapshot(collection(db, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    const unsubStud = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubApp(); unsubStud(); };
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!newApp.studentId || !newApp.date || !newApp.time) return;
    
    const appData = {
      ...newApp,
      studentName: students.find(s => s.id === newApp.studentId)?.name || 'Bilinmeyen',
      status: 'Yaklaşıyor'
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'appointments', editingId), appData);
      } else {
        await addDoc(collection(db, 'appointments'), appData);
      }
      handleCloseModal();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (app) => {
    setEditingId(app.id);
    setNewApp({
      studentId: app.studentId || '',
      date: app.date || '',
      time: app.time || '',
      topic: app.topic || 'Haftalık Görüşme',
      type: app.type || 'online',
      zoomLink: app.zoomLink || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewApp({ studentId: '', date: '', time: '', topic: 'Haftalık Görüşme', type: 'online', zoomLink: '' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu görüşmeyi silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, 'appointments', id));
    }
  };

  const filteredApps = appointments.filter(app => app.studentName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6">
      
      {/* HEADER & ACTIONS AREA */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2 flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-indigo-600" /> Görüşmeler
           </h1>
           <p className="text-slate-600 text-sm font-medium">Öğrencilerinizle olan görüşmelerinizi buradan planlayın ve yönetin.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
           <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                 type="text" 
                 placeholder="Görüşmelerde ara..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 transition-colors shadow-sm"
              />
           </div>
           <button onClick={() => setShowModal(true)} className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
              <Plus className="w-4 h-4" /> Görüşme Ekle
           </button>
        </div>
      </header>

      {/* ANA LİSTE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* YAKLAŞAN GÖRÜŞMELER */}
        <div className="xl:col-span-2 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm text-left">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                 <CalendarIcon className="w-5 h-5 text-indigo-600" /> Yaklaşan Görüşmeler
              </h3>
           </div>

           <div className="space-y-4">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)
              ) : filteredApps.length === 0 ? (
                <div className="py-16 text-center text-slate-500 font-medium text-sm border-2 border-dashed border-slate-200 rounded-xl">Planlanmış bir görüşme bulunmuyor.</div>
              ) : (
                filteredApps.sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map(app => (
                  <div key={app.id} 
                    className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all group"
                  >
                     <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center shadow-sm shrink-0">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">GÜN</p>
                           <p className="text-xl font-bold text-slate-900">{app.date?.split('-')[2] || '—'}</p>
                        </div>
                        <div className="min-w-0">
                           <div className="text-base font-semibold text-slate-900 truncate mb-1">{app.studentName}</div>
                           <div className="flex items-center gap-3 text-xs font-medium text-slate-500 truncate">
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {app.time}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> <span className="capitalize">{app.type}</span></span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="flex-1 md:text-right min-w-0">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Bakış</p>
                           <p className="text-sm font-semibold text-slate-700 truncate">{app.topic}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <button onClick={() => handleEdit(app)} className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-primary hover:border-primary/30 transition-colors shadow-sm">
                              <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(app.id)} className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                              <X className="w-4 h-4" />
                           </button>
                           {app.zoomLink ? (
                             <a href={app.zoomLink} target="_blank" rel="noreferrer" className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
                               <Video className="w-4 h-4" /> Bağlan
                             </a>
                           ) : (
                             <button disabled className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed">Bağlantı Yok</button>
                           )}
                        </div>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* TAKVİM ÖZET VE NOTLAR */}
        <div className="bg-indigo-50 border border-indigo-100 p-6 md:p-8 rounded-2xl shadow-sm text-left flex flex-col justify-between">
           <div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                    <Sparkles className="text-white w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">Akıllı Planlama</h3>
              </div>
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">Haftalık görüşme verimliliğini artırmak için öğrencilerin son haftalık performans raporlarını yayınlamayı unutmayın.</p>
           </div>
           
           <div className="space-y-4">
              <div className="p-5 bg-white border border-indigo-50 rounded-xl shadow-sm text-left">
                 <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">BU HAFTA</p>
                 <div className="text-2xl font-bold text-slate-900">{appointments.length} Görüşme</div>
              </div>
              <div className="p-5 bg-white border border-indigo-50 rounded-xl shadow-sm text-left">
                 <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">SIRADAKİ</p>
                 <div className="text-base font-semibold text-slate-700 truncate">
                    {appointments.length > 0 ? `${appointments.sort((a,b) => a.date.localeCompare(b.date))[0]?.studentName} - ${appointments[0]?.time}` : 'Bekleyen yok'}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* GÖRÜŞME MODALİ */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
           <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-8 shadow-xl relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                 <h3 className="text-lg font-bold text-slate-900">{editingId ? 'Görüşmeyi Düzenle' : 'Görüşme Oluştur'}</h3>
                 <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-5">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Öğrenci Seçin</label>
                    <select 
                       value={newApp.studentId}
                       onChange={e => setNewApp({...newApp, studentId: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 transition-colors cursor-pointer"
                       required
                    >
                       <option value="">Öğrenci Seçiniz...</option>
                       {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tarih</label>
                       <input type="date" required value={newApp.date} onChange={e => setNewApp({...newApp, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Saat</label>
                       <input type="time" required value={newApp.time} onChange={e => setNewApp({...newApp, time: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bağlantı Türü</label>
                    <div className="grid grid-cols-2 gap-4">
                       {['online', 'fiziksel'].map(t => (
                         <button key={t} type="button" onClick={() => setNewApp({...newApp, type: t})} className={clsx("py-3 rounded-lg font-semibold text-sm transition-colors border", newApp.type === t ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300")}>
                            {t === 'online' ? <div className="flex items-center justify-center gap-2"><VideoIcon className="w-4 h-4" /> Online</div> : <div className="flex items-center justify-center gap-2"><MapPin className="w-4 h-4" /> Yüz Yüze</div>}
                         </button>
                       ))}
                    </div>
                 </div>

                 {newApp.type === 'online' && (
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Zoom Linki</label>
                      <input type="url" placeholder="https://zoom.us/j/..." value={newApp.zoomLink} onChange={e => setNewApp({...newApp, zoomLink: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 transition-colors" />
                   </div>
                 )}

                 <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-button active:scale-95">
                    {editingId ? 'Görüşmeyi Güncelle' : 'Görüşmeyi Sisteme Kaydet'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
