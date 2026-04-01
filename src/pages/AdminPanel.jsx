import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc, deleteDoc, addDoc, orderBy } from 'firebase/firestore';
import { Shield, Users, Wallet, Clock, BarChart2, UserCheck, X, Trash2, BookOpen, Plus, Calendar } from 'lucide-react';
import clsx from 'clsx';

export default function AdminPanel() {
  const [admins, setAdmins] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignCoachId, setAssignCoachId] = useState({});
  
  // Blog Form State
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', category: 'uni', excerpt: '', content: '', imageUrl: '', tags: '' });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), snap => {
      const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCoaches(allUsers.filter(u => u.role === 'coach'));
      setAdmins(allUsers.filter(u => ['admin', 'super_admin', 'kurucu'].includes(u.role)));
      setLoading(false);
    });

    const u2 = onSnapshot(collection(db, 'students'), snap =>
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(collection(db, 'exams'), snap =>
      setExams(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u4 = onSnapshot(collection(db, 'pending_students'), snap =>
      setPendingStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u5 = onSnapshot(collection(db, 'blogPosts'), snap => {
       const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
       posts.sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
       setBlogPosts(posts);
    });

    return () => { unsubUsers(); u2(); u3(); u4(); u5(); };
  }, []);

  const totalStudents = students?.length || 0;
  const totalRevenue  = (students || []).reduce((s, st) => s + Number(st.paymentStatus === 'Ödendi' ? (st.fee || 0) : 0), 0);
  const totalPending  = (students || []).reduce((s, st) => s + Number(st.paymentStatus !== 'Ödendi' ? (st.fee || 0) : 0), 0);
  const studying      = (students || []).filter(s => s.isStudying).length;

  const handleSavePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    setSavingPost(true);
    try {
      await addDoc(collection(db, 'blogPosts'), {
        ...newPost,
        createdAt: new Date().toISOString(),
        author: 'Admin',
        tags: (newPost.tags || '').split(',').map(t => t.trim()).filter(t => t)
      });
      setNewPost({ title: '', category: 'uni', excerpt: '', content: '', imageUrl: '', tags: '' });
      setShowBlogForm(false);
      alert("✅ Blog yazısı başarıyla yayınlandı!");
    } catch (err) { alert(err.message); }
    setSavingPost(false);
  };

  const deletePost = async (id) => {
    if (!window.confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
    try { await deleteDoc(doc(db, 'blogPosts', id)); alert("✅ Yazı silindi."); } catch (err) { alert(err.message); }
  };

  const approveStudent = async (ps) => {
    const coachId = assignCoachId[ps.id];
    if (!coachId) { alert('Lütfen bir koç seçin.'); return; }
    try {
      await updateDoc(doc(db, 'users', ps.id), { role: 'student', coachId });
      await setDoc(doc(db, 'students', ps.id), {
        name: ps.name, email: ps.email, phone: ps.phone || '',
        coachId, fee: 0, paymentStatus: 'Bekliyor', status: 'Aktif',
        createdAt: new Date().toISOString()
      });
      await deleteDoc(doc(db, 'pending_students', ps.id));
      alert("✅ Onaylandı!");
    } catch (err) { alert(err.message); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] animate-pulse text-primary font-black uppercase tracking-widest italic">Yükleniyor...</div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-left selection:bg-primary/20">
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left flex items-center gap-8">
           <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center border-4 border-white shadow-2xl">
              <Shield className="w-9 h-9 text-white" />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-tight">Yönetim & Denetim Paneli</h2>
              <p className="text-textMuted font-medium text-lg italic opacity-60 pl-1 leading-relaxed">Sistemin kalbinde, her şeyi tam kontrol altında tutun.</p>
           </div>
        </div>
      </header>

      {/* KRİTİK ÖZET KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Eğitmen Kadrosu', value: coaches.length, icon: Shield, color: 'text-primary', bg: 'from-primary/10 to-primary/5', border: 'border-primary/20' },
          { label: 'Toplam Öğrenci', value: totalStudents, icon: Users, color: 'text-secondary', bg: 'from-secondary/10 to-secondary/5', border: 'border-secondary/20' },
          { label: 'Aktif Çalışan', value: studying, icon: Clock, color: 'text-emerald-400', bg: 'from-emerald-400/10 to-emerald-400/5', border: 'border-emerald-400/10' },
          { label: 'Aylık Ciro', value: `${totalRevenue.toLocaleString('tr-TR')}₺`, icon: Wallet, color: 'text-blue-400', bg: 'from-blue-400/10 to-blue-400/5', border: 'border-blue-400/10' },
        ].map(c => (
          <div key={c.label} className={clsx("bg-surface/50 border rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover:-translate-y-2 transition-all shadow-xl hover:shadow-primary/5", c.border)}>
             <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br shadow-inner group-hover:scale-110 transition-transform", c.bg)}>
                <c.icon className={clsx("w-7 h-7", c.color)} />
             </div>
             <div className="text-3xl font-black text-white italic tracking-tighter mb-1">{c.value}</div>
             <div className="text-[10px] text-textMuted font-black uppercase tracking-widest italic opacity-50">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* YÖNETİM EKİBİ */}
        <div className="bg-surface/60 backdrop-blur-xl border border-white/5 p-10 rounded-[3rem] shadow-2xl text-left">
          <h3 className="text-xl font-black mb-10 border-b border-white/5 pb-6 flex items-center justify-between uppercase italic tracking-tighter text-white">
             <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" /> Sistem Yetkilileri
             </div>
             <span className="text-[10px] font-black bg-slate-800 px-5 py-2 rounded-full text-textMuted opacity-60 tracking-widest">{admins.length} KİŞİ</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {admins.map(admin => (
                <div key={admin.id} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex items-center gap-5 group hover:bg-white/10 transition-all">
                   <div className="w-14 h-14 rounded-[1.25rem] bg-slate-900 border border-white/5 shadow-inner flex items-center justify-center text-primary font-black text-2xl italic uppercase group-hover:bg-primary group-hover:text-white transition-all">
                      {admin.name?.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-black text-white uppercase italic tracking-tighter truncate leading-none mb-1">{admin.name}</h4>
                      <p className="text-[10px] text-textMuted font-black uppercase tracking-widest italic opacity-40 truncate">{admin.email}</p>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* BEKLEYEN ONAYLAR */}
        <div className={clsx("bg-surface/60 backdrop-blur-xl p-10 rounded-[3rem] border shadow-2xl transition-all", pendingStudents.length > 0 ? "border-secondary/40 shadow-secondary/10" : "border-white/5")}>
           <h3 className="text-xl font-black mb-10 border-b border-white/5 pb-6 flex items-center justify-between uppercase italic tracking-tighter text-white">
              <div className="flex items-center gap-3">
                 <UserCheck className="w-6 h-6 text-secondary" /> Kayıt Bekleyenler
              </div>
              <span className="text-[10px] font-black bg-secondary text-white px-5 py-2 rounded-full tracking-widest shadow-xl shadow-secondary/20">{pendingStudents.length} YENİ</span>
           </h3>
           {pendingStudents.length === 0 ? (
             <div className="py-20 text-center italic text-textMuted font-black uppercase tracking-widest opacity-30">Yeni basvuru bulunmuyor.</div>
           ) : (
             <div className="space-y-4">
               {pendingStudents.map(ps => (
                 <div key={ps.id} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-all shadow-sm">
                   <div className="text-left w-full">
                      <div className="text-xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">{ps.name}</div>
                      <div className="text-[10px] text-textMuted font-black truncate opacity-40 italic">{ps.email}</div>
                   </div>
                   <div className="flex gap-4 w-full md:w-auto">
                      <select value={assignCoachId[ps.id] || ''} onChange={e => setAssignCoachId({...assignCoachId, [ps.id]: e.target.value})} className="flex-1 md:w-40 bg-slate-900/50 border border-border/50 rounded-xl px-4 py-3 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-primary shadow-inner appearance-none">
                         <option value="">KOÇ SEÇ</option>
                         {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <button onClick={() => approveStudent(ps)} className="px-8 py-3 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 transition-all italic">ONAYLA</button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* BLOG YÖNETİMİ: FULL WIDTH DARK STYLE */}
      <div className="bg-surface/50 border border-border/50 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group text-left">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(107,76,255,0.05)_100%)] pointer-events-none" />
         
         <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8 relative z-10">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
               <BookOpen className="w-8 h-8 text-primary" /> Blog Atölyesi
            </h3>
            <button onClick={() => setShowBlogForm(!showBlogForm)} className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all italic flex items-center gap-3">
               {showBlogForm ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} {showBlogForm ? 'Kapat' : 'Yeni Yazı'}
            </button>
         </div>

         {showBlogForm && (
           <form onSubmit={handleSavePost} className="mb-12 p-8 bg-slate-900/50 border border-primary/20 rounded-[3rem] space-y-8 animate-fade-in relative z-10 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <input type="text" required placeholder="Yazı Başlığı..." value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-primary outline-none italic transition-all shadow-inner"/>
                 <input type="url" placeholder="Görsel URL..." value={newPost.imageUrl} onChange={e => setNewPost({...newPost, imageUrl: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-primary outline-none italic transition-all shadow-inner"/>
              </div>
              <textarea rows="2" placeholder="Kışkırtıcı bir özet cümlesi..." value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-primary outline-none italic resize-none shadow-inner"/>
              <textarea rows="6" placeholder="Burası bilginin kalbi..." value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-primary outline-none italic resize-none shadow-inner"/>
              <button type="submit" disabled={savingPost} className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-102 transition-all italic border-b-4 border-slate-200 active:border-b-0 active:translate-y-1">{savingPost ? 'YAYINLANIYOR...' : 'DÜNYAYA DUYUR'}</button>
           </form>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {blogPosts.map(post => (
               <div key={post.id} className="p-8 bg-white/5 border border-white/5 rounded-[3rem] group hover:bg-white/10 hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-2xl h-full">
                  <div>
                     <div className="flex justify-between items-start mb-6">
                        <span className="text-[8px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-primary/20">#{post.category || 'REHBERLİK'}</span>
                        <button onClick={() => deletePost(post.id)} className="p-2.5 text-rose-500/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 hover:text-rose-400 rounded-xl"><Trash2 className="w-4 h-4"/></button>
                     </div>
                     <h4 className="font-black text-lg text-white uppercase italic tracking-tighter mb-6 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{post.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-textMuted font-black uppercase tracking-widest italic opacity-40 pt-6 border-t border-white/5">
                     <Calendar className="w-4 h-4" /> {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
