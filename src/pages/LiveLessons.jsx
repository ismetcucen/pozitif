import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Video, ExternalLink, Trash2 } from 'lucide-react';

export default function LiveLessons() { 
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'liveLessons'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'liveLessons'), {
        title, date, link, createdAt: new Date().toISOString()
      });
      setTitle(''); setDate(''); setLink('');
    } catch (error) { alert(error.message); }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Video className="text-primary w-8 h-8"/> Canlı Ders Planlama
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 h-fit">
          <h3 className="text-xl font-semibold mb-6 text-white">Ders Ekle</h3>
          <form onSubmit={handleAdd} className="space-y-4">
             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Konu (Örn: Matematik Tekrarı)" className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white" required />
             <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white" required />
             <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Zoom / Meet Linki" className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white" required />
             <button type="submit" className="w-full mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 rounded-xl font-bold">Oluştur</button>
          </form>
        </div>
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold mb-6 text-white">Planlanan Dersler</h3>
          <div className="space-y-4">
             {lessons.map(l => (
                <div key={l.id} className="p-5 rounded-2xl bg-surface/40 hover:bg-surface/80 flex items-center justify-between group">
                   <div>
                     <h4 className="text-lg font-bold text-white mb-1">{l.title}</h4>
                     <p className="text-sm text-blue-400">{new Date(l.date).toLocaleString('tr-TR')}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <a href={l.link} target="_blank" rel="noreferrer" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                        Hatıl <ExternalLink className="w-4 h-4"/>
                      </a>
                      <button onClick={() => deleteDoc(doc(db, 'liveLessons', l.id))} className="text-red-400 opacity-0 group-hover:opacity-100 p-2"><Trash2 className="w-5 h-5"/></button>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  ); 
}
