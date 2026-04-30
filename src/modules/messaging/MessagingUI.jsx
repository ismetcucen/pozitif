import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, Paperclip, MoreVertical, Search, Bot } from 'lucide-react';
import { messagingService } from '../../modules/messaging/MessagingService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function MessagingUI({ receiverId, receiverName }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser || !receiverId) return;

    const unsub = messagingService.listenToMessages(
      currentUser.uid, 
      receiverId, 
      (msgs) => setMessages(msgs)
    );

    return () => unsub();
  }, [currentUser, receiverId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      await messagingService.sendMessage(currentUser.uid, receiverId, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass-card overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <header className="p-4 border-b border-glass-border bg-glass/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient flex items-center justify-center font-black text-white">
            {receiverName?.[0] || 'K'}
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight">{receiverName || 'KOÇUM'}</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase animate-pulse">Çevrimiçi</p>
          </div>
        </div>
        <button className="p-2 hover:bg-glass rounded-lg transition-all">
          <MoreVertical className="w-5 h-5 text-text-muted" />
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-950/20">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Bot className="w-12 h-12 text-primary" />
            <p className="text-xs font-medium italic">Sohbeti başlatmak için bir mesaj gönder.</p>
          </div>
        )}
        
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUser?.uid;
          return (
            <div key={msg.id || i} className={clsx(
              "flex flex-col max-w-[80%] animate-slide-up",
              isMe ? "ml-auto items-end" : "mr-auto items-start"
            )}>
              <div className={clsx(
                "px-4 py-3 rounded-2xl text-sm font-medium shadow-lg",
                isMe ? "bg-primary text-white rounded-tr-none" : "bg-glass border border-glass-border text-white rounded-tl-none"
              )}>
                {msg.text}
              </div>
              <span className="text-[8px] font-black uppercase text-text-muted mt-1 px-1">
                {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
              </span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </main>

      {/* Message Input */}
      <footer className="p-4 bg-glass border-t border-glass-border">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <button type="button" className="p-3 hover:bg-glass rounded-xl text-text-muted transition-all">
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajını yaz..." 
            className="flex-1 bg-glass border border-glass-border rounded-xl px-6 py-3 text-sm focus:outline-none focus:border-primary transition-all"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-3 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
