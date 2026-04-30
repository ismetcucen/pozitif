import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  TrendingUp, Calendar, CheckCircle2, 
  ShieldCheck, Clock, FileText, Plus, AlertCircle
} from 'lucide-react';
import { db } from '../../firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import AnalysisDashboard from './AnalysisDashboard';

export default function ParentView() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [plans, setPlans] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    // Öğrenci bilgileri
    const unsubStudent = onSnapshot(doc(db, 'students', studentId), (d) => {
      if (d.exists()) setStudent(d.data());
      setLoading(false);
    });

    // Haftalık planlar
    const unsubPlans = onSnapshot(
      query(collection(db, 'weeklyPlans'), where('studentId', '==', studentId)),
      (snap) => setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    // Görevler
    const unsubTasks = onSnapshot(
      query(collection(db, 'tasks'), where('studentId', '==', studentId)),
      (snap) => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => { unsubStudent(); unsubPlans(); unsubTasks(); };
  }, [studentId]);

  // Gerçek istatistikler
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const weekDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-textSecondary">Veli paneli yükleniyor...</p>
      </div>
    </div>
  );

  if (!student) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-sm font-medium text-textSecondary">Öğrenci bulunamadı.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-textPrimary">
      {/* ── HEADER ─────────────────────────────── */}
      <header className="bg-white border-b border-borderLight shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
              <Plus className="w-6 h-6 text-white" strokeWidth={3} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <ShieldCheck className="text-emerald-500 w-4 h-4" />
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Güvenli Veli Erişimi</span>
              </div>
              <h1 className="text-xl font-bold text-textPrimary tracking-tight">
                {student.name} — <span className="text-secondary">Gelişim Raporu</span>
              </h1>
              <p className="text-xs text-textSecondary mt-0.5">Koçluk süreci şeffaf bir şekilde takibinizdedir.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-textSecondary bg-section border border-borderLight px-4 py-2 rounded-xl">
            <Clock className="w-3.5 h-3.5" />
            <span>Koç: <strong className="text-textPrimary">{student.coachName || 'Atanmamış'}</strong></span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* ── ÖZET KARTLAR — GERÇEK VERİ ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-borderLight shadow-sm border-l-4 border-l-secondary">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide">Görev Tamamlama</p>
            </div>
            <p className="text-3xl font-black text-textPrimary">
              {completedTasks}<span className="text-lg text-textSecondary font-medium">/{totalTasks}</span>
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-textSecondary mb-1">
                <span>Tamamlanan</span>
                <span className="font-bold text-secondary">%{taskRate}</span>
              </div>
              <div className="h-1.5 bg-section rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: `${taskRate}%` }} />
              </div>
            </div>
            {totalTasks === 0 && <p className="text-xs text-textSecondary mt-2 italic">Henüz görev atanmamış.</p>}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-borderLight shadow-sm border-l-4 border-l-emerald-400">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide">Haftalık Program</p>
            </div>
            <p className="text-3xl font-black text-textPrimary">{plans.length}</p>
            <p className="text-xs text-textSecondary mt-2">
              {plans.length > 0 ? `${plans.length} program girişi mevcut.` : 'Henüz program atanmamış.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-borderLight shadow-sm border-l-4 border-l-blue-400">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <p className="text-xs font-semibold text-textSecondary uppercase tracking-wide">Eğitim Seviyesi</p>
            </div>
            <p className="text-xl font-black text-textPrimary">{student.educationLevel || '—'}</p>
            <p className="text-xs text-textSecondary mt-2">
              {student.grade ? `${student.grade}. Sınıf` : ''} 
              {student.examField ? ` · ${student.examField}` : ''}
            </p>
            {student.target?.university && (
              <p className="text-xs text-secondary font-semibold mt-1">🎯 {student.target.university}</p>
            )}
          </div>
        </div>

        {/* ── AKADEMİK GELİŞİM GRAFİĞİ ─── */}
        <section className="bg-white rounded-2xl border border-borderLight shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-secondary w-5 h-5" />
            <h2 className="text-lg font-bold text-textPrimary">Akademik Gelişim Grafikleri</h2>
          </div>
          <AnalysisDashboard studentId={studentId} />
        </section>

        {/* ── HAFTALIK PROGRAM ─────────────────── */}
        <section className="bg-white rounded-2xl border border-borderLight shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-secondary w-5 h-5" />
            <h2 className="text-lg font-bold text-textPrimary">Haftalık Program Özeti</h2>
          </div>
          {plans.length === 0 ? (
            <p className="text-sm text-textSecondary text-center py-8 italic">Henüz haftalık program atanmamış.</p>
          ) : (
            <div className="space-y-3">
              {weekDays.map(day => {
                const dayPlans = plans.filter(p => p.day === day);
                return (
                  <div key={day} className="flex items-center justify-between p-4 bg-section rounded-xl border border-borderLight">
                    <span className="font-medium text-textPrimary text-sm">{day}</span>
                    {dayPlans.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-textSecondary">
                          {dayPlans.map(p => p.subject).join(', ')}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    ) : (
                      <span className="text-xs text-textSecondary italic">Program yok</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── GÖREV LİSTESİ ─── */}
        {tasks.length > 0 && (
          <section className="bg-white rounded-2xl border border-borderLight shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="text-secondary w-5 h-5" />
              <h2 className="text-lg font-bold text-textPrimary">Görev Durumu</h2>
            </div>
            <div className="space-y-2">
              {tasks.slice(0, 10).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-section rounded-xl border border-borderLight">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-emerald-500' : 'border-2 border-borderLight'}`}>
                      {task.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${task.completed ? 'line-through text-textSecondary' : 'text-textPrimary'}`}>
                      {task.title}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${task.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {task.completed ? 'Tamamlandı' : 'Bekliyor'}
                  </span>
                </div>
              ))}
              {tasks.length > 10 && (
                <p className="text-xs text-textSecondary text-center pt-2">+{tasks.length - 10} görev daha...</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
