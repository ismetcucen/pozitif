import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Video, ExternalLink, Calendar, Clock } from 'lucide-react';

export default function StudentLiveLessons({ studentId }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'liveLessons'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLessons(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const upcoming = lessons.filter(l => new Date(l.date) >= new Date());
  const past = lessons.filter(l => new Date(l.date) < new Date());

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-indigo-500 font-bold animate-pulse">
      Yükleniyor...
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">

      {/* YAKLAŞAN DERSLER */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
          <Video className="w-5 h-5 text-indigo-600" /> Yaklaşan Canlı Dersler
        </h3>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center gap-4 border-2 border-dashed border-slate-200 rounded-xl">
            <Video className="w-12 h-12 text-slate-200" />
            <p className="text-slate-500 font-medium text-sm">Yaklaşan canlı ders planlanmamış.</p>
            <p className="text-slate-400 text-xs font-medium">Koçunuz ders eklediğinde burada görüntülenecek.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map(lesson => {
              const lessonDate = new Date(lesson.date);
              const isToday = lessonDate.toDateString() === new Date().toDateString();
              const isSoon = !isToday && (lessonDate - new Date()) < 24 * 60 * 60 * 1000;

              return (
                <div
                  key={lesson.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
                    isToday
                      ? 'bg-indigo-50 border-indigo-200 shadow-md shadow-indigo-100'
                      : isSoon
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isToday ? 'bg-indigo-600' : 'bg-slate-100'
                    }`}>
                      <Video className={`w-6 h-6 ${isToday ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">{lesson.title}</h4>
                        {isToday && (
                          <span className="text-[10px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                            BUGÜN
                          </span>
                        )}
                        {isSoon && !isToday && (
                          <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            YAKINDA
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {lessonDate.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {lessonDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={lesson.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0 shadow-sm ${
                      isToday
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {isToday ? 'Derse Katıl' : 'Linki Aç'}
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* GEÇMİŞ DERSLER */}
      {past.length > 0 && (
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <Clock className="w-5 h-5 text-slate-400" /> Geçmiş Dersler
          </h3>
          <div className="space-y-3">
            {past.slice().reverse().map(lesson => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 opacity-70"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-600 truncate">{lesson.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(lesson.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <a
                  href={lesson.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Kayıt
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
