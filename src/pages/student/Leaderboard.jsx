import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Flame, Star, Zap, Medal } from 'lucide-react';
import clsx from 'clsx';

function calcXP(tasks, exams, sessions) {
  const taskXP   = tasks.filter(t => t.done).length * 50;
  const examXP   = exams.length * 100;
  const sessionXP = Math.floor(sessions.reduce((s, sess) => s + (sess.durationSeconds || 0), 0) / 60) * 2;
  return taskXP + examXP + sessionXP;
}

const RANK_BADGES = [
  { min: 2000, label: 'Efsane', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100 shadow-yellow-500/10', icon: '🏆' },
  { min: 1000, label: 'Usta',   color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100 shadow-purple-500/10', icon: '🫂' },
  { min: 500,  label: 'Kahraman', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100 shadow-blue-500/10', icon: '⚡' },
  { min: 200,  label: 'Azimli', color: 'text-green-600', bg: 'bg-green-50 border-green-100 shadow-green-500/10', icon: '🔥' },
  { min: 0,    label: 'Başlangıç', color: 'text-textMuted', bg: 'bg-slate-50 border-border shadow-slate-200/50', icon: '🌱' },
];

function getBadge(xp) { return RANK_BADGES.find(b => xp >= b.min); }

export default function Leaderboard() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [tasks, setTasks]     = useState([]);
  const [exams, setExams]     = useState([]);
  const [sessions, setSessions] = useState([]);
  const [myStudent, setMyStudent] = useState(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    import('firebase/firestore').then(({ getDoc, doc: firestoreDoc }) => {
      getDoc(firestoreDoc(db, 'students', currentUser.uid)).then(snap => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setMyStudent(data);
          const q = query(collection(db, 'students'), where('coachId', '==', data.coachId));
          onSnapshot(q, s => {
            setStudents(s.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
          });
        } else setLoading(false);
      });
    });

    const q1 = query(collection(db, 'tasks'), where('studentId', '==', currentUser.uid));
    onSnapshot(q1, s => setTasks(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    const q2 = query(collection(db, 'exams'), where('studentId', '==', currentUser.uid));
    onSnapshot(q2, s => setExams(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    const q3 = query(collection(db, 'studySessions'), where('studentId', '==', currentUser.uid));
    onSnapshot(q3, s => setSessions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [currentUser]);

  const ranked = students.map(st => {
    const stTasks    = tasks.filter(t => t.studentId === st.id);
    const stExams    = exams.filter(e => e.studentId === st.id);
    const stSessions = sessions.filter(s => s.studentId === st.id);
    const xp = calcXP(stTasks, stExams, stSessions);
    return { ...st, xp };
  }).sort((a, b) => b.xp - a.xp);

  const myXP     = calcXP(tasks, exams, sessions);
  const myRank   = ranked.findIndex(s => s.id === currentUser.uid) + 1;
  const myBadge  = getBadge(myXP);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] animate-pulse text-primary font-black uppercase tracking-widest italic">Yükleniyor...</div>
  );

  return (
    <div className="space-y-10 animate-slide-up pb-20 text-left">
      <header>
        <div className="flex items-center gap-4 mb-3">
           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
              <Trophy className="w-7 h-7" />
           </div>
           <h2 className="text-3xl font-black text-text tracking-tighter uppercase italic">Başarı Sıralaması</h2>
        </div>
        <p className="text-textMuted mt-2 text-lg font-medium pl-1 italic opacity-60">Görevleri tamamla, deneme ekle, çalış ve zirveye tırman! 🚀</p>
      </header>

      {/* KENDİ DURUM KARTIN */}
      <div className={clsx("bg-white p-10 rounded-[3rem] border-2 transition-all shadow-2xl shadow-slate-200/60 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden", myBadge?.bg)}>
        <div className="text-7xl drop-shadow-2xl animate-bounce mb-4 md:mb-0">{myBadge?.icon}</div>
        <div className="flex-1 text-center md:text-left">
          <div className="text-3xl font-black text-text italic tracking-tighter uppercase mb-1">{myStudent?.name || 'Profilin'}</div>
          <div className={clsx("text-sm font-black uppercase tracking-widest italic mb-6", myBadge?.color)}>{myBadge?.label} Seviye</div>
          
          <div className="flex items-end gap-5 mb-6 justify-center md:justify-start">
            <span className="text-5xl font-black text-text italic tracking-tighter shadow-sm">{myXP} <span className="text-sm text-textMuted opacity-40 uppercase no-italic">XP</span></span>
            {myRank > 0 && <span className="px-6 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 italic mb-2">#{myRank}. Sıra</span>}
          </div>

          <div className="w-full bg-white/50 border border-white h-4 rounded-full overflow-hidden shadow-inner flex items-center p-0.5">
            <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 rounded-full shadow-lg" style={{ width: `${Math.min(100, (myXP / 2000) * 100)}%` }} />
          </div>
          <div className="text-[9px] text-textMuted font-black uppercase tracking-widest mt-3 flex justify-between italic opacity-60">
            <span>Yolun Başı</span>
            <span>Efsane Hedefi: 2000 XP</span>
          </div>
        </div>

        <div className="text-right hidden xl:block bg-white/40 p-8 rounded-[2rem] border border-white shadow-sm">
          <p className="text-[10px] text-textMuted font-black uppercase tracking-widest mb-4 opacity-70 italic text-center">XP Kaynakların</p>
          <div className="space-y-3 font-bold italic">
            <div className="flex items-center gap-4 justify-between bg-white px-5 py-2 rounded-xl border border-border/40">
               <Zap className="w-4 h-4 text-yellow-500" />
               <span className="text-[10px] text-textMuted">GÖREV:</span>
               <span className="text-text font-black text-sm">+{tasks.filter(t=>t.done).length * 50}</span>
            </div>
            <div className="flex items-center gap-4 justify-between bg-white px-5 py-2 rounded-xl border border-border/40">
               <Star className="w-4 h-4 text-purple-500" />
               <span className="text-[10px] text-textMuted">DENEME:</span>
               <span className="text-text font-black text-sm">+{exams.length * 100}</span>
            </div>
            <div className="flex items-center gap-4 justify-between bg-white px-5 py-2 rounded-xl border border-border/40">
               <Flame className="w-4 h-4 text-secondary" />
               <span className="text-[10px] text-textMuted">SÜRE (DK):</span>
               <span className="text-text font-black text-sm">+{Math.floor(sessions.reduce((s,sess)=>s+(sess.durationSeconds||0),0)/60)*2}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SIRALAMA LİSTESİ */}
      <div className="bg-white p-10 rounded-[3rem] border border-border shadow-sm">
        <h3 className="text-xl font-black mb-10 border-b border-border pb-6 flex items-center justify-between uppercase italic tracking-tighter text-text">
           <div className="flex items-center gap-3">
              <Medal className="w-6 h-6 text-primary" /> Sınıf Sıralaması
           </div>
           <span className="text-[10px] font-black bg-slate-50 px-5 py-2 rounded-full text-textMuted opacity-60 tracking-widest">TOPLAM {ranked.length} ÖĞRENCİ</span>
        </h3>
        
        {ranked.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-[3rem] bg-slate-50 italic text-textMuted opacity-40">Veri henüz toplanıyor...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {ranked.map((st, i) => {
              const badge = getBadge(st.xp);
              const isMe  = st.id === currentUser.uid;
              const medals = ['🥇 Top Tier','🥈 Challenger','🥉 Pro Player'];
              const displayName = isMe ? st.name : st.name?.charAt(0) + '.' + st.name?.charAt(st.name.indexOf(' ')+1 || 1) + '.';
              
              return (
                <div key={st.id} className={clsx("p-8 rounded-[2.5rem] border transition-all flex flex-wrap items-center gap-8 group relative overflow-hidden", 
                   isMe ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10' : 'bg-slate-50 border-border hover:bg-white hover:shadow-2xl hover:border-primary/20')}>
                  
                  <div className="w-20 text-center flex flex-col items-center">
                    {i < 3 ? <span className="text-2xl drop-shadow-sm mb-1">{medals[i].split(' ')[0]}</span> : <span className="text-textMuted font-black text-xl italic opacity-40">#{i+1}</span>}
                    {i < 3 && <span className="text-[8px] font-black uppercase text-primary tracking-widest opacity-60">{medals[i].split(' ').slice(1).join(' ')}</span>}
                  </div>

                  <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-border shadow-sm flex items-center justify-center font-black text-2xl text-primary flex-shrink-0 italic uppercase group-hover:scale-110 transition-transform">
                    {st.name?.charAt(0)}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-black text-2xl text-text uppercase italic tracking-tighter mb-1 flex items-center gap-3">
                      {displayName} {isMe && <span className="text-[10px] no-italic text-white bg-primary px-3 py-1 rounded-full tracking-widest shadow-lg shadow-primary/30">BU SENSİN</span>}
                    </div>
                    <div className={clsx("text-[10px] font-black uppercase tracking-widest italic opacity-70 flex items-center gap-2", badge?.color)}>
                       {badge?.icon} {badge?.label} SEVİYE
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-black text-text italic tracking-tighter">{st.xp}</div>
                    <div className="text-[10px] font-black text-textMuted uppercase tracking-widest italic opacity-40">Toplam XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* XP KAZANMA REHBERİ */}
      <div className="bg-slate-50 p-12 rounded-[4rem] border border-border shadow-inner text-left">
        <h3 className="text-2xl font-black mb-10 italic uppercase tracking-tighter text-text border-b border-border/50 pb-6 opacity-60">⚡ XP Nasıl Kazanılır?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '✅', label: 'Görev Bitir', xp: '+50 XP', desc: 'Koçunun atadığı işleri zamanında tamamla.' },
            { icon: '📝', label: 'Deneme Gir', xp: '+100 XP', desc: 'Her yeni deneme sonucu bir başarıdır.' },
            { icon: '⏱️', label: 'Masada Kal', xp: '+2 XP / DK', desc: 'Kronometre açık kaldıkça puanın artar.' },
          ].map(item => (
            <div key={item.label} className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full" />
              <div className="text-5xl mb-6 group-hover:scale-125 transition-transform origin-left">{item.icon}</div>
              <div className="text-text font-black text-xl uppercase italic tracking-tighter mb-2">{item.label}</div>
              <p className="text-textMuted text-xs font-medium italic opacity-60 mb-6 leading-relaxed">{item.desc}</p>
              <div className="text-primary font-black text-3xl italic tracking-tighter">{item.xp}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
