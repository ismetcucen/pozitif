import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { MessageSquareText, Plus, Trash2, Calendar, Clock, Video, Edit2, X, Check } from 'lucide-react';
import clsx from 'clsx';

export default function Notes() { 
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
    // Görüşmeleri tarihe göre sıralı dinle (Madde 9)
    const q = query(collection(db, 'appointments'), orderBy('date', 'asc'), orderBy('time', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, name: d.name })));
    });

    return () => { unsubscribe(); unsubStudents(); };
  }, []);

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
    <div className="space-y-10 animate-fade-in pb-20 text-left">
      <header className="flex items-center justify-between">
        <div>
           <h2 className="text-4xl font-bold text-white tracking-tighter uppercase italic flex items-center gap-4">
             <MessageSquareText className="text-primary w-10 h-10"/> Görüşmeler
           </h2>
           <p className="text-textMuted text-lg font-medium opacity-60 italic">Tüm rehberlik seanslarını ve toplantı notlarını yönetin.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Madde 7 & 8: GÖRÜŞME EKLE ALANI */}
        <div className="bg-surface/60 border border-border/50 p-8 rounded-[3rem] shadow-2xl h-fit sticky top-24">
          <h3 className="text-xl font-black mb-8 text-white flex items-center gap-3 uppercase italic tracking-tighter">
             {editingId ? <Edit2 className="w-6 h-6 text-primary"/> : <Plus className="w-6 h-6 text-primary"/>}
             {editingId ? 'Görüşmeyi Düzenle' : 'Görüşme Ekle'}
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">ÖĞRENCİ SEÇİN</label>
               <select 
                 value={formData.studentName} 
                 onChange={e => setFormData({...formData, studentName: e.target.value})}
                 className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-primary appearance-none"
                 required
               >
                  <option value="">Öğrenci Seçin</option>
                  {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
               </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">TARİH</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-primary" required />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">SAAT</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-primary" required />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1 text-primary">ZOOM LİNKİ (MADDE 8)</label>
               <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type="url" placeholder="https://zoom.us/j/..." value={formData.zoomLink} onChange={e => setFormData({...formData, zoomLink: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-sm text-white focus:border-primary transition-all shadow-inner" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-textMuted uppercase tracking-widest italic pl-1">GÖRÜŞME NOTU</label>
               <textarea rows="4" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-white text-sm outline-none focus:border-primary resize-none italic" placeholder="Görüşme detaylarını buraya not alın..."></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all italic flex items-center justify-center gap-3">
               {editingId ? <Check className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {editingId ? 'GÜNCELLEMEYİ KAYDET' : 'GÖRÜŞMEYİ ONAYLA'}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setFormData({ studentName: '', date: '', time: '', zoomLink: '', notes: '' }); }} className="w-full py-4 border border-white/10 text-textMuted rounded-xl text-[10px] font-black uppercase tracking-widest italic">İPTAL ET</button>
            )}
          </form>
        </div>

        {/* Madde 7 & 9: GÖRÜŞME LİSTESİ */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-3 mb-8">
              <Calendar className="w-7 h-7 text-emerald-400" /> Yaklaşan Görüşmeler
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((app) => (
                 <div key={app.id} className="p-8 bg-surface/40 border border-border/40 rounded-[2.5rem] group relative hover:border-primary/40 transition-all shadow-xl text-left">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", app.date < new Date().toISOString().split('T')[0] ? "bg-slate-900 text-slate-500" : "bg-emerald-400/20 text-emerald-400")}>
                             <Clock className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-white italic tracking-tight">{app.studentName}</h4>
                             <span className="text-[10px] font-black text-textMuted uppercase italic opacity-40">{app.date} - {app.time}</span>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => handleEdit(app)} className="p-2 text-primary/40 hover:text-primary transition-colors"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => deleteDoc(doc(db, 'appointments', app.id))} className="p-2 text-rose-500/30 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4"/></button>
                       </div>
                    </div>
                    
                    <p className="text-textMuted text-sm font-medium italic opacity-70 mb-8 border-l-2 border-primary/20 pl-4">{app.notes || 'Görüşme notu bulunmuyor.'}</p>
                    
                    {app.zoomLink && (
                      <a href={app.zoomLink} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-blue-600/10 text-blue-400 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 group-hover:bg-blue-600 group-hover:text-white transition-all italic">
                         <Video className="w-5 h-5" /> ZOOM GÖRÜŞMESİNE KATIL
                      </a>
                    )}
                 </div>
              ))}
              {appointments.length === 0 && (
                <div className="col-span-full py-20 text-center italic text-textMuted font-black uppercase tracking-widest opacity-30">Planlanmış bir görüşme bulunmuyor.</div>
              )}
           </div>
        </div>
      </div>
    </div>
  ); 
}
