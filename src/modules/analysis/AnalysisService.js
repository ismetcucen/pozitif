import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

class AnalysisService {
  /**
   * Deneme sınavı verilerini AI ile analiz eder.
   */
  async analyzeExam(studentId, examData) {
    console.log('[Analysis] Sending exam data to AnalystAI...');
    // In real app, this would send image/PDF to Gemini
    return {
      net: examData.correct - (examData.incorrect * 0.25),
      topicsToFocus: ['Üslü Sayılar', 'Elektrostatik'],
      improvementRate: '+15%',
      performanceScore: 82
    };
  }

  /**
   * Öğrencinin gelişim verilerini (grafik için) getirir.
   */
  async getGrowthData(studentId) {
    const q = query(
      collection(db, 'exams'),
      where('studentId', '==', studentId),
      orderBy('date', 'asc'),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
      date: doc.data().date,
      net: doc.data().net
    }));
  }

  /**
   * Riskli öğrencileri tespit eder (Koç için).
   */
  async detectRiskStudents(coachId) {
    // Logic to find students with declining performance
    return [];
  }
}

export const analysisService = new AnalysisService();
