import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { 
  Users, UserCheck, UserPlus, Settings, 
  Trash2, CheckCircle2, XCircle, ShieldAlert,
  ArrowLeft, Search, Filter, Mail, Phone,
  LayoutDashboard, Database, Lock, RefreshCw, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function AdminPanel() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingCoaches, setPendingCoaches] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Bekleyen Öğrenciler
    const unsubPendingS = onSnapshot(collection(db, 'pending_students'), (snap) => {
      setPendingStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Bekleyen Koçlar
    const unsubPendingC = onSnapshot(collection(db, 'pending_coaches'), (snap) => {
      setPendingCoaches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Tüm Kullanıcılar
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setAllUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => { unsubPendingS(); unsubPendingC(); unsubUsers(); };
  }, []);

  const handleApprove = async (id, role, type) => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, { role: role });
      
      const coll = type === 'student' ? 'pending_students' : 'pending_coaches';
      await deleteDoc(doc(db, coll, id));
      alert('Onaylama işlemi başarılı.');
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      alert('Kullanıcı silindi.');
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-primary font-bold uppercase tracking-widest animate-pulse italic">
       SİSTEM KONTROL EDİLİYOR...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden py-12 px-4 md:px-10 selection:bg-primary/20">
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left border-b border-slate-200 pb-12">
           <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary text-[10px] font-black tracking-widest uppercase mb-6 shadow-soft">
                 <ShieldAlert className="w-4 h-4 text-danger" /> SİSTEM YÖNETİCİSİ
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">
                 KOMUTA <span className="text-primary not-italic">MERKEZİ</span>
              </h1>
              <p className="text-slate-500 text-base md:text-lg font-medium opacity-70">Tüm platformun işleyişini, onaylarını ve güvenliğini buradan yönetin.</p>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-4 rounded-saas bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all shadow-soft"
              >
                 ANA SAYFA
              </button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           
           {/* BEKLEYEN ÖĞRENCİLER */}
           <div className="saas-panel p-8 md:p-10 border-t-4 border-t-primary">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-4">
                    <UserPlus className="w-7 h-7 text-primary" /> Öğrenci Onayları
                 </h2>
                 <span className="bg-blue-50 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{pendingStudents.length} YENİ</span>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {pendingStudents.map(s => (
                   <div key={s.id} className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group hover:bg-white hover:border-primary/30 hover:shadow-premium transition-all">
                      <div>
                         <div className="text-base font-black text-slate-900 uppercase italic tracking-tight mb-1">{s.name}</div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> {s.email}
                         </div>
                      </div>
                      <button 
                        onClick={() => handleApprove(s.id, 'student', 'student')}
                        className="p-3 bg-success text-white rounded-xl shadow-button hover:bg-emerald-600 transition-all active:scale-90"
                      >
                         <CheckCircle2 className="w-6 h-6" />
                      </button>
                   </div>
                 ))}
                 {pendingStudents.length === 0 && (
                   <div className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em] italic">BEKLEYEN ÖĞRENCİ BULUNMAMAKTADIR.</div>
                 )}
              </div>
           </div>

           {/* BEKLEYEN KOÇLAR */}
           <div className="saas-panel p-8 md:p-10 border-t-4 border-t-secondary">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-4">
                    <Sparkles className="w-7 h-7 text-secondary" /> Koç Başvuruları
                 </h2>
                 <span className="bg-purple-50 text-secondary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">{pendingCoaches.length} ADAY</span>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {pendingCoaches.map(c => (
                   <div key={c.id} className="p-6 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group hover:bg-white hover:border-secondary/30 hover:shadow-premium transition-all">
                      <div>
                         <div className="text-base font-black text-slate-900 uppercase italic tracking-tight mb-1">{c.name}</div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> {c.phone}
                         </div>
                      </div>
                      <button 
                        onClick={() => handleApprove(c.id, 'coach', 'coach')}
                        className="p-3 bg-secondary text-white rounded-xl shadow-button hover:opacity-90 transition-all active:scale-90"
                      >
                         <CheckCircle2 className="w-6 h-6" />
                      </button>
                   </div>
                 ))}
                 {pendingCoaches.length === 0 && (
                   <div className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em] italic">BEKLEYEN KOÇ BAŞVURUSU BULUNMAMAKTADIR.</div>
                 )}
              </div>
           </div>

        </div>

        {/* TÜM KULLANICILAR LİSTESİ */}
        <div className="saas-panel p-8 md:p-14">
           <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-4">
                 <Users className="w-9 h-9 text-primary" /> Üye Veritabanı
              </h2>
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Üye adı veya e-posta ile ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-saas py-5 pl-14 pr-8 text-sm font-bold text-slate-900 outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
                 />
              </div>
           </div>

           <div className="overflow-x-auto pb-4 custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                 <thead>
                    <tr className="border-b border-slate-100">
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">SİMGE</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">ÜYE BİLGİLERİ</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">YETKİ</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">İŞLEMLER</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(u => (
                       <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-6">
                             <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-primary italic uppercase group-hover:bg-white group-hover:scale-110 transition-all shadow-soft">
                                {u.name?.charAt(0) || '?'}
                             </div>
                          </td>
                          <td className="py-6 pl-4">
                             <div className="text-base font-black text-slate-900 uppercase italic tracking-tight">{u.name}</div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.email}</div>
                          </td>
                          <td className="py-6">
                             <span className={clsx("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border", 
                               u.role === 'student' ? "bg-blue-50 text-primary border-blue-100" : 
                               u.role === 'coach' ? "bg-purple-50 text-secondary border-purple-100" : 
                               "bg-slate-100 text-slate-800 border-slate-200")}>
                                {u.role?.replace('_', ' ')}
                             </span>
                          </td>
                          <td className="py-6 text-right">
                             <button 
                               onClick={() => handleDeleteUser(u.id)}
                               className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
                             >
                                <Trash2 className="w-5 h-5" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
}
