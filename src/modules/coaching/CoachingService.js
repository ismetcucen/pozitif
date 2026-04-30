import { db } from '../../firebase';
import { doc, updateDoc, collection, addDoc, query, where, getDocs, setDoc } from 'firebase/firestore';

class CoachingService {
  /**
   * Öğrenci hedeflerini ve bilgilerini günceller.
   */
  async updateStudentGoals(studentId, goalData) {
    const studentRef = doc(db, 'students', studentId);
    await updateDoc(studentRef, {
      target: {
        university: goalData.university,
        department: goalData.department,
        goalRank: goalData.goalRank
      },
      grade: goalData.grade,
      field: goalData.field,
      updatedAt: new Date()
    });
  }

  /**
   * Öğrenciye haftalık program ekler/günceller.
   */
  async saveWeeklyPlan(studentId, weekNumber, days) {
    const planRef = doc(db, 'weeklyPlans', `${studentId}_w${weekNumber}`);
    await setDoc(planRef, {
      studentId,
      weekNumber,
      days,
      updatedAt: new Date()
    });
  }

  /**
   * Öğrenciye spesifik bir ders görevi ekler.
   */
  async addTaskToPlan(studentId, weekNumber, day, task) {
    const planRef = doc(db, 'weeklyPlans', `${studentId}_w${weekNumber}`);
    // In a real app, we'd use arrayUnion, but for simplicity we'll handle it via state
    console.log(`[Coaching] Adding task to ${day}:`, task);
  }

  /**
   * Kaynak (kitap/kanal) ekler.
   */
  async addResource(studentId, resource) {
    const studentRef = doc(db, 'students', studentId);
    // Logic to push to resources array
    console.log(`[Coaching] Adding resource for ${studentId}:`, resource);
  }

  /**
   * WhatsApp uyarısı gönderir.
   */
  sendWhatsAppWarning(coachPhone, studentName, topic) {
    const message = `Selam! Öğrencin ${studentName}, programındaki "${topic}" çalışmasına henüz başlamadı. Bir kontrol etmek ister misin?`;
    const url = `https://wa.me/${coachPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}

export const coachingService = new CoachingService();
