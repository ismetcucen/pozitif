import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { 
  Users, Search, Filter, Plus, ChevronRight, 
  Clock, TrendingUp, AlertCircle, Sparkles, UserPlus,
  Mail, Target, GraduationCap, Phone, Wallet, Key, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  // Madde 11: Yeni Öğrenci Form State
  const [newStudent, setNewStudent] = useState({
    name: '', email: '', phone: '',
    universityGoal: '', departmentGoal: '',
    fee: '', examField: 'SAYISAL'
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'students'), {
        ...newStudent,
        status: 'Aktif',
        isStudying: false,
        paymentStatus: 'Bekliyor',
        createdAt: new Date().toISOString()
      });
      setShowAddForm(false);
      setNewStudent({ name: '', email: '', phone: '', universityGoal: '', departmentGoal: '', fee: '', examField: 'SAYISAL' });
      alert("✅ Öğrenci başarıyla eklendi!");
    } catch (err) { alert(err.message); }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-fade-in relative z-20 pb-20 text-left">
      
      {/* 1. HEADER & SEARCH AREA */}
      <header className="flex flex-col xl:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center xl:text-left">
           <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter uppercase italic leading-none">Öğrenci <span className="text-glow text-primary">Kadronuz</span></h2>
           <p className="text-textMuted text-lg font-medium opacity-60 italic leading-relaxed">Tüm öğrencilerinizin gelişimini ve çalışma durumlarını buradan kontrol edin.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
           <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted opacity-50" />
              <input 
                type="text" 
                placeholder="Öğrenci ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface/50 border border-border/50 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white outline-none focus:border-primary transition-all shadow-inner italic"
              />
           </div>
           <button onClick={() => setShowAddForm(!showAddForm)} className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all italic flex items-center justify-center gap-3">
              {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />} {showAddForm ? 'Kapat' : 'Yeni Öğrenci'}
           </button>
        </div>
      </header>

      {/* Madde 11: ÖĞRENCİ EKLEME FORMU */}
      {showAddForm && (
        <form onSubmit={handleAddStudent} className="bg-surface/60 border border-primary/20 p-10 rounded-[3rem] shadow-2xl animate-slide-up space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <input type="text" placeholder="Öğrenci Ad Soyad*" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="bg-slate-900 border border-white/5 rounded-xl px-6 py-4 text-sm text-white focus:border-primary outline-none italic transition-all"/>
              <input type="email" placeholder="Öğrenci Mail*" required value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="bg-slate-900 border border-white/5 rounded-xl px-6 py-4 text-sm text-white focus:border-primary outline-none italic transition-all"/>
              <input type="tel" placeholder="Telefon" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} className="bg-slate-900 border border-white/5 rounded-xl px-6 py-4 text-sm text-white focus:border-primary outline-none italic transition-all"/>
              <input type="text" placeholder="Üniversite Hedefi" value={newStudent.universityGoal} onChange={e => setNewStudent({...newStudent, universityGoal: e.target.value})} className="bg-slate-900 border border-white/5 rounded-xl px-6 py-4 text-sm text-white focus:border-primary outline-none italic transition-all"/>
              <input type="text" placeholder="Bölüm Hedefi" value={newStudent.departmentGoal} onChange={e => setNewStudent({...newStudent, departmentGoal: e.target.value})} className="bg-slate-900 border border-white/5 rounded-xl px-6 py-4 text-sm text-white focus:border-primary outline-none italic transition-all"/>
              <input type="number" placeholder="Aylık Ücret" value={newStudent.fee} onChange={e => setNewStudent({...newStudent, fee: e.target.value})} className="bg-slate-900 border border-white/5 rounded-xl px-6 py-4 text-sm text-white focus:border-primary outline-none italic transition-all"/>
           </div>
           <button type="submit" className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-102 transition-all italic shadow-2xl">ÖĞRENCİYİ SİSTEME DAHİL ET</button>
        </form>
      )}

      {/* STUDENT LIST (Madde 13: Canlı Çalışma Durumu) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(student => (
          <div key={student.id} onClick={() => navigate(`/coach/students/${student.id}`)} className="bg-surface/50 border border-border/50 p-8 rounded-[2.5rem] group cursor-pointer hover:bg-slate-800/60 hover:border-primary/40 hover:-translate-y-2 transition-all shadow-xl text-left">
             <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 shadow-inner flex items-center justify-center text-primary font-black text-2xl italic uppercase group-hover:bg-primary group-hover:text-white transition-all">
                   {student.name.charAt(0)}
                </div>
                <div>
                   <div className="text-xl font-black text-white italic tracking-tighter uppercase leading-none mb-1 group-hover:text-primary transition-colors">{student.name}</div>
                   <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest italic">{student.universityGoal || 'Üniversite'} - {student.departmentGoal || 'Bölüm'}</div>
                </div>
             </div>
             {/* Madde 13: Canlı Çalışma Durumu */}
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl mb-6">
                <p className="text-[10px] text-textMuted font-black uppercase tracking-widest italic opacity-50 mb-1">Şu An Ne Yapıyor?</p>
                <div className="text-sm font-bold text-white italic">
                   {student.isStudying ? (
                     <span className="text-emerald-400">🚀 {student.currentTask || 'Ders'} Çalışıyor ({student.startTime || '--:--'}-{student.endTime || '--:--'})</span>
                   ) : '😴 Şu an masada değil'}
                </div>
             </div>
             <div className="flex items-center justify-between pt-6 border-t border-border/10">
                <div className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-emerald-400" />
                   <span className="text-[9px] font-black text-white/50 uppercase tracking-widest italic">Kontrol Et</span>
                </div>
                <ChevronRight className="w-5 h-5 text-textMuted" />
             </div>
          </div>
        ))}
      </div>

      {/* Madde 12: ALT DETAY ALANLARI (İletişim, Ödeme, Giriş Bilgileri) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-10">
         {/* İletişim & Ödeme Takibi */}
         <div className="bg-surface/40 border border-border/50 p-10 rounded-[3rem] shadow-xl text-left">
            <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-4 mb-8">
               <Wallet className="w-7 h-7 text-emerald-400" /> İletişim ve Finansal Durum
            </h3>
            <div className="space-y-4">
               {filtered.slice(0, 10).map(s => (
                 <div key={s.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div>
                       <div className="text-sm font-bold text-white italic">{s.name}</div>
                       <div className="text-[10px] text-textMuted italic">{s.phone || '05xx --- -- --'}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs font-black text-emerald-400 italic">{s.fee ? `${s.fee}₺` : '—'}</div>
                       <div className="text-[9px] text-textMuted uppercase italic tracking-widest opacity-50">{s.paymentStatus || 'Bekliyor'}</div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Otomatik Giriş Bilgileri */}
         <div className="bg-surface/40 border border-border/50 p-10 rounded-[3rem] shadow-xl text-left">
            <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter flex items-center gap-4 mb-8">
               <Key className="w-7 h-7 text-primary" /> Otomatik Giriş Bilgileri
            </h3>
            <div className="space-y-4">
               {filtered.slice(0, 10).map(s => (
                 <div key={s.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div>
                       <div className="text-sm font-bold text-white italic">{s.name}</div>
                       <div className="text-[10px] text-textMuted italic">{s.email}</div>
                    </div>
                    <button onClick={() => navigate(`/coach/students/${s.id}`)} className="text-[9px] font-black text-primary border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all italic">DÜZENLE</button>
                 </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
