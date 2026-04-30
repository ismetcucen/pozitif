import { useState, useEffect } from 'react';
import { db, secondaryAuth, auth } from '../firebase';
import { collection, onSnapshot, doc, setDoc, query, where, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import toast from 'react-hot-toast';
import { 
  Users, Search, Plus, ChevronRight, 
  Clock, TrendingUp, AlertCircle, Sparkles, UserPlus,
  Mail, Target, GraduationCap, Phone, Wallet, Key, X,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { UNIVERSITIES } from '../data/universities';
export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const [newStudent, setNewStudent] = useState({
    name: '', email: '', phone: '', parentPhone: '',
    educationLevel: 'Lise',
    universityGoal: '', departmentGoal: '', grade: '12',
    fee: '', examField: 'SAYISAL'
  });

  useEffect(() => {
    let unsub;
    const checkRoleAndSubscribe = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        const isAdmin = ['admin', 'super_admin', 'kurucu'].includes(userData?.role);

        // Koçun hem kendi eklediği hem de kendisini seçen öğrencileri görmesi için
        // Firestore'da 'or' sorgusu yerine iki alanı da içeren bir yaklaşım veya client-side filtreleme.
        // Şimdilik daha güvenli olması için koçun görebileceği tüm öğrencileri çekelim.
        const q = isAdmin 
          ? collection(db, 'students') 
          : collection(db, 'students'); // Client-side filtreleme yapacağız

        unsub = onSnapshot(q, (snap) => {
          let allStudents = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          if (!isAdmin) {
            allStudents = allStudents.filter(s => 
              s.addedBy === auth.currentUser.uid || 
              s.coachId === auth.currentUser.uid
            );
          }
          
          setStudents(allStudents);
          setLoading(false);
        });
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    checkRoleAndSubscribe();
    return () => { if (unsub) unsub(); };
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      // 1. İkincil Auth üzerinden kullanıcı oluştur (default şifre: 123456)
      const cred = await createUserWithEmailAndPassword(secondaryAuth, newStudent.email, "123456");
      const uid = cred.user.uid;
      
      // 2. Auth oturumunu hemen kapat ki sorun olmasın (isteğe bağlı ama güvenli)
      await signOut(secondaryAuth);

      // 3. Ortak users koleksiyonuna ekle (Login olabilmesi için)
      await setDoc(doc(db, 'users', uid), {
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone,
        role: 'student',
        addedBy: auth.currentUser.uid, // Koç ID'si eklendi
        createdAt: new Date().toISOString()
      });

      const finalUni = newStudent.universityGoal === 'Diğer / Hedefsiz' ? (newStudent.customUniversity || 'Diğer') : newStudent.universityGoal;
      const finalDep = newStudent.universityGoal === 'Diğer / Hedefsiz' ? (newStudent.customDepartment || 'Diğer') : newStudent.departmentGoal;
      
      const studentDataToSave = { ...newStudent };
      studentDataToSave.universityGoal = finalUni;
      studentDataToSave.departmentGoal = finalDep;
      
      // Gereksiz alanları temizle
      delete studentDataToSave.customUniversity;
      delete studentDataToSave.customDepartment;

      // 4. Students koleksiyonuna ekle
      await setDoc(doc(db, 'students', uid), {
        ...studentDataToSave,
        target: { university: finalUni, department: finalDep }, // StudentDetail.jsx target.university kullanıyor
        status: 'Aktif',
        currentStatus: {
          isStudying: false,
          subject: null,
          topic: null,
          activityType: null,
          timerMode: null,
          startedAt: null
        },
        paymentStatus: 'Bekliyor',
        addedBy: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });

      setShowAddForm(false);
      setNewStudent({ name: '', email: '', phone: '', parentPhone: '', universityGoal: '', departmentGoal: '', grade: '12', fee: '', examField: 'SAYISAL' });
      alert("✅ Öğrenci başarıyla eklendi!\n\nGiriş Şifresi: 123456\nÖğrencinize bu şifreyi iletebilirsiniz.");
    } catch (err) { 
      if (err.code === 'auth/email-already-in-use') {
         alert("Bu e-posta adresiyle sistemde zaten bir kayıt mevcut!");
      } else {
         alert(err.message); 
      }
    }
  };

  const handleResetPassword = async (email) => {
    if (!window.confirm(`${email} adresine şifre sıfırlama e-postası gönderilsin mi?`)) return;
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Sıfırlama bağlantısı başarıyla gönderildi!');
    } catch (err) {
      toast.error('Hata: ' + err.message);
    }
  };

  const filtered = students.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-400 font-medium text-sm animate-pulse">
       Öğrenciler yükleniyor...
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20 pt-4 md:pt-6">
      
      {/* 1. HEADER & SEARCH AREA */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2 flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-600" /> Öğrenci Kadronuz
           </h1>
           <p className="text-slate-600 text-sm font-medium">Tüm öğrencilerinizin gelişimini ve çalışma durumlarını buradan kontrol edin.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Öğrenci ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-indigo-600 transition-colors shadow-sm"
              />
           </div>
           <button onClick={() => setShowAddForm(!showAddForm)} className={clsx("px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap", showAddForm ? "bg-slate-100 text-slate-900 hover:bg-slate-200" : "bg-indigo-600 text-white hover:bg-indigo-700")}>
              {showAddForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />} {showAddForm ? 'İptal' : 'Yeni Öğrenci'}
           </button>
        </div>
      </header>

      {/* ÖĞRENCİ EKLEME FORMU */}
      {showAddForm && (
        <form onSubmit={handleAddStudent} className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-md animate-slide-up space-y-6">
           <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-slate-900">Sisteme Yeni Öğrenci Dahil Et</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">Öğrenci Ad Soyad *</label>
                 <input type="text" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none"/>
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">E-posta Adresi *</label>
                 <input type="email" required value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none"/>
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">Telefon Numarası</label>
                 <input type="tel" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none"/>
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">Veli Telefonu</label>
                 <input type="tel" value={newStudent.parentPhone} onChange={e => setNewStudent({...newStudent, parentPhone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none"/>
              </div>
              {/* Eğitim Seviyesi Seçimi */}
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">Eğitim Seviyesi *</label>
                 <select 
                    value={newStudent.educationLevel} 
                    onChange={e => {
                       const level = e.target.value;
                       setNewStudent({
                          ...newStudent, 
                          educationLevel: level,
                          grade: level === 'Ortaokul' ? '8' : (level === 'Mezun' ? 'Mezun' : '12'),
                          examField: level === 'Ortaokul' ? 'LGS' : 'SAYISAL',
                          universityGoal: level === 'Ortaokul' ? 'LİSELER (LGS)' : ''
                       });
                    }} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none appearance-none"
                 >
                    <option value="Ortaokul">Ortaokul (LGS)</option>
                    <option value="Lise">Lise (YKS)</option>
                    <option value="Mezun">Mezun (YKS)</option>
                 </select>
              </div>

              {/* Sınıf Seçimi */}
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sınıf</label>
                 <select disabled={newStudent.educationLevel === 'Mezun'} value={newStudent.grade} onChange={e => setNewStudent({...newStudent, grade: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none appearance-none disabled:opacity-50">
                    {newStudent.educationLevel === 'Ortaokul' ? (
                       <>
                          <option value="5">5. Sınıf</option>
                          <option value="6">6. Sınıf</option>
                          <option value="7">7. Sınıf</option>
                          <option value="8">8. Sınıf</option>
                       </>
                    ) : newStudent.educationLevel === 'Lise' ? (
                       <>
                          <option value="9">9. Sınıf</option>
                          <option value="10">10. Sınıf</option>
                          <option value="11">11. Sınıf</option>
                          <option value="12">12. Sınıf</option>
                       </>
                    ) : (
                       <option value="Mezun">Mezun</option>
                    )}
                 </select>
              </div>

              {/* Alan Seçimi */}
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alan</label>
                 <select disabled={newStudent.educationLevel === 'Ortaokul'} value={newStudent.examField} onChange={e => setNewStudent({...newStudent, examField: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none appearance-none disabled:opacity-50">
                    {newStudent.educationLevel === 'Ortaokul' ? (
                       <option value="LGS">LGS</option>
                    ) : (
                       <>
                          <option value="SAYISAL">Sayısal</option>
                          <option value="EŞİT AĞIRLIK">Eşit Ağırlık</option>
                          <option value="SÖZEL">Sözel</option>
                          <option value="YABANCI DİL">Yabancı Dil</option>
                       </>
                    )}
                 </select>
              </div>

              {/* Hedef Üniversite / Lise */}
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {newStudent.educationLevel === 'Ortaokul' ? 'Hedef Lise Türü' : 'Hedef Üniversite'}
                 </label>
                 <select disabled={newStudent.educationLevel === 'Ortaokul'} value={newStudent.universityGoal} onChange={e => setNewStudent({...newStudent, universityGoal: e.target.value, departmentGoal: ''})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none appearance-none disabled:opacity-50">
                    {newStudent.educationLevel === 'Ortaokul' ? (
                       <option value="LİSELER (LGS)">LİSELER (LGS)</option>
                    ) : (
                       <>
                          <option value="">Üniversite Seçin...</option>
                          {Object.keys(UNIVERSITIES).filter(u => u !== 'LİSELER (LGS)').map(uni => (
                             <option key={uni} value={uni}>{uni}</option>
                          ))}
                       </>
                    )}
                 </select>
              </div>

              {/* Hedef Bölüm / Lise Tipi */}
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {newStudent.educationLevel === 'Ortaokul' ? 'Hedef Okul Adı (Veya Türü)' : 'Hedef Bölüm'}
                 </label>
                 <select value={newStudent.departmentGoal} onChange={e => setNewStudent({...newStudent, departmentGoal: e.target.value})} disabled={!newStudent.universityGoal} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none appearance-none disabled:opacity-50">
                    <option value="">Seçiniz...</option>
                    {newStudent.universityGoal && UNIVERSITIES[newStudent.universityGoal].map(dep => (
                       <option key={dep} value={dep}>{dep}</option>
                    ))}
                 </select>
              </div>
              
              {newStudent.universityGoal === 'Diğer / Hedefsiz' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-indigo-600 mb-1.5">Manuel Hedef Adı</label>
                    <input type="text" placeholder="Örn: X Okulu" value={newStudent.customUniversity || ''} onChange={e => setNewStudent({...newStudent, customUniversity: e.target.value})} className="w-full bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-600 mb-1.5">Manuel Hedef Türü</label>
                    <input type="text" placeholder="Örn: Y Bölümü/Türü" value={newStudent.customDepartment || ''} onChange={e => setNewStudent({...newStudent, customDepartment: e.target.value})} className="w-full bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none"/>
                  </div>
                </>
              )}
              
              <div>
                 <label className="block text-xs font-semibold text-slate-600 mb-1.5">Aylık Ücret (₺)</label>
                 <input type="number" value={newStudent.fee} onChange={e => setNewStudent({...newStudent, fee: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 outline-none"/>
              </div>
           </div>
           <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm">Öğrenciyi Sisteme Ekle</button>
        </form>
      )}

      {/* STUDENT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(student => (
          <div key={student.id} onClick={() => navigate(`/coach/students/${student.id}`)} className="bg-white border border-slate-200 p-6 rounded-2xl group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all relative">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 font-semibold text-lg group-hover:bg-indigo-50 transition-colors shrink-0">
                   {(student.name || student.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                   <div className="text-base font-semibold text-slate-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">{student.name || student.email || 'İsimsiz Öğrenci'}</div>
                   <div className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {student.universityGoal || 'Üniversite'} - {student.departmentGoal || 'Bölüm'}
                   </div>
                </div>
             </div>
             
             {/* Canlı Çalışma Durumu */}
             <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-5">
                <div className="flex items-center justify-between mb-1.5">
                   <p className="text-xs font-semibold text-slate-600">Güncel Durum</p>
                   {(student.currentStatus?.isStudying || student.isStudying) && (
                     <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   )}
                </div>
                <div className="text-sm font-medium text-slate-900">
                    {(student.currentStatus?.isStudying || student.isStudying) ? (
                      <span className="text-emerald-600 flex items-center gap-1.5">
                         <Clock className="w-3.5 h-3.5" /> 
                         <span className="truncate">
                           {student.currentStatus?.subject || student.currentSubject || student.subject || 'Ders'} Çalışıyor
                         </span>
                      </span>
                    ) : (
                     <span className="text-slate-500">Mola / Çevrimdışı</span>
                   )}
                </div>
             </div>
             
             <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-slate-400" />
                   <span className="text-xs font-semibold text-slate-500">İlerlemeyi Gör</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
             </div>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl border-dashed">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Öğrenci bulunamadı.</p>
           </div>
        )}
      </div>

      {/* ALT DETAY ALANLARI (İletişim, Ödeme, Giriş Bilgileri) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
         {/* İletişim & Ödeme Takibi */}
         <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
               <Wallet className="w-5 h-5 text-emerald-500" /> İletişim ve Finansal Durum
            </h3>
            <div className="space-y-3">
               {filtered.slice(0, 10).map(s => (
                 <div key={s.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100 transition-colors">
                    <div>
                       <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                       <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5"><Phone className="w-3 h-3"/> {s.phone || '05xx --- -- --'}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-bold text-slate-900">{s.fee ? `${s.fee}₺` : '—'}</div>
                       <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{s.paymentStatus || 'Bekliyor'}</div>
                    </div>
                 </div>
               ))}
               {filtered.length === 0 && <div className="text-center text-slate-400 text-sm py-4">Kayıt yok.</div>}
            </div>
         </div>

         {/* Otomatik Giriş Bilgileri */}
         <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
               <Key className="w-5 h-5 text-indigo-500" /> Hesap ve Giriş Bilgileri
            </h3>
            <div className="space-y-3">
               {filtered.slice(0, 10).map(s => (
                 <div key={s.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100 transition-colors">
                    <div className="min-w-0 pr-4">
                       <div className="text-sm font-semibold text-slate-900 mb-0.5 truncate">{s.name}</div>
                       <div className="text-xs text-slate-500 flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 shrink-0"/> {s.email}</div>
                    </div>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleResetPassword(s.email); }} 
                          className="text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all border border-emerald-100 shrink-0 uppercase tracking-widest"
                        >
                           Şifre Sıfırla
                        </button>
                        <button onClick={() => navigate(`/coach/students/${s.id}`)} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all border border-indigo-100 shrink-0 uppercase tracking-widest">
                           Yönet
                        </button>
                     </div>
                 </div>
               ))}
               {filtered.length === 0 && <div className="text-center text-slate-400 text-sm py-4">Kayıt yok.</div>}
            </div>
         </div>
      </div>

    </div>
  );
}
