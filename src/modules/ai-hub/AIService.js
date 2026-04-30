import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * PozitifKoç Merkezi AI Servis Merkezi
 * Google Gemini AI Entegrasyonu ile canlandırılmıştır.
 */

class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_AI_API_KEY || null;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.isInitialized = !!this.apiKey;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebase');
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      
      if (settingsSnap.exists() && settingsSnap.data().geminiApiKey) {
        this.apiKey = settingsSnap.data().geminiApiKey;
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.isInitialized = true;
      }
    } catch (err) {
      console.error("[AIService] Initialization failed:", err);
    }
  }

  async getAIModel() {
    await this.initialize();
    if (!this.genAI) {
      console.warn("[AIService] Gemini API Key is missing. AI features are in mock mode.");
      return null;
    }
    return this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Kota Kontrolü: Öğrencinin günlük kullanım limitini denetler.
   */
  async checkLimit(userId, type, limit = 1) {
    const { doc, getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../../firebase');
    
    const usageRef = doc(db, 'aiUsage', `${userId}_${type}`);
    const usageSnap = await getDoc(usageRef);
    const today = new Date().toDateString();

    if (usageSnap.exists()) {
      const data = usageSnap.data();
      if (data.date === today && data.count >= limit) {
        throw new Error(`Günlük ${type === 'analysis' ? 'analiz' : 'soru'} limitiniz doldu.`);
      }
      
      // Update count or reset for new day
      const newCount = data.date === today ? data.count + 1 : 1;
      await setDoc(usageRef, { date: today, count: newCount, updatedAt: serverTimestamp() });
    } else {
      await setDoc(usageRef, { date: today, count: 1, updatedAt: serverTimestamp() });
    }
  }

  /**
   * Tutor AI: Öğrenciye özel konu özeti veya soru üretir.
   */
  async generateSummary(userId, topic) {
    try {
      await this.checkLimit(userId, 'tutor', 3);
      const model = await this.getAIModel();
      if (!model) {
        // MOCK AI FALLBACK
        return `Yapay Zeka (Tutor AI): ${topic} konusu üzerine yoğunlaşman harika! Bu konuda özellikle temel formülleri iyi oturtman ve geçmiş yılların çıkmış sorularına göz atman sana hız kazandıracaktır. Unutma, istikrar zekadan daha önemlidir!`;
      }
      
      const prompt = `Sen profesyonel bir eğitim koçusun. Öğrenci için "${topic}" konusu hakkında çok anlaşılır, maddeler halinde bir konu özeti ve o konuya dair en kritik 3 ipucunu içeren bir metin hazırla. Dilin motive edici ve akademik olsun.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error("[AI Hub Error]:", err);
      return err.message;
    }
  }

  /**
   * Quiz AI: Öğrenci için test soruları üretir.
   */
  async generateQuiz(userId, topic) {
    try {
      await this.checkLimit(userId, 'tutor', 3);
      const model = await this.getAIModel();
      if (!model) {
        // MOCK AI FALLBACK
        return `Yapay Zeka Quiz Motoru: API anahtarı tanımlanmadığı için "${topic}" konusu için canlı soru üretemiyorum ancak kütüphaneden bu konuya ait testleri çözerek eksiklerini görebilirsin.`;
      }
      
      const prompt = `Öğrenci için "${topic}" konusu hakkında 3 tane çoktan seçmeli (A, B, C, D şıkları olan) soru hazırla. Soruların sonunda doğru cevapları da belirt.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      return err.message;
    }
  }

  /**
   * Coach AI: Haftalık program önerir.
   */
  async getProgramSuggestion(studentProfile) {
    try {
      const model = await this.getAIModel();
      if (!model) {
        return {
          motivationMessage: `${studentProfile?.name || 'Öğrenci'} için Yapay Zeka strateji analizini tamamladı: Denemelerdeki ivmen takdire şayan! Ancak süre yönetimi konusunda biraz daha pratik yapman gerekiyor. Bol bol paragraf ve problem çözmeye devam et!`,
          suggestedTasks: []
        };
      }
      
      const prompt = `${studentProfile.name} isimli ${studentProfile.grade}. sınıf öğrencisi için haftalık bir ders çalışma stratejisi öner.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        motivationMessage: response.text().substring(0, 500),
        suggestedTasks: []
      };
    } catch (err) {
      return { motivationMessage: "Başarılar dilerim!", suggestedTasks: [] };
    }
  }

  /**
   * Analyst AI: Deneme sınavı verilerini yorumlar.
   */
  /**
   * Analyst AI: Deneme sınavı verilerini yorumlar.
   */
  async analyzePerformance(userId, stats) {
    try {
      await this.checkLimit(userId, 'analysis', 5);
      const model = await this.getAIModel();
      
      if (!model) {
        const avg = stats.length > 0 ? (stats.reduce((acc, curr) => acc + curr.net, 0) / stats.length).toFixed(1) : 0;
        const trend = stats.length > 1 ? (stats[stats.length - 1].net >= stats[stats.length - 2].net ? 'yükseliş' : 'düşüş') : 'nötr';
        const allWrongs = stats.map(s => s.wrongSubjects || []).flat();
        const wrongText = allWrongs.length > 0 ? ` Özellikle ${allWrongs.slice(-2).join(' ve ')} konularındaki eksiklerini kapatmalısın.` : '';

        return { 
          insight: `Sistem Analizi: Son ${stats.length} denemen incelendi. Ortalama netin ${avg}. Son denemelerde ${trend} trendi göze çarpıyor.${wrongText}`,
          score: avg > 70 ? 85 : 65,
          risk: trend === 'düşüş' ? 'Yüksek' : 'Düşük',
          badges: ['İstikrarlı', trend === 'yükseliş' ? 'Yükselen Yıldız' : 'Analitik']
        };
      }
      
      const allWrongsStr = stats.map(s => s.wrongSubjects?.join(', ') || '').join(' ');
      const prompt = `Öğrencinin son deneme netleri: ${JSON.stringify(stats)}. Hatalı yaptığı konular: ${allWrongsStr}. Bu netlere ve konulara göre öğrencinin performansını 1 paragrafta motive edici bir dille özetle ve spesifik olarak o konuları çalışmasını tavsiye et. Ayrıca JSON formatında dön: { "insight": "yorumun", "score": 100 üzerinden bir sayı, "risk": "Düşük/Orta/Yüksek", "badges": ["rozet1", "rozet2"] }`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      try {
        const textStr = response.text().replace(/```json/g, '').replace(/```/g, '');
        return JSON.parse(textStr);
      } catch(e) {
        return { insight: response.text(), score: 75, risk: 'Orta', badges: ['Çalışkan'] };
      }
    } catch (err) {
      return { insight: err.message, score: 0, risk: 'Bilinmiyor', badges: [] };
    }
  }

  /**
   * Multimodal Exam Analysis: PDF veya Görsel dosyayı analiz eder.
   */
  async analyzeExamFile(userId, fileBase64, mimeType) {
    try {
      await this.checkLimit(userId, 'analysis', 3);
      const model = await this.getAIModel();
      if (!model) throw new Error("AI Servisi başlatılamadı. API Anahtarını kontrol edin.");

      const prompt = `Sen bir YKS/LGS deneme sınavı analiz uzmanısın. Ekteki deneme cevap kağıdı veya sonuç belgesini analiz et.
      Lütfen şu bilgileri çıkar:
      1. GENEL SONUÇ: Toplam doğru, yanlış ve net.
      2. DERS BAZLI ANALİZ: Ders ders başarı durumları.
      3. KRİTİK EKSİKLER: En çok yanlış yapılan konular.
      4. STRATEJİ: Öğrenciye sonraki deneme için 3 somut tavsiye.
      Analizi profesyonel, motive edici ve yapılandırılmış bir şekilde Türkçe olarak yaz.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: fileBase64,
            mimeType: mimeType
          }
        }
      ]);

      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error("[AIService Multimodal Error]:", err);
      throw err;
    }
  }
}

export const aiHub = new AIService();
