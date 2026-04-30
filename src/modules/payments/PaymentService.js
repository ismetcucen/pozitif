import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * PozitifKoç Ödeme ve Abonelik Servisi
 */
class PaymentService {
  /**
   * Kullanıcının abonelik durumunu kontrol eder.
   */
  checkSubscriptionStatus(userData) {
    if (!userData) return { isExpired: false, daysLeft: 7 };
    if (userData.subscriptionStatus === 'active') return { isExpired: false, daysLeft: 365 };
    
    const start = new Date(userData.trialStartDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isExpired = diffDays > 7;
    return {
      isExpired,
      daysLeft: Math.max(0, 7 - diffDays),
      status: userData.subscriptionStatus
    };
  }

  /**
   * Ödeme tamamlandığında kullanıcıyı aktif eder.
   * Not: Gerçek API entegrasyonunda bu fonksiyon ödeme callback'inde çağrılmalıdır.
   */
  async activateSubscription(userId, role, planId) {
    const collection = role === 'student' ? 'students' : 'users';
    const userRef = doc(db, collection, userId);
    
    await updateDoc(userRef, {
      subscriptionStatus: 'active',
      planId: planId,
      paidAt: serverTimestamp(),
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 Günlük
    });
    
    return true;
  }
}

export const paymentService = new PaymentService();
