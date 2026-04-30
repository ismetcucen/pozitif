import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Target, MessageSquare, Search, ArrowUpRight, Zap, GraduationCap } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import clsx from 'clsx';

export default function CoachDashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [activeStudents, setActiveStudents] = useState(0);

  // Dynamic calculations instead of hardcoded numbers
  const studentCount = students.length;
  const avgScore = studentCount > 0 ? 0 : 0; // Will be connected to real exam data later
  const avgQuestions = studentCount > 0 ? 0 : 0; // Will be connected to real task data later

  useEffect(() => {
    const fetchStudents = async () => {
      const { auth } = await import('../../firebase');
      const { doc, getDoc, collection, onSnapshot } = await import('firebase/firestore');
      
      if (!auth.currentUser) return;
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const isAdmin = ['admin', 'super_admin', 'kurucu'].includes(userData?.role);

      const q = isAdmin 
        ? collection(db, 'students') 
        : collection(db, 'students');

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (!isAdmin) {
          studentData = studentData.filter(s => 
            s.addedBy === auth.currentUser.uid || 
            s.coachId === auth.currentUser.uid
          );
        }

        setStudents(studentData);
        setActiveStudents(studentData.filter(s => s.currentStatus?.isStudying || s.isStudying || s.currentStatus?.isOnline).length);
      });

      return unsubscribe;
    };

    let unsub;
    fetchStudents().then(u => unsub = u);
    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <div className="p-8 space-y-8 animate-fade-in bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Genel Bakış</h1>
          <p className="text-gray-500 text-sm mt-1">Öğrencilerinin gelişimini canlı takip et.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-3 shadow-sm">
             <Activity className="text-green-500 w-5 h-5 animate-pulse" />
             <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktif Çalışan</p>
                <p className="text-xl font-bold text-gray-900 leading-none mt-0.5">{activeStudents}</p>
             </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
             <span className="text-xs font-bold text-gray-400">Canlı</span>
          </div>
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Toplam Öğrenci</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{studentCount}</p>
        </div>
        
        {/* Average Score */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Target className="w-6 h-6" /></div>
          </div>
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Başarı Puanı (Ort)</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{avgScore}</p>
        </div>

        {/* Average Questions */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Zap className="w-6 h-6" /></div>
          </div>
          <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Haftalık Soru (Ort)</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{avgQuestions}</p>
        </div>
      </div>

      {/* Student List */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Öğrenci Listesi</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Öğrenci ara..." 
              className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Öğrenci</th>
                <th className="px-6 py-4">Durum</th>
                <th className="px-6 py-4">Hedef</th>
                <th className="px-6 py-4">Performans</th>
                <th className="px-6 py-4">Ödeme</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                     <GraduationCap className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                     Sistemde henüz aktif öğrenci bulunmuyor.
                   </td>
                 </tr>
              ) : students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 shadow-sm">
                        {student.name?.[0] || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.grade}. Sınıf</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.currentStatus?.isStudying || student.isStudying ? (
                      <div className="space-y-1">
                        <span className={clsx(
                          "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest animate-pulse",
                          student.currentStatus?.timerMode === 'break' ? "text-amber-500" : "text-emerald-600"
                        )}>
                          <div className={clsx("w-1.5 h-1.5 rounded-full", student.currentStatus?.timerMode === 'break' ? "bg-amber-500" : "bg-emerald-500")} />
                          {student.currentStatus?.timerMode === 'break' ? '☕ MOLA VERİYOR' : `🎯 ODAKLANIYOR: ${student.currentStatus?.activityType || ''}`}
                        </span>
                        <p className="font-bold text-xs text-gray-900 truncate max-w-[150px]">
                          {student.currentStatus?.subject || student.currentSubject || 'Ders Belirtilmedi'}
                        </p>
                        <p className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">
                          {student.currentStatus?.topic || 'Genel Konu'}
                        </p>
                      </div>
                    ) : student.currentStatus?.isOnline ? (
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-blue-600 text-xs font-black uppercase tracking-widest">ÇEVRİMİÇİ</span>
                       </div>
                    ) : (
                      <span className="text-gray-400 text-xs font-semibold">Çevrimdışı</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-700">
                    {student.target?.university || 'Belirtilmedi'} <br />
                    <span className="text-[10px] text-gray-500">{student.target?.department || ''}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gray-900 h-full" style={{ width: '0%' }} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "text-xs font-bold px-3 py-1 rounded-full",
                      student.paymentStatus === 'paid' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {student.paymentStatus === 'paid' ? 'Ödendi' : 'Deneme'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/coach/students/${student.id}`)}
                      className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-all inline-flex items-center gap-2 text-sm font-medium text-gray-700 shadow-sm"
                    >
                      İncele <ArrowUpRight className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
