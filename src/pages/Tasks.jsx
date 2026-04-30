import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { CheckSquare, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function Tasks({ studentId: propStudentId, studentName: propStudentName }) {
  const { studentId: paramId } = useParams();
  const studentId = propStudentId || paramId;
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('Tüm Öğrenciler');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (studentId) {
      setSelectedStudentId(studentId);
      if (propStudentName) setSelectedStudent(propStudentName);
    }
    
    try {
      const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let tasksArr = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (studentId) {
          tasksArr = tasksArr.filter(t => t.studentId === studentId);
        }
        setTasks(tasksArr);
      });
      
      let unsubStudents = () => {};
      if (!studentId) {
        unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
           setStudents(snap.docs.map(d => ({ id: d.id, name: d.name })));
         });
      }
       
      return () => { unsubscribe(); unsubStudents(); };
    } catch (err) {
      console.error(err);
    }
  }, [studentId, propStudentName]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setLoading(true);
    let stName = selectedStudent;
    let stId = selectedStudentId;

    if (!propStudentId && selectedStudentId) {
      const st = students.find(s => s.id === selectedStudentId);
      if (st) stName = st.name;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle,
        desc: newTaskDesc,
        studentName: stName,
        studentId: stId || null,
        targetDate: taskDate,
        done: false,
        createdAt: Date.now()
      });
      // Bildirim oluştur
      if (stId) {
        await addDoc(collection(db, 'notifications'), {
          toUid: stId,
          title: 'Yeni Görev Atandı',
          body: `Koçunuz "${newTaskTitle}" görevini sana atadı.${taskDate ? ` Teslim: ${new Date(taskDate).toLocaleDateString('tr-TR')}` : ''}`,
          type: 'task',
          read: false,
          createdAt: Date.now()
        });
      }
      setNewTaskTitle('');
      setNewTaskDesc('');
      setTaskDate('');
      toast.success('Görev başarıyla eklendi!');
    } catch (error) {
      toast.error("Görev eklenemedi: " + error.message);
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
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2 flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-indigo-600" /> Görev & Plan Yönetimi
           </h1>
           <p className="text-slate-600 text-sm font-medium">Öğrencilerinize atadığınız görevleri ve haftalık planlarını buradan takip edin.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* YENİ GÖREV FORMU */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm h-fit xl:sticky top-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <Plus className="text-indigo-600 w-5 h-5"/> Yeni Görev Ata
          </h3>
          <form onSubmit={handleAddTask} className="space-y-5">
            {!propStudentId && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Öğrenci Seçin</label>
              <select 
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  const selectedSt = students.find(s => s.id === e.target.value);
                  setSelectedStudent(selectedSt ? selectedSt.name : 'Tüm Öğrenciler');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none cursor-pointer appearance-none"
               >
                 <option value="">-- Öğrenci Seç--</option>
                 {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Görev Başlığı</label>
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Örn: Limit Özeti Hazırla" 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Hedef Tarih</label>
              <input 
                type="date" 
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Görev Detayları / Etiket</label>
              <textarea 
                rows="3"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Örn: Cuma gününe kadar tamamlanmalı." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-900 focus:border-indigo-600 outline-none transition-colors resize-none"
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"/> : <><Plus className="w-4 h-4" /> Görevi Sisteme İşle</>}
            </button>
          </form>
        </div>

        {/* GÖREV LİSTESİ */}
        <div className="xl:col-span-2 space-y-8">
           
           {/* GERÇEKLEŞMEYEN GÖREVLER */}
           <div>
              <div className="flex justify-between items-center px-2 mb-4">
                 <h3 className="text-lg font-semibold text-slate-900">Bekleyen Görevler</h3>
                 <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">{tasks.filter(t => !t.done).length} Görev</span>
              </div>
              <div className="space-y-4">
                 {tasks.filter(t => !t.done).length === 0 ? (
                   <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                     <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                     <p className="text-slate-500 font-medium text-sm">Bekleyen görev bulunmuyor.</p>
                   </div>
                 ) : (
                   tasks.filter(t => !t.done).map((task) => (
                     <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-5 group relative overflow-hidden">
                        <button 
                          onClick={() => toggleStatus(task.id, task.done)}
                          className="mt-0.5 shrink-0 w-6 h-6 rounded flex items-center justify-center border transition-all bg-slate-50 border-slate-300 hover:border-emerald-400 group-hover:bg-white"
                        >
                        </button>
                        
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                            <h4 className="font-semibold text-base transition-colors truncate text-slate-900">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 shrink-0">
                              {task.targetDate && (
                                <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded border border-amber-100 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {new Date(task.targetDate).toLocaleDateString('tr-TR')}
                                </span>
                              )}
                              <span className="text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-600 uppercase tracking-widest">
                                {task.studentName}
                              </span>
                            </div>
                          </div>
                          {task.desc && <p className="text-sm transition-colors text-slate-600">{task.desc}</p>}
                        </div>

                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg flex-shrink-0 ml-2"
                          title="Görevi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   ))
                 )}
              </div>
           </div>

           {/* GERÇEKLEŞEN GÖREVLER */}
           <div>
              <div className="flex justify-between items-center px-2 mb-4">
                 <h3 className="text-lg font-semibold text-slate-900 border-l-4 border-emerald-500 pl-3">Tamamlanan Görevler</h3>
                 <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">{tasks.filter(t => t.done).length} Görev</span>
              </div>
              <div className="space-y-4">
                 {tasks.filter(t => t.done).length === 0 ? (
                   <div className="text-center py-6 border border-slate-100 rounded-2xl bg-slate-50">
                     <p className="text-slate-400 font-medium text-sm">Görev tamamlandıkça burada görünecek.</p>
                   </div>
                 ) : (
                   tasks.filter(t => t.done).map((task) => (
                     <div key={task.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 flex items-start gap-5 group relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleStatus(task.id, task.done)}
                          className="mt-0.5 shrink-0 w-6 h-6 rounded flex items-center justify-center border transition-all bg-emerald-500 border-emerald-500"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </button>
                        
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                            <h4 className="font-semibold text-sm transition-colors truncate text-slate-500 line-through">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 shrink-0">
                              {task.targetDate && (
                                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 opacity-70">
                                  <Clock className="w-3 h-3" /> {new Date(task.targetDate).toLocaleDateString('tr-TR')}
                                </span>
                              )}
                              <span className="text-[9px] font-bold bg-slate-200/50 px-2.5 py-1 rounded text-slate-500 uppercase tracking-widest">
                                {task.studentName}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg flex-shrink-0 ml-2"
                          title="Görevi Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
