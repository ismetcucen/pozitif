import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
  Wallet, TrendingUp, Clock, CheckCircle2, 
  Search, Users, MessageSquare, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

export default function Payments() {
  const [students, setStudents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Öğrencileri dinle
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Görüşmeleri dinle (Görüşme sayısını hesaplamak için)
    const unsubApps = onSnapshot(collection(db, 'appointments'), (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubStudents(); unsubApps(); };
  }, []);

  const totalRevenue = students.reduce((sum, s) => sum + (s.paymentStatus === 'Ödendi' ? (Number(s.fee) || 0) : 0), 0);
  const pendingRevenue = students.reduce((sum, s) => sum + (s.paymentStatus !== 'Ödendi' ? (Number(s.fee) || 0) : 0), 0);

  const handleUpdateStatus = async (id, status) => {
     try {
       await updateDoc(doc(db, 'students', id), { paymentStatus: status });
     } catch (err) { console.error(err); }
  };

  // Madde 14: Görüşme sayısını öğrenci ismine göre say
  const getMeetingCount = (studentName) => {
    return appointments.filter(app => app.studentName === studentName).length;
  };

  const filtered = students.filter(s =>
    (s.name || s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6">
      
      {/* 1. HEADER AREA */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2 flex items-center gap-3">
              <Wallet className="w-6 h-6 text-emerald-600" /> Ödeme Takibi
           </h1>
           <p className="text-slate-600 text-sm font-medium">Öğrencilerinizin ödeme durumlarını ve koçluk bedellerini buradan yönetin.</p>
        </div>

        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
             type="text" 
             placeholder="Öğrenci ara..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 transition-colors shadow-sm"
           />
        </div>
      </header>

      {/* 2. STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
           <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
           </div>
           <div>
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Toplam Tahsilat</div>
              <div className="text-3xl font-bold text-slate-900">{totalRevenue.toLocaleString('tr-TR')} ₺</div>
           </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
           <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-amber-500" />
           </div>
           <div>
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Bekleyen Tahsilat</div>
              <div className="text-3xl font-bold text-slate-900">{pendingRevenue.toLocaleString('tr-TR')} ₺</div>
           </div>
        </div>
      </div>

      {/* 3. ÖĞRENCİ DETAYLARI LİSTESİ */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
           <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                 <Users className="w-5 h-5 text-indigo-600" /> Öğrenci Detayları
              </h3>
           </div>

           <div className="space-y-3">
              {loading ? (
                <div className="py-20 text-center text-slate-400 font-medium text-sm animate-pulse">Yükleniyor...</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-medium text-sm">Kayıt bulunamadı.</div>
              ) : (
                filtered.map(student => (
                  <div key={student.id} 
                    className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all group"
                  >
                     {/* Öğrenci Bilgisi */}
                     <div className="flex items-center gap-4 w-full md:w-1/3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-sm shrink-0">
                           {(student.name || student.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                           <div className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{student.name || student.email || 'İsimsiz Öğrenci'}</div>
                           <div className="text-xs text-slate-500 truncate">{student.email}</div>
                        </div>
                     </div>
                     
                     {/* Aylık Ücret */}
                     <div className="flex flex-col items-start w-full md:w-1/5">
                         <span className="text-xs font-semibold text-slate-500 mb-0.5">Aylık Ücret</span>
                         <span className="text-sm font-bold text-slate-900">{student.fee || 0} ₺</span>
                     </div>

                     {/* Görüşme Sayısı */}
                     <div className="flex flex-col items-start w-full md:w-1/5">
                         <span className="text-xs font-semibold text-slate-500 mb-0.5">Yapılan Görüşme</span>
                         <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-bold text-slate-900">{getMeetingCount(student.name)} Kez</span>
                         </div>
                     </div>

                     {/* Ödeme Durumu */}
                     <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
                        <select 
                            value={student.paymentStatus || 'Bekliyor'}
                            onChange={(e) => handleUpdateStatus(student.id, e.target.value)}
                            className={clsx(
                              "w-full md:w-auto px-4 py-2 rounded-lg text-xs font-semibold outline-none transition-colors cursor-pointer border",
                              student.paymentStatus === 'Ödendi' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                              student.paymentStatus === 'Gecikti' ? "bg-red-50 text-red-700 border-red-200" :
                              "bg-amber-50 text-amber-700 border-amber-200"
                            )}
                        >
                            <option value="Bekliyor">Bekliyor</option>
                            <option value="Ödendi">Ödendi</option>
                            <option value="Gecikti">Gecikti</option>
                        </select>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

    </div>
  );
}
