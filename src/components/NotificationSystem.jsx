/**
 * Bildirim Sistemi - Koçtan Öğrenciye Uygulama İçi Mesaj
 * Hem koç hem öğrenci panelinden import edilebilir.
 */
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, addDoc, updateDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Bell, Send, CheckCheck, X, MessageSquare, AlertCircle, Info, Trophy } from 'lucide-react';

const NOTIF_TYPES = [
  { value: 'info',    label: 'Bilgi', icon: Info,        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { value: 'warning', label: 'Uyarı', icon: AlertCircle, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { value: 'success', label: 'Başarı', icon: Trophy,     color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  { value: 'message', label: 'Mesaj', icon: MessageSquare, color: 'text-primary bg-primary/10 border-primary/30' },
];

// Koç paneli bileşeni - öğrenciye mesaj gönder
export function CoachNotificationSender({ students, coachId }) {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !message.trim()) return;
    setLoading(true);
    try {
      const student = students.find(s => s.id === selectedStudent);
      await addDoc(collection(db, 'notifications'), {
        toStudentId: selectedStudent,
        toStudentName: student?.name || '',
        fromCoachId: coachId,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      setMessage(''); setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  return (
    <div className="glass-panel p-6 border border-primary/20">
      <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" /> Öğrenciye Bildirim Gönder
      </h3>
      {sent && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-semibold flex items-center gap-2">
          <CheckCheck className="w-4 h-4" /> Bildirim başarıyla gönderildi!
        </div>
      )}
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm text-textMuted mb-1.5 font-medium">Öğrenci</label>
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
            className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white focus:border-primary focus:outline-none" required>
            <option value="">— Öğrenci Seçin —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-textMuted mb-1.5 font-medium">Bildirim Tipi</label>
          <div className="flex gap-2 flex-wrap">
            {NOTIF_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${type === t.value ? t.color : 'bg-surface/50 border-border/40 text-textMuted'}`}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-textMuted mb-1.5 font-medium">Mesaj</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
            placeholder="Harika çalışma! Bu hafta deneme netini artırmanı bekliyorum..."
            className="w-full bg-surface/50 border border-border/50 rounded-xl p-3 text-white focus:border-primary focus:outline-none text-sm resize-none" required />
        </div>
        <button disabled={loading} type="submit"
          className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Bildirim Gönder</>}
        </button>
      </form>
    </div>
  );
}

// Öğrenci paneli bileşeni - bildirimleri listele
export function StudentNotifications({ studentId }) {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!studentId) return;
    let isInitialLoad = true;
    const q = query(collection(db, 'notifications'), where('toStudentId', '==', studentId));
    
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      if (!isInitialLoad && 'Notification' in window && Notification.permission === 'granted') {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newNotif = change.doc.data();
            if (!newNotif.isRead) {
              new Notification('PozitifKoç - Yeni Bildirim!', {
                body: newNotif.message,
                icon: '/icons/icon-192x192.png' // Assuming you have a standard PWA icon
              });
            }
          }
        });
      }
      isInitialLoad = false;
      setNotifications(data);
    });
  }, [studentId]);

  const unread = notifications.filter(n => !n.isRead).length;

  const markRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  };
  const markAllRead = () => {
    notifications.filter(n => !n.isRead).forEach(n => markRead(n.id));
  };

  return (
    <div className="relative">
      {/* BELL BUTTON */}
      <button onClick={() => { setShow(!show); if (!show) markAllRead(); }}
        className="relative p-2.5 rounded-xl bg-surface/60 border border-border/40 hover:border-primary/40 transition-all">
        <Bell className={`w-5 h-5 ${unread > 0 ? 'text-primary' : 'text-textMuted'}`} />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {show && (
        <div className="absolute right-0 top-12 w-80 glass-panel border border-border/40 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border/30 flex items-center justify-between">
            <h4 className="font-bold text-white">Bildirimler</h4>
            <button onClick={() => setShow(false)} className="text-textMuted hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-textMuted text-sm text-center py-8">Henüz bildirim yok.</p>
            ) : (
              notifications.map(n => {
                const t = NOTIF_TYPES.find(t => t.value === n.type) || NOTIF_TYPES[0];
                return (
                  <div key={n.id} className={`p-4 border-b border-border/20 flex gap-3 transition-all ${n.isRead ? 'opacity-60' : 'bg-primary/5'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.color}`}>
                      <t.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm leading-relaxed">{n.message}</p>
                      <p className="text-xs text-textMuted mt-1">
                        {new Date(n.createdAt).toLocaleDateString('tr-TR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
