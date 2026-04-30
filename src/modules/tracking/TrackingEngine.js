import { EventBus, EVENTS } from '../../core/events/EventBus';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc, setDoc } from 'firebase/firestore';

/**
 * PozitifKoç Real-Time Tracking Engine
 * Çalışma seanslarını yönetir ve event fırlatır.
 */
class TrackingEngine {
  constructor() {
    this.activeSession = null;
  }

  /**
   * Öğrencinin platformda aktif olup olmadığını günceller.
   */
  async updatePresence(studentId, isOnline = true) {
    if (!studentId) return;
    try {
      const studentRef = doc(db, 'students', studentId);
      await setDoc(studentRef, {
        currentStatus: {
          isOnline: isOnline,
          lastActiveAt: serverTimestamp()
        }
      }, { merge: true });
    } catch (err) {
      console.error("Presence update failed:", err);
    }
  }

  /**
   * Haftalık programa göre durumu senkronize eder.
   */
  async syncWithSchedule(studentId, plans) {
    if (!studentId || !plans || plans.length === 0 || this.activeSession) return;

    const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const now = new Date();
    const currentDay = DAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];
    const currentHour = now.getHours().toString().padStart(2, '0') + ':00';

    const currentPlan = plans.find(p => p.day === currentDay && p.time === currentHour);

    if (currentPlan) {
      const studentRef = doc(db, 'students', studentId);
      await setDoc(studentRef, {
        currentStatus: {
          isStudying: true,
          subject: currentPlan.subject,
          topic: currentPlan.topic,
          activityType: 'Otomatik Takip',
          isAutomatic: true,
          lastActiveAt: serverTimestamp()
        }
      }, { merge: true });
    }
  }

  /**
   * Çalışma seansını başlatır.
   */
  async startSession(studentId, subject, topic = '', activityType = 'Genel Çalışma', timerMode = 'focus', focusDuration = 25) {
    if (this.activeSession) {
      console.warn('Bir çalışma seansı zaten aktif!');
      return;
    }

    const startTime = new Date();
    this.activeSession = {
      studentId,
      subject,
      topic,
      activityType,
      timerMode,
      focusDuration,
      startTime,
      status: 'active'
    };

    // Firestore Sync - Daha güvenli setDoc + merge kullanımı
    const studentRef = doc(db, 'students', studentId);
    await setDoc(studentRef, {
      // Geriye dönük uyumluluk için top-level alanlar
      isStudying: true,
      currentSubject: subject,
      
      // Yeni standart yapı
      currentStatus: {
        isStudying: true,
        subject,
        topic,
        activityType,
        timerMode,
        focusDuration,
        startedAt: serverTimestamp()
      }
    }, { merge: true });

    EventBus.publish(EVENTS.STUDY_STARTED, this.activeSession);
    return this.activeSession;
  }

  /**
   * Sadece timer modunu (Odaklanma/Mola) günceller.
   */
  async updateTimerMode(studentId, timerMode) {
    if (this.activeSession) {
      this.activeSession.timerMode = timerMode;
    }
    const studentRef = doc(db, 'students', studentId);
    await setDoc(studentRef, {
      'currentStatus.timerMode': timerMode
    }, { merge: true });
  }

  /**
   * Çalışma seansını durdurur ve veriyi döndürür.
   */
  async stopSession() {
    if (!this.activeSession) return null;

    const studentId = this.activeSession.studentId;
    const sessionData = {
      ...this.activeSession,
      endTime: new Date(),
      duration: (new Date() - this.activeSession.startTime) / 60000 // Dakika
    };

    // Firestore Sync - DURUMU SIFIRLA
    const studentRef = doc(db, 'students', studentId);
    
    // İşlemleri paralel yapalım
    await Promise.all([
      setDoc(studentRef, {
        isStudying: false,
        currentStatus: {
          isStudying: false,
          subject: null,
          topic: null,
          activityType: null,
          timerMode: null,
          startedAt: null
        }
      }, { merge: true }),

      // Rapor koleksiyonuna kaydet
      addDoc(collection(db, 'studySessions'), {
        studentId: sessionData.studentId,
        subject: sessionData.subject,
        topic: sessionData.topic,
        activityType: sessionData.activityType,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        duration: Math.round(sessionData.duration),
        createdAt: serverTimestamp()
      })
    ]);

    EventBus.publish(EVENTS.STUDY_COMPLETED, sessionData);
    this.activeSession = null;
    return sessionData;
  }

  isStudying() {
    return !!this.activeSession;
  }
}

export const trackingEngine = new TrackingEngine();
