import { useState, useEffect } from 'react';
import { aiHub } from '../modules/ai-hub/AIService';
import { AlertTriangle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AIKeyWarning() {
  const [isMissing, setIsMissing] = useState(false);
  const { userRole } = useAuth();

  useEffect(() => {
    const checkKey = async () => {
      const model = await aiHub.getAIModel();
      if (!model) {
        setIsMissing(true);
      }
    };
    checkKey();
  }, []);

  if (!isMissing || (userRole !== 'coach' && userRole !== 'admin' && userRole !== 'super_admin' && userRole !== 'kurucu')) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 sticky top-0 z-[60] flex items-center justify-center gap-4 text-amber-800 animate-slide-down">
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
      <p className="text-xs font-bold tracking-tight">
        Google Gemini API anahtarı eksik! Yapay zeka özellikleri şu an çalışmıyor.
      </p>
      <Link 
        to="/coach/settings" 
        className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-amber-700 transition-all shadow-sm"
      >
        <Settings className="w-3 h-3" /> Ayarlara Git
      </Link>
    </div>
  );
}
