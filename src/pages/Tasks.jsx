import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { CheckSquare, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('Ahmet Yılmaz');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksArr = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(tasksArr);
      }, (error) => {
        console.error("Firebase Snapshot Hatası:", error);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle,
        desc: newTaskDesc,
        studentName: selectedStudent,
        done: false,
        createdAt: new Date().toISOString()
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (error) {
      alert("Görev eklenemedi: " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Bu görev silinsin mi?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      console.error("Görev silinirken hata:", error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        done: !currentStatus
      });
    } catch (error) {
       console.error("Güncellenirken hata:", error);
    }
  };

  return (
    <div className="space-y-10 animate-slide-up pb-20 text-left">
      <header>
        <div className="flex items-center gap-4 mb-3">
           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <CheckSquare className="w-7 h-7" />
           </div>
           <h2 className="text-3xl font-black text-text tracking-tighter uppercase italic">Görev & Plan Yönetimi</h2>
        </div>
        <p className="text-textMuted mt-2 text-lg font-medium pl-1">Öğrencilerine atadığın görevleri ve haftalık planlarını buradan takip et.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* YENİ GÖREV FORMU */}
        <div className="bg-white p-10 h-fit xl:sticky top-6 border border-border rounded-[2.5rem] shadow-xl shadow-slate-200/40">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-text uppercase tracking-tighter italic border-b border-border pb-6">
            <Plus className="text-secondary w-6 h-6"/> Yeni Görev Ata
          </h3>
          <form onSubmit={handleAddTask} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-textMuted tracking-widest pl-1">Öğrenci Seçin</label>
              <select 
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-xl p-4 text-text font-bold focus:border-primary outline-none cursor-pointer"
               >
                 <option value="Tüm Öğrenciler">Tüm Öğrenciler (Genel)</option>
                 <option value="Ahmet Yılmaz">Ahmet Yılmaz</option>
                 <option value="Zeynep Çelik">Zeynep Çelik</option>
                 <option value="Burak Kaya">Burak Kaya</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-textMuted tracking-widest pl-1">Görev Başlığı</label>
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Örn: Limit Özeti Hazırla" 
                className="w-full bg-slate-50 border border-border rounded-xl p-4 text-text font-black focus:border-primary outline-none transition-all shadow-inner"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-textMuted tracking-widest pl-1">Görev Detayları / Etiket</label>
              <textarea 
                rows="3"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Örn: Cuma gününe kadar tamamlanmalı." 
                className="w-full bg-slate-50 border border-border rounded-xl p-4 text-text font-bold focus:border-primary outline-none transition-all shadow-inner resize-none"
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-primary text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 uppercase text-xs tracking-widest"
            >
              {loading ? <span className="animate-spin w-5 h-5 border-3 border-white/20 border-t-white rounded-full"/> : <><Plus className="w-5 h-5" /> Görevi Sisteme İşle</>}
            </button>
          </form>
        </div>

        {/* GÖREV LİSTESİ */}
        <div className="xl:col-span-2 space-y-8">
           <div className="flex justify-between items-end px-4">
              <h3 className="text-2xl font-black text-text italic tracking-tighter uppercase">Aktif Görevler</h3>
              <span className="text-[10px] font-black bg-primary/10 text-primary px-5 py-2 rounded-full uppercase tracking-widest border border-primary/20">{tasks.length} TOPLAM GÖREV</span>
           </div>

           <div className="space-y-6">
              {tasks.length === 0 ? (
                <div className="text-center py-32 border border-dashed border-border rounded-[3rem] bg-slate-50">
                  <CheckSquare className="w-20 h-20 text-textMuted mx-auto mb-6 opacity-10" />
                  <p className="text-textMuted text-xl font-black uppercase tracking-widest italic opacity-40">Henüz atanmış bir görev bulunmuyor.</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-border hover:border-primary/30 hover:shadow-2xl hover:shadow-slate-200/60 transition-all flex items-start gap-6 group relative overflow-hidden shadow-sm">
                     <div 
                       onClick={() => toggleStatus(task.id, task.done)}
                       className={clsx(
                         "mt-1 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer border-2 transition-all shadow-sm",
                         task.done ? "bg-green-500 border-green-400 scale-110" : "bg-slate-50 border-border hover:border-primary hover:bg-white"
                       )}
                     >
                       {task.done && <CheckCircle className="w-5 h-5 text-white" />}
                     </div>
                     
                     <div className="flex-1 text-left">
                       <div className="flex flex-wrap justify-between items-start mb-2 gap-4">
                         <h4 className={clsx("font-black text-xl italic tracking-tighter uppercase transition-all", task.done ? "text-textMuted/40 line-through" : "text-text")}>
                           {task.title}
                         </h4>
                         <span className="text-[10px] font-black bg-slate-100 px-4 py-1.5 rounded-full text-textMuted border border-border uppercase tracking-widest italic">
                           {task.studentName}
                         </span>
                       </div>
                       {task.desc && <p className={clsx("text-sm font-medium italic transition-all", task.done ? "text-textMuted/30" : "text-textMuted")}>{task.desc}</p>}
                     </div>

                     <button 
                       onClick={() => handleDelete(task.id)}
                       className="opacity-0 group-hover:opacity-100 transition-all p-3 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-2xl flex-shrink-0"
                       title="Görevi Sil"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
