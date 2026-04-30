import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, BookOpen, FileText, Send, Bot, RotateCcw, User, Brain, Lightbulb } from 'lucide-react';
import { aiHub } from '../../modules/ai-hub/AIService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function TutorAI() {
  const { currentUser, userData } = useAuth();
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      role: 'assistant', 
      content: `Merhaba ${userData?.name?.split(' ')[0] || 'Öğrenci'}! Ben PozitifKoç AI Eğitmeniyim. Bugün sana nasıl yardımcı olabilirim? Herhangi bir konuyu anlatmamı isteyebilir veya sana test hazırlamamı söyleyebilirsin.` 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text = input) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMessage = { id: Date.now(), role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const model = await aiHub.getAIModel();
      if (!model) throw new Error("AI Servisi şu an çevrimdışı.");

      // Chat history format for Gemini
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const chat = model.startChat({
        history: history,
        generationConfig: { maxOutputTokens: 1000 }
      });

      const result = await chat.sendMessage(messageText);
      const response = await result.response;
      const aiResponse = { id: Date.now() + 1, role: 'assistant', content: response.text() };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      toast.error('AI yanıt veremedi: ' + err.message);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "Üzgünüm, şu an teknik bir sorun yaşıyorum. Lütfen biraz sonra tekrar dene." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Konuyu Özetle', icon: BookOpen, prompt: 'Bana Matematik - Polinomlar konusunu en önemli yerleriyle özetle.' },
    { label: 'Test Hazırla', icon: FileText, prompt: 'Fizik - Hareket konusuyla ilgili bana 5 tane çoktan seçmeli soru hazırlar mısın? (Cevaplar en sonda olsun)' },
    { label: 'Çalışma Planı', icon: Brain, prompt: 'Gelecek hafta TYT Türkçe kampı yapmak istiyorum, bana 7 günlük bir program taslağı çıkarır mısın?' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-5xl mx-auto bg-white rounded-2xl border border-borderLight shadow-sm overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-borderLight bg-section flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-secondary" />
          </div>
          <div>
             <h2 className="text-sm font-bold text-textPrimary uppercase tracking-tight">AI EĞİTMEN ASİSTANI</h2>
             <p className="text-[10px] font-medium text-textSecondary uppercase tracking-widest">Müfredat ve Sınav Uzmanı</p>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="p-2 hover:bg-borderLight rounded-lg text-textSecondary transition-colors">
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={clsx("flex gap-4 max-w-[85%]", m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto")}>
            <div className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              m.role === 'user' ? "bg-slate-100" : "bg-secondary text-white"
            )}>
              {m.role === 'user' ? <User className="w-4 h-4 text-slate-500" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={clsx(
              "p-4 rounded-2xl text-sm leading-relaxed",
              m.role === 'user' ? "bg-slate-900 text-white rounded-tr-none" : "bg-section text-textPrimary rounded-tl-none border border-borderLight"
            )}>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 max-w-[80%]">
             <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
             </div>
             <div className="p-4 bg-section rounded-2xl rounded-tl-none border border-borderLight flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Quick Actions */}
      {messages.length < 3 && (
        <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar border-t border-borderLight/50">
          {quickActions.map((action, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(action.prompt)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-borderLight rounded-full text-[11px] font-bold text-textSecondary hover:border-secondary hover:text-secondary transition-all shrink-0"
            >
              <action.icon className="w-3 h-3" /> {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <footer className="p-4 bg-section border-t border-borderLight">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Konu anlatımı iste, soru sor veya plan yap..." 
            className="w-full bg-white border border-borderLight rounded-xl pl-5 pr-14 py-3.5 text-sm font-medium outline-none focus:border-secondary transition-all shadow-inner-soft disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[9px] text-center text-textSecondary mt-3 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-500" /> AI eğitmeni öğrenme sürecini desteklemek için tasarlanmıştır.
        </p>
      </footer>
    </div>
  );
}
