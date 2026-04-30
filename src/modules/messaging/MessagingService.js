import { db } from '../../firebase';
import { 
  collection, addDoc, query, where, orderBy, 
  onSnapshot, limit, serverTimestamp, getDocs 
} from 'firebase/firestore';
import { notificationService } from '../notifications/NotificationService';

class MessagingService {
  /**
   * Belirli bir oda (studentId_coachId) için mesajları dinler.
   */
  listenToMessages(studentId, coachId, callback, onError) {
    // orderBy kaldırıldı → composite index gerekmez, JS tarafında sıralıyoruz
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', studentId),
      limit(200)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(msg => msg.participants?.includes(coachId))
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? 0;
            const tb = b.createdAt?.toMillis?.() ?? 0;
            return ta - tb;
          });
        callback(messages);
      },
      (error) => {
        console.error('[MessagingService] onSnapshot error:', error);
        if (onError) onError(error);
        // index hatası gibi durumlarda boş array ile devam et
        callback([]);
      }
    );
  }

  /**
   * Mesaj gönderir.
   */
  async sendMessage(senderId, receiverId, text) {
    if (!text.trim()) return;

    await addDoc(collection(db, 'messages'), {
      senderId,
      receiverId,
      text,
      participants: [senderId, receiverId],
      createdAt: serverTimestamp(),
      read: false
    });

    // Send Notification
    await notificationService.sendNotification(
      receiverId,
      'Yeni Mesaj',
      text.length > 50 ? text.substring(0, 50) + '...' : text,
      'message'
    );
  }

  /**
   * 6 aylık mesaj geçmişini temizler/getirir (SaaS kuralı).
   */
  async getChatHistory(studentId, coachId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', studentId),
      where('createdAt', '>=', sixMonthsAgo),
      orderBy('createdAt', 'asc')
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  }
}

export const messagingService = new MessagingService();
