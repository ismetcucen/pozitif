import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Zap, Target, X, Check } from 'lucide-react';
import { notificationService } from '../modules/notifications/NotificationService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = notificationService.listenToNotifications(currentUser.uid, setNotifications);
    return () => unsub();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4 text-primary" />;
      case 'xp': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'session': return <Target className="w-4 h-4 text-emerald-400" />;
      default: return <Bell className="w-4 h-4 text-text-muted" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-glass border border-glass-border rounded-xl hover:bg-glass-border transition-all relative group"
      >
        <Bell className={clsx("w-5 h-5 text-text-muted group-hover:text-white", unreadCount > 0 && "animate-tada")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-80 glass-card z-50 animate-scale-in origin-top-right overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-glass-border flex justify-between items-center bg-glass/50">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Bildirimler</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => notificationService.markAllAsRead(notifications)}
                  className="text-[10px] font-bold text-primary hover:underline"
                >
                  Tümünü Oku
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center space-y-3 opacity-50">
                  <Bell className="w-8 h-8 mx-auto text-text-muted" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Henüz bildirim yok</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => notificationService.markAsRead(n.id)}
                    className={clsx(
                      "p-4 border-b border-glass-border hover:bg-glass transition-colors cursor-pointer relative group",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(n.type)}</div>
                      <div className="flex-1">
                        <p className={clsx("text-xs font-bold leading-tight", !n.read ? "text-white" : "text-text-muted")}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                          {n.body}
                        </p>
                        <p className="text-[8px] font-black text-text-muted uppercase mt-2">
                          {n.createdAt ? format(n.createdAt.toDate(), 'dd MMM, HH:mm') : '...'}
                        </p>
                      </div>
                      {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1 shrink-0" />}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 bg-glass/30 text-center">
              <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all">
                Tümünü Gör
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
