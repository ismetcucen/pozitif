import { db } from '../../firebase';
import { doc, updateDoc, increment, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { EventBus } from '../../core/events/EventBus';

class GamificationService {
  constructor() {
    this.LEVEL_XP_BASE = 1000;
  }

  /**
   * XP Ekler ve Seviye Kontrolü Yapar
   */
  async addXP(studentId, amount, reason = 'Çalışma Tamamlandı') {
    const studentRef = doc(db, 'students', studentId);
    const snap = await getDoc(studentRef);
    
    if (!snap.exists()) return;

    const currentXP = (snap.data().xp || 0) + amount;
    const currentLevel = snap.data().level || 1;
    const nextLevelXP = currentLevel * this.LEVEL_XP_BASE;

    let newLevel = currentLevel;
    if (currentXP >= nextLevelXP) {
      newLevel += 1;
      EventBus.publish('LEVEL_UP', { studentId, newLevel });
    }

    await updateDoc(studentRef, {
      xp: currentXP,
      level: newLevel,
      lastXPGainReason: reason,
      updatedAt: new Date()
    });
  }

  /**
   * Rozet (Badge) Verir
   */
  async awardBadge(studentId, badgeId) {
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, {
      badges: arrayUnion({
        id: badgeId,
        awardedAt: new Date()
      })
    });
    EventBus.publish('BADGE_AWARDED', { studentId, badgeId });
  }

  /**
   * Çalışma seansına göre XP hesaplar
   */
  calculateSessionXP(durationMinutes) {
    // 1 dakika = 10 XP
    return durationMinutes * 10;
  }
}

export const gamificationService = new GamificationService();
