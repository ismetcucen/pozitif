import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Bot, MoreVertical, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { messagingService } from '../modules/messaging/MessagingService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import clsx from 'clsx';
import toast from 'react-hot-toast';

/**
 * Mesajlaşma bileşeni — Light theme, koç paneli ile uyumlu
 */
export default function Messaging({ receiverId, receiverName }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgError, setMsgError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!currentUser || !receiverId || receiverId === 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMsgError(null);

    const unsub = messagingService.listenToMessages(
      currentUser.uid,
      receiverId,
      (msgs) => {
        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        console.error('Messaging error:', err);
        setMsgError('Mesajlar yüklenemedi. Lütfen sayfayı yenileyin.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser?.uid, receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !currentUser || !receiverId) return;

    try {
      await messagingService.sendMessage(currentUser.uid, receiverId, text.trim());
      setText('');
    } catch(err) {
      toast.error('Mesaj gönderilemedi.');
      console.error(err);
    }
  };

  // Koç bağlantısı yoksa bilgi mesajı göster
  if (!receiverId || receiverId === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[450px] text-center space-y-4">
        <div className="w-14 h-14 bg-section rounded-2xl flex items-center justify-center">
          <MessageSquare className="w-7 h-7 text-textSecondary" />
        </div>
        <div>
          <h3 className="font-bold text-textPrimary">Henüz bir koçunuz yok</h3>
          <p className="text-sm text-textSecondary mt-1 leading-relaxed max-w-xs">
            Bir koçla bağlantı kurduğunuzda burada mesajlaşabileceksiniz.
          </p>
        </div>
        <button
          onClick={() => navigate('/student/coaches')}
          className="flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary/90 transition-colors shadow-sm shadow-secondary/20"
        >
          <Users className="w-4 h-4" /> Koç Dizinine Git
        </button>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-[550px] overflow-hidden rounded-2xl border border-borderLight shadow-sm bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-borderLight bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
            {(receiverName || 'K').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-textPrimary">{receiverName || 'Koç Paneli'}</h3>
            <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Aktif</p>
          </div>
        </div>
        <button className="p-2 hover:bg-section rounded-xl transition-colors">
          <MoreVertical className="w-4 h-4 text-textSecondary" />
        </button>
      </div>

      {/* Mesajlar */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar bg-background">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : msgError ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <p className="text-sm font-medium text-red-500">{msgError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-bold text-secondary underline"
            >Yenile</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-textSecondary space-y-3">
            <Bot className="w-10 h-10 opacity-30" />
            <p className="text-xs font-medium">Henüz mesaj yok. Sohbeti başlat!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const mine = msg.senderId === currentUser?.uid;
            return (
              <div key={msg.id || i} className={clsx('flex flex-col', mine ? 'items-end' : 'items-start')}>
                <div className={clsx(
                  'max-w-[78%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm',
                  mine
                    ? 'bg-secondary text-white rounded-tr-sm'
                    : 'bg-white border border-borderLight text-textPrimary rounded-tl-sm'
                )}>
                  {msg.text}
                </div>
                <span className="text-[9px] font-medium text-textSecondary mt-1 px-1">
                  {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-3 px-5 py-4 border-t border-borderLight bg-white shrink-0">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Bir şeyler yaz..."
          className="flex-1 bg-section border border-borderLight rounded-xl px-4 py-2.5 text-sm font-medium text-textPrimary focus:border-secondary focus:bg-white outline-none transition-all placeholder:text-textSecondary"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center hover:bg-secondary/90 active:scale-95 transition-all disabled:opacity-40 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
