import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase';
import {
  collection, addDoc, query, where, orderBy,
  onSnapshot, serverTimestamp, limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Upload, BrainCircuit, CheckCircle2, AlertTriangle,
  Clock, TrendingUp, FileImage, Loader2, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { aiHub } from '../../modules/ai-hub/AIService';

/* ─── Gemini Vision API call ─────────────────────────────── */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── Main Component ─────────────────────────────────────── */
export default function ExamAnalysis() {
  const { currentUser, userData } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [examName, setExamName] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const fileRef = useRef();

  /* Firestore'dan analizleri dinle */
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'examAnalyses'),
      where('studentId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsub = onSnapshot(q, snap => {
      setAnalyses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => {
      console.error('examAnalyses listen error:', err);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'].includes(f.type)) {
      toast.error('Sadece Resim (PNG, JPG) veya PDF dosyası yükleyebilirsiniz.');
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      toast.error('Dosya 15MB\'den küçük olmalıdır.');
      return;
    }
    setFile(f);
    if (f.type === 'application/pdf') {
      setPreview('pdf-placeholder'); // PDF için özel önizleme
    } else {
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return toast.error('Lütfen önce bir deneme dosyası seçin.');
    if (!examName.trim()) return toast.error('Deneme adını girin (Örn: TYT Deneme 1).');

    try {
      setUploading(true);
      toast.loading('Dosya yükleniyor...', { id: 'upload' });

      // 1. Storage'a yükle
      const storageRef = ref(
        storage,
        `exams/${currentUser.uid}/${Date.now()}_${file.name}`
      );
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);
      toast.success('Dosya yüklendi!', { id: 'upload' });

      // 2. AI ile analiz et
      setUploading(false);
      setAnalyzing(true);
      toast.loading('AI analiz ediyor...', { id: 'ai' });

      const base64Data = await fileToBase64(file);
      const analysisText = await aiHub.analyzeExamFile(currentUser.uid, base64Data, file.type);
      toast.success('Analiz tamamlandı!', { id: 'ai' });

      // 3. Firestore'a kaydet
      await addDoc(collection(db, 'examAnalyses'), {
        studentId: currentUser.uid,
        studentName: userData?.name || currentUser.email,
        examName: examName.trim(),
        imageUrl: fileUrl, // imageUrl field holds PDF url too
        fileType: file.type,
        analysisText,
        createdAt: serverTimestamp(),
        status: 'done'
      });

      // Reset
      setFile(null);
      setPreview(null);
      setExamName('');
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Analiz kaydedildi!');
    } catch (err) {
      console.error(err);
      toast.error(`Hata: ${err.message}`);
      toast.dismiss('upload');
      toast.dismiss('ai');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const isLoading = uploading || analyzing;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-blue-600" />
          </div>
          Deneme Analizi
        </h1>
        <p className="text-sm text-textSecondary pl-14">
          Deneme sonuç görselini yükle, AI sana detaylı analiz ve öneriler sunsun.
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white border border-borderLight rounded-2xl p-6 space-y-5 shadow-sm">
        <h2 className="text-sm font-bold text-textPrimary flex items-center gap-2">
          <Upload className="w-4 h-4 text-secondary" /> Yeni Deneme Yükle
        </h2>

        {/* Exam name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-textSecondary uppercase tracking-wide">Deneme Adı</label>
          <input
            type="text"
            value={examName}
            onChange={e => setExamName(e.target.value)}
            placeholder="Örn: TYT Deneme 3 — Nisan 2026"
            className="w-full bg-gray-50 border border-borderLight rounded-xl px-4 py-3 text-sm font-medium text-textPrimary outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
          />
        </div>

        {/* Drop zone */}
        <div
          onClick={() => !isLoading && fileRef.current?.click()}
          className={clsx(
            "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-secondary hover:bg-blue-50/30",
            preview ? "border-secondary bg-blue-50/20" : "border-borderLight"
          )}
        >
          {preview ? (
            <div className="space-y-3">
              <img src={preview} alt="Önizleme" className="max-h-64 mx-auto rounded-xl object-contain shadow-sm" />
              <p className="text-xs font-medium text-textSecondary">{file?.name}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <FileImage className="w-12 h-12 text-gray-300 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-textPrimary">PNG veya JPG yükle</p>
                <p className="text-xs text-textSecondary mt-1">Deneme sonuç sayfanın fotoğrafını çek veya sürükle bırak</p>
              </div>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={handleUploadAndAnalyze}
          disabled={!file || !examName.trim() || isLoading}
          className={clsx(
            "w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
            file && examName.trim() && !isLoading
              ? "bg-secondary text-white hover:bg-secondary/90 shadow-md shadow-secondary/20"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploading ? 'Yükleniyor...' : 'AI Analiz Ediyor...'}
            </>
          ) : (
            <>
              <BrainCircuit className="w-4 h-4" /> AI ile Analiz Et
            </>
          )}
        </button>

        {!GEMINI_KEY && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 font-medium">
            ⚠️ AI API anahtarı bulunamadı. <code>.env</code> dosyasına <code>VITE_AI_API_KEY=...</code> ekleyin.
          </p>
        )}
      </div>

      {/* Past Analyses */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-textPrimary">
          Geçmiş Analizler
          <span className="ml-2 text-xs font-medium text-textSecondary bg-gray-100 px-2 py-0.5 rounded-full">{analyses.length}</span>
        </h2>

        {analyses.length === 0 ? (
          <div className="bg-white border border-borderLight rounded-2xl p-10 text-center text-textSecondary">
            <TrendingUp className="w-10 h-10 opacity-20 mx-auto mb-3" />
            <p className="text-sm font-medium">Henüz analiz yok. İlk denemenizi yükleyin!</p>
          </div>
        ) : (
          analyses.map(item => (
            <div key={item.id} className="bg-white border border-borderLight rounded-2xl overflow-hidden shadow-sm">
              {/* Card Header */}
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-textPrimary">{item.examName}</p>
                    <p className="text-xs text-textSecondary flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Tarih yok'}
                    </p>
                  </div>
                </div>
                {expandedId === item.id
                  ? <ChevronUp className="w-4 h-4 text-textSecondary flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-textSecondary flex-shrink-0" />
                }
              </button>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="border-t border-borderLight p-5 space-y-5 animate-fade-in">
                  {/* Image */}
                  {item.imageUrl && (
                    <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={item.imageUrl}
                        alt="Deneme görseli"
                        className="max-h-64 rounded-xl object-contain border border-borderLight shadow-sm hover:opacity-90 transition-opacity"
                      />
                    </a>
                  )}
                  {/* Analysis Text */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-borderLight">
                    <div className="flex items-center gap-2 mb-3">
                      <BrainCircuit className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">AI Analizi</span>
                    </div>
                    <pre className="text-sm text-textPrimary whitespace-pre-wrap font-sans leading-relaxed">
                      {item.analysisText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
