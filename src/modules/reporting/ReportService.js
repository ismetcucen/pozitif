import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { aiHub } from '../ai-hub/AIService';

class ReportService {
  /**
   * Veli için haftalık gelişim raporu oluşturur.
   */
  async generateParentReport(studentData, weeklyStats) {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('tr-TR');

    // 1. Başlık ve Logo (Mock Logo)
    doc.setFillColor(31, 41, 55); // Dark Gray
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('PozitifKoç Gelişim Raporu', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Rapor Tarihi: ${today}`, 105, 30, { align: 'center' });

    // 2. Öğrenci Bilgileri
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Öğrenci Bilgileri', 14, 55);
    doc.setFontSize(10);
    doc.text(`Ad Soyad: ${studentData.name}`, 14, 65);
    doc.text(`Sınıf/Grup: ${studentData.grade || 'YKS'}`, 14, 72);
    doc.text(`Hedef: ${studentData.target || 'Belirtilmedi'}`, 14, 79);

    // 3. AI Değerlendirmesi (Önce Gemini'den alıyoruz)
    const prompt = `${studentData.name} isimli öğrencinin bu haftaki istatistikleri: ${JSON.stringify(weeklyStats)}. Bir eğitim koçu olarak veliye yönelik, nazik, profesyonel ve öğrencinin gelişimini özetleyen 3-4 cümlelik bir rapor yaz.`;
    
    let aiSummary = "Haftalık gelişim verileri AI tarafından analiz ediliyor...";
    try {
        const model = await aiHub.getAIModel();
        if (model) {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            aiSummary = response.text();
        } else {
            aiSummary = `${studentData.name} bu hafta planlanan görevlerin %${weeklyStats.completionRate || 0}'ini tamamladı. Deneme netlerinde istikrarlı bir grafik sergiliyor. Motivasyonunu koruması için desteklenmesi önerilir.`;
        }
    } catch (err) {
        aiSummary = "Haftalık veriler incelendiğinde öğrencinin istikrarlı çalıştığı gözlemlenmiştir.";
    }

    doc.setFontSize(12);
    doc.text('Koç/AI Notu', 14, 95);
    doc.setFontSize(9);
    const splitText = doc.splitTextToSize(aiSummary, 180);
    doc.text(splitText, 14, 105);

    // 4. İstatistik Tablosu
    doc.autoTable({
      startY: 130,
      head: [['Kategori', 'Hedef', 'Gerçekleşen', 'Durum']],
      body: [
        ['Soru Çözümü', weeklyStats.targetQuestions || 1000, weeklyStats.solvedQuestions || 0, weeklyStats.solvedQuestions >= (weeklyStats.targetQuestions || 1000) ? 'Başarılı' : 'Devam Ediyor'],
        ['Çalışma Süresi', `${weeklyStats.targetHours || 40} Saat`, `${weeklyStats.totalHours || 0} Saat`, 'İyi'],
        ['Görev Tamamlama', '%100', `%${weeklyStats.completionRate || 0}`, weeklyStats.completionRate > 80 ? 'Harika' : 'Geliştirilmeli'],
        ['Deneme Neti', 'Ortalama', weeklyStats.lastExamNet || '-', '-'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // 5. Alt Bilgi
    const finalY = doc.lastAutoTable.finalY || 180;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Bu rapor PozitifKoç AI tarafından otomatik olarak oluşturulmuştur.', 105, finalY + 20, { align: 'center' });

    // Kaydet
    doc.save(`${studentData.name}_Gelisim_Raporu_${today}.pdf`);
  }
}

export const reportService = new ReportService();
