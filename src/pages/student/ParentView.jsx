import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where, doc, getDoc } from 'firebase/firestore';
import { BarChart2, BookOpen, CheckSquare, Clock, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export default function ParentView() {
  const { currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    getDoc(doc(db, 'students', uid)).then(snap => {
      if (snap.exists()) setStudent({ id: snap.id, ...snap.data() });
    });

    const q1 = query(collection(db, 'exams'), where('studentId', '==', uid));
    const u1 = onSnapshot(q1, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
      setExams(data);
    });

    const q2 = query(collection(db, 'tasks'), where('studentId', '==', uid));
    const u2 = onSnapshot(q2, snap => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const q3 = query(collection(db, 'studySessions'), where('studentId', '==', uid));
    const u3 = onSnapshot(q3, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a,b) => new Date(b.startedAt) - new Date(a.startedAt));
      setSessions(data.slice(0, 10));
    });

    return () => { u1(); u2(); u3(); };
  }, [currentUser]);

  const chartData = exams.slice(-10).map((ex, i) => ({
    name: ex.name?.slice(0, 10) || `#${i+1}`,
    net: parseFloat(ex.net) || 0
  }));

  const completedTasks = tasks.filter(t => t.done).length;
  const totalStudyMin = sessions.reduce((s, sess) => s + (sess.durationSeconds || 0) / 60, 0);

  if (!student) return (
    <div className="flex items-center justify-center min-h-[60vh] animate-pulse text-primary font-black uppercase tracking-widest italic font-black uppercase tracking-widest italic italic">Yükleniyor...</div>
  );

  return (
    <div className="space-y-10 animate-slide-up pb-20 text-left">
      {/* HEADER KARTI */}
      <div className="bg-white p-10 rounded-[3rem] border border-border shadow-xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-20 h-20 rounded-[2rem] bg-primary flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-primary/30 italic uppercase border-4 border-white">
            {student.name?.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-black text-text italic tracking-tighter uppercase leading-tight">{student.name}</h2>
            <p className="text-textMuted mt-1 text-lg font-medium opacity-60">Hedef Üniversite: <span className="text-primary font-black italic">{student.target || 'Belirlenmedi'}</span></p>
            <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
              <span className={clsx("px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border italic", 
                student.isStudying ? 'bg-green-50 text-green-600 border-green-200 animate-pulse' : 'bg-slate-50 text-textMuted border-border')}>
                {student.isStudying ? '🟢 Masada : Çalışıyor' : '🔘 Çevrimdışı'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ÖZET İSTATİSTİKLER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Toplam Deneme', value: exams.length, icon: BarChart2, color: 'text-primary bg-primary/10 border-primary/20' },
          { label: 'Son Net', value: exams.length > 0 ? `${exams[exams.length-1].net}` : '—', icon: Trophy, color: 'text-secondary bg-secondary/10 border-secondary/20' },
          { label: 'Görev Başarı', value: `${completedTasks}/${tasks.length}`, icon: CheckSquare, color: 'text-green-600 bg-green-50 border-green-200' },
          { label: 'Efor (Dk)', value: `${Math.round(totalStudyMin)}`, icon: Clock, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
        ].map(card => (
          <div key={card.label} className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all group text-center">
            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6 border shadow-inner group-hover:scale-110 transition-transform", card.color)}>
              <card.icon className="w-7 h-7" />
            </div>
            <div className="text-3xl font-black text-text italic tracking-tighter mb-1">{card.value}</div>
            <div className="text-[10px] text-textMuted font-black uppercase tracking-widest italic opacity-50">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ANALİZ VE LİSTE BÖLÜMÜ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* NET GRAFİĞİ */}
         <div className="bg-white p-10 rounded-[3rem] border border-border shadow-sm">
            <h3 className="text-xl font-black mb-10 flex items-center gap-4 text-text uppercase tracking-tighter italic border-b border-border pb-6"><BarChart2 className="w-7 h-7 text-primary" /> Akademik Gelişim Eğrisi</h3>
            {chartData.length < 2 ? (
              <div className="text-center py-24 border border-dashed border-border rounded-[3rem] bg-slate-50 italic text-textMuted opacity-40">Grafik için veri bekleniyor...</div>
            ) : (
              <div className="h-[300px] w-full pr-6 italic">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1.5rem', fontWeight: 800, fontSize: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={5} dot={{ fill: '#6366f1', r: 6, strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
         </div>

         {/* SON DENEMELER LİSTESİ */}
         <div className="bg-white p-10 rounded-[3rem] border border-border shadow-sm">
            <h3 className="text-xl font-black mb-10 flex items-center gap-4 text-text uppercase tracking-tighter italic border-b border-border pb-6"><BookOpen className="w-7 h-7 text-secondary" /> Son Sınav Sonuçları</h3>
            {exams.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-border rounded-[3rem] bg-slate-50 italic text-textMuted opacity-40">Kayıtlı deneme bulunmuyor.</div>
            ) : (
              <div className="space-y-4">
                {[...exams].reverse().slice(0, 5).map(ex => (
                  <div key={ex.id} className="flex items-center justify-between p-6 bg-slate-50 hover:bg-white rounded-[2rem] border border-border hover:shadow-xl transition-all">
                    <div className="text-left">
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest italic">{ex.type} DENEMESİ</span>
                      <div className="text-xl font-black text-text italic tracking-tighter uppercase mt-3">{ex.name}</div>
                      <div className="text-[10px] text-textMuted font-black uppercase mt-1 opacity-50">{new Date(ex.createdAt).toLocaleDateString('tr-TR')}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-3xl font-black text-secondary italic tracking-tighter">{ex.net} <span className="text-sm opacity-40">NET</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
