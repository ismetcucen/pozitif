import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, MessageSquare, Terminal, User, BookOpen } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function AIAssistant({ studentData, selfAssessments, exams, sessions, plans }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Selam ${studentData?.name || 'Öğrenci'}! Ben Pozitif AI rehberin. Bugün senin çalışma verilerine ve ders programına baktım. Sana nasıl yardımcı olabilirim?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const newUserMessage = { role: 'user', content: userMsg, timestamp: new Date().toISOString() };
    const updatedMessagesWithUser = [...messages, newUserMessage];

    setInput('');
    setMessages(updatedMessagesWithUser);
    setIsLoading(true);

    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      const apiKey = settingsSnap.exists() ? settingsSnap.data().geminiApiKey : null;

      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: "API Anahtarı bulunamadı. Lütfen koçuna hatırlat." }]);
        setIsLoading(false);
        return;
      }

      const finishedTopicsCount = Object.values(selfAssessments || {}).filter(v => v === 'finished').length;
      const lastNet = exams?.[0]?.net || 'Henüz girilmedi';
      const totalHoursToday = Math.round((sessions?.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 3600) * 10) / 10;
      const programSummary = (plans || []).map(p => `${p.day}: ${p.subject} (${p.topic})`).join(', ');

      const systemPrompt = `Sen, 'Pozitif Koç' platformunun samimi ve zeki YKS Rehber Öğretmenisin. 
      Öğrenci Bilgileri: ${studentData?.name}, Hedef: ${studentData?.targetData?.university} - ${studentData?.targetData?.major}. 
      İstatistikler: ${finishedTopicsCount} konu bitti, son net: ${lastNet}, bugün ${totalHoursToday} saat çalıştı.
      Program: ${programSummary || "Henüz program yüklenmemiş."}
      
      KONUŞMA KURALLARI:
      1. Eğer öğrenci sadece 'Merhaba', 'Selam' gibi girişler yaparsa, tüm istatistiklerini dökme. Samimi bir selam ver ve nasıl olduğunu sor.
      2. İstatistikleri ve programı sadece öğrenci sorduğunda veya bir tavsiye verirken 'yeri geldiğinde' kullan.
      3. Her cevabında 42 netten veya 0.2 saatten bahsetme; bu robotik bir izlenim verir.
      4. Bir insan gibi doğal ve akıcı konuş. Çok uzun paragraflardan kaçın.
      5. Gerektiğinde espriler yap veya sadece motive et, her zaman teknik bilgi verme.`;

      const modelsToTry = ['gemini-1.5-flash', 'gemini-flash-latest', 'gemini-pro-latest'];
      let finalAIResponse = null;

      for (const model of modelsToTry) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + "\nSoru: " + userMsg }] }] })
          });
          
          const data = await response.json();
          
          if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            finalAIResponse = data.candidates[0].content.parts[0].text;
            break; // Başarılı, döngüden çık
          } else {
            console.warn(`Model ${model} kotaya takıldı veya hata verdi. Sıradaki denenecek.`);
          }
        } catch (err) {
          console.error(`Model ${model} ağ hatası verdi.`, err);
        }
      }

      if (finalAIResponse) {
        const aiMessage = { role: 'assistant', content: finalAIResponse, timestamp: new Date().toISOString() };
        const finalMessages = [...updatedMessagesWithUser, aiMessage];
        setMessages(finalMessages);
        if (studentData?.id) {
          await updateDoc(doc(db, 'students', studentData.id), { aiMessages: finalMessages });
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Şu an modellerimiz çok yoğun olduğundan cevap veremiyorum. Lütfen kısa bir süre sonra tekrar dene." }]);
      }

    } catch (err) {
      console.error('AI Ultimate Error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sistemde teknik bir aksaklık oluştu." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Bot className="w-8 h-8 relative z-10" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[70vh] bg-white rounded-3xl shadow-premium z-[101] flex flex-col overflow-hidden border border-slate-200 animate-scale-in">
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Pozitif AI Rehber</h4>
                <p className="text-[10px] text-indigo-100">Kişiselleştirilmiş Akıllı Destek</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={clsx("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[85%] p-4 rounded-2xl text-sm shadow-sm font-medium",
                  m.role === 'user' 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '200ms'}} />
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{animationDelay: '400ms'}} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Bir soru sor..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-sm outline-none focus:border-indigo-500 transition-all font-medium"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-indigo-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
