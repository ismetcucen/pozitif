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
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-blue-600 font-bold uppercase tracking-widest animate-pulse italic">
       SİSTEM KONTROL EDİLİYOR...
    </div>
  );

  return (
    <div className="min-h-screen bg-white relative py-12 px-4 md:px-10 selection:bg-blue-100">
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left border-b-2 border-slate-100 pb-12">
           <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase mb-6 shadow-button">
                 <ShieldAlert className="w-4 h-4 text-white" /> SİSTEM YÖNETİCİSİ
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-blue-600 tracking-tighter uppercase italic leading-none mb-4">
                 KOMUTA <span className="text-black not-italic">MERKEZİ</span>
              </h1>
              <p className="text-slate-500 text-base md:text-lg font-bold opacity-80">Tüm platformun işleyişini, onaylarını ve güvenliğini buradan yönetin.</p>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={() => navigate('/')}
                className="px-10 py-5 rounded-saas bg-white border-2 border-slate-900 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-soft"
              >
                 ANA SAYFA
              </button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           
           {/* BEKLEYEN ÖĞRENCİLER */}
           <div className="bg-white border-2 border-slate-100 p-8 md:p-10 rounded-3xl shadow-soft">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                 <h2 className="text-2xl font-black text-blue-600 uppercase tracking-tighter italic flex items-center gap-4">
                    <UserPlus className="w-8 h-8" /> Öğrenci Onayları
                 </h2>
                 <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{pendingStudents.length} YENİ</span>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {pendingStudents.map(s => (
                   <div key={s.id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-600/30 transition-all">
                      <div>
                         <div className="text-lg font-black text-black uppercase italic tracking-tight mb-1">{s.name}</div>
                         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> {s.email}
                         </div>
                      </div>
                      <button 
                        onClick={() => handleApprove(s.id, 'student', 'student')}
                        className="p-4 bg-emerald-500 text-white rounded-xl shadow-button hover:bg-emerald-600 transition-all active:scale-90"
                      >
                         <CheckCircle2 className="w-7 h-7" />
                      </button>
                   </div>
                 ))}
                 {pendingStudents.length === 0 && (
                   <div className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-[0.2em] italic">BEKLEYEN ÖĞRENCİ BULUNMAMAKTADIR.</div>
                 )}
              </div>
           </div>

           {/* BEKLEYEN KOÇLAR */}
           <div className="bg-white border-2 border-slate-100 p-8 md:p-10 rounded-3xl shadow-soft">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                 <h2 className="text-2xl font-black text-blue-600 uppercase tracking-tighter italic flex items-center gap-4">
                    <Sparkles className="w-8 h-8" /> Koç Başvuruları
                 </h2>
                 <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{pendingCoaches.length} ADAY</span>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                 {pendingCoaches.map(c => (
                   <div key={c.id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-600/30 transition-all">
                      <div>
                         <div className="text-lg font-black text-black uppercase italic tracking-tight mb-1">{c.name}</div>
                         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> {c.phone}
                         </div>
                      </div>
                      <button 
                        onClick={() => handleApprove(c.id, 'coach', 'coach')}
                        className="p-4 bg-blue-600 text-white rounded-xl shadow-button hover:bg-blue-700 transition-all active:scale-90"
                      >
                         <CheckCircle2 className="w-7 h-7" />
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
        <div className="bg-white border-2 border-slate-200 p-8 md:p-16 rounded-[3rem] shadow-premium">
           <div className="flex flex-col lg:flex-row items-center justify-between mb-16 gap-10">
              <h2 className="text-3xl font-black text-blue-600 uppercase tracking-tighter italic flex items-center gap-5">
                 <Users className="w-10 h-10 text-blue-600" /> Üye Veritabanı
              </h2>
              <div className="relative w-full lg:w-[450px]">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Üye adı veya e-posta ile ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-6 pl-16 pr-8 text-sm font-bold text-black outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
                 />
              </div>
           </div>

           <div className="overflow-x-auto pb-4 custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                 <thead>
                    <tr className="border-b-2 border-slate-900 pb-4">
                       <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">SİMGE</th>
                       <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-6">ÜYE BİLGİLERİ</th>
                       <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">YETKİ</th>
                       <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right pr-6">AKSİYON</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                       <tr key={u.id} className="group hover:bg-slate-50 transition-colors">
                          <td className="py-8">
                             <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-white italic uppercase group-hover:scale-110 transition-all shadow-lg">
                                {u.name?.charAt(0) || '?'}
                             </div>
                          </td>
                          <td className="py-8 pl-6">
                             <div className="text-xl font-black text-black uppercase italic tracking-tight">{u.name}</div>
                             <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{u.email}</div>
                          </td>
                          <td className="py-8">
                             <span className={clsx("px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border-2", 
                               u.role === 'student' ? "bg-blue-50 text-blue-600 border-blue-200" : 
                               u.role === 'coach' ? "bg-purple-50 text-purple-600 border-purple-200" : 
                               "bg-slate-900 text-white border-transparent")}>
                                {u.role?.replace('_', ' ')}
                             </span>
                          </td>
                          <td className="py-8 text-right pr-6">
                             <button 
                               onClick={() => handleDeleteUser(u.id)}
                               className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                             >
                                <Trash2 className="w-6 h-6" />
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
