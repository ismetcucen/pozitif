import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, onSnapshot, query, where, updateDoc, doc, deleteDoc, writeBatch 
} from 'firebase/firestore';
import { 
  Users, ShieldAlert, Trash2, CheckCircle2, 
  Search, LayoutDashboard, Database, Sparkles,
  BarChart3, CreditCard, Activity, ArrowLeft, Star, Ban
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [stats, setStats] = useState({ users: 0, students: 0, payments: 0, activeSessions: 0 });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Real-time listeners for Admin Stats
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setAllUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setStats(prev => ({ ...prev, users: snap.size }));
    });

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStats(prev => ({ ...prev, students: snap.size }));
      setLoading(false);
    });

    const unsubPending = onSnapshot(query(collection(db, 'users'), where('role', '==', 'pending')), (snap) => {
      setPendingUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubUsers(); unsubStudents(); unsubPending(); };
  }, []);

  const handleApprove = async (id, role) => {
    try {
      await updateDoc(doc(db, 'users', id), { role });
      toast.success('Kullanıcı onaylandı.');
    } catch (err) {
      toast.error('Onaylama hatası.');
    }
  };

  const handleUpdateStatus = async (id, updates, message) => {
    if (!window.confirm(`Bu kullanıcı için işlemi onaylıyor musunuz?`)) return;
    try {
      await updateDoc(doc(db, 'users', id), updates);
      toast.success(message);
    } catch (err) {
      toast.error('İşlem başarısız: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu kullanıcıyı kalıcı olarak SİLMEK istediğinize emin misiniz? (Bu işlem geri alınamaz!)")) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      toast.success("Kullanıcı sistemden tamamen silindi.");
    } catch (err) {
      toast.error("Silme hatası: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 space-y-12 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="text-secondary w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Sistem Komuta Merkezi</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">POZİTİFKOÇ <span className="text-primary">ADMİN</span></h1>
          <p className="text-text-muted text-xs font-bold uppercase mt-1">Platformun tüm modüllerini buradan yönetin.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate(-1)} className="btn-premium bg-glass border border-glass-border">
             <ArrowLeft className="w-4 h-4" /> GERİ
          </button>
          <button className="btn-premium bg-primary">
             <Database className="w-4 h-4" /> VERİ YEDEKLE
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Toplam Kullanıcı', val: stats.users, icon: Users, color: 'text-primary' },
          { label: 'Aktif Öğrenci', val: stats.students, icon: Activity, color: 'text-emerald-400' },
          { label: 'Aylık Ciro', val: '₺12.400', icon: CreditCard, color: 'text-secondary' },
          { label: 'Sistem Yükü', val: '%14', icon: BarChart3, color: 'text-accent' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-4">
            <div className={`p-3 bg-glass rounded-xl ${s.color}`}><s.icon className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-text-muted">{s.label}</p>
              <p className="text-2xl font-black">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Pending Approvals */}
        <section className="glass-card overflow-hidden">
          <div className="p-6 border-b border-glass-border bg-glass/30 flex justify-between items-center">
            <h2 className="text-lg font-black italic tracking-tighter uppercase flex items-center gap-2">
              <Sparkles className="text-secondary" /> Bekleyen Onaylar
            </h2>
            <span className="text-[10px] font-black bg-secondary/20 text-secondary px-3 py-1 rounded-full">{pendingUsers.length}</span>
          </div>
          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
            {pendingUsers.length === 0 ? (
              <p className="text-center py-10 text-text-muted text-xs italic font-medium">Onay bekleyen kullanıcı bulunmuyor.</p>
            ) : (
              pendingUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-glass border border-glass-border rounded-2xl hover:border-secondary/50 transition-all">
                  <div>
                    <p className="font-bold text-sm uppercase">{u.name}</p>
                    <p className="text-[10px] text-text-muted font-black">{u.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(u.id, 'student')} className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleApprove(u.id, 'coach')} className="p-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary hover:text-white transition-all">
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* User Management List */}
        <section className="glass-card overflow-hidden">
          <div className="p-6 border-b border-glass-border bg-glass/30 flex justify-between items-center">
            <h2 className="text-lg font-black italic tracking-tighter uppercase flex items-center gap-2">
              <Users className="text-primary" /> Kullanıcı Matrisi
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-glass border border-glass-border rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary transition-all w-48"
              />
            </div>
          </div>
          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
            {allUsers.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
              <div key={u.id} className={clsx("flex items-center justify-between p-3 border rounded-xl transition-all", u.role === 'banned' ? 'bg-red-950/20 border-red-900/30 opacity-70' : u.isVIP ? 'bg-amber-500/5 border-amber-500/20' : 'bg-glass/10 border-glass-border hover:bg-glass/20')}>
                <div className="flex items-center gap-3">
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white", u.isVIP ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(251,191,36,0.3)]" : "bg-gradient")}>
                    {u.isVIP ? <Star className="w-3.5 h-3.5 fill-current" /> : u.name?.[0]}
                  </div>
                  <div>
                    <p className={clsx("text-[11px] font-black uppercase flex items-center gap-2", u.role === 'banned' && "line-through text-red-400")}>
                      {u.name}
                      {u.isVIP && <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full border border-amber-500/30">VIP</span>}
                    </p>
                    <span className={clsx(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                      u.role === 'admin' ? "bg-secondary/20 text-secondary" : 
                      u.role === 'banned' ? "bg-red-500/20 text-red-500" :
                      u.role === 'coach' ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                    )}>
                      {u.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-50 hover:opacity-100 transition-opacity">
                  {u.role !== 'admin' && (
                    <>
                      <button onClick={() => handleUpdateStatus(u.id, { isVIP: !u.isVIP }, u.isVIP ? 'VIP statüsü alındı.' : 'VIP yapıldı!')} title="VIP/Premium Yap" className="p-2 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors">
                        <Star className={clsx("w-4 h-4", u.isVIP && "fill-current")} />
                      </button>
                      <button onClick={() => handleUpdateStatus(u.id, { role: u.role === 'banned' ? 'student' : 'banned' }, u.role === 'banned' ? 'Kullanıcı yasağı kaldırıldı.' : 'Kullanıcı yasaklandı!')} title="Banla/Yasakla" className="p-2 text-orange-500/70 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors">
                        <Ban className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} title="Kalıcı Olarak Sil" className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
