import { db } from '../../firebase';
import { 
  collection, addDoc, query, where, orderBy, 
  onSnapshot, serverTimestamp, updateDoc, doc, limit 
} from 'firebase/firestore';

class NotificationService {
  /**
   * Kullanıcı için bildirimleri dinler.
   */
  listenToNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('toUid', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });
  }

  /**
   * Bildirim gönderir.
   */
  async sendNotification(toUid, title, body, type = 'system') {
    await addDoc(collection(db, 'notifications'), {
      toUid,
      title,
      body,
      type,
      read: false,
      createdAt: serverTimestamp()
    });
  }

  /**
   * Bildirimi okundu olarak işaretler.
   */
  async markAsRead(notificationId) {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
  }

  /**
   * Tüm bildirimleri okundu işaretler.
   */
  async markAllAsRead(notifications) {
    for (const n of notifications) {
      if (!n.read) await this.markAsRead(n.id);
    }
  }
}

export const notificationService = new NotificationService();
