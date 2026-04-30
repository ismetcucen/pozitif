import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { Search, UserCheck, MessageSquare, Star, Users, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function CoachDirectory() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [connecting, setConnecting] = useState(null);
  const [currentCoach, setCurrentCoach] = useState(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        // Tüm koç rollerini kapsayan sorgu: coach, kurucu, admin, super_admin
        const coachRoles = ['coach', 'kurucu', 'admin', 'super_admin'];
        const snap = await getDocs(
          query(collection(db, 'users'), where('role', 'in', coachRoles))
        );
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCoaches(list);

        // Mevcut koçu bul
        if (userData?.coachId) {
          const coach = list.find(c => c.id === userData.coachId);
          setCurrentCoach(coach || null);
        }
      } catch (err) {
        console.error(err);
        toast.error('Koçlar yüklenirken hata oluştu: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCoaches();
  }, [userData]);

  const handleConnect = async (coach) => {
    if (!currentUser) return;
    setConnecting(coach.id);
    try {
      // Sadece students koleksiyonuna yaz (users koleksiyonuna erişim yok)
      await setDoc(doc(db, 'students', currentUser.uid), {
        coachId: coach.id,
        coachName: coach.name || coach.displayName || 'Koç',
        updatedAt: new Date().toISOString()
      }, { merge: true }); // merge:true → belge yoksa yarat, varsa güncelle

      setCurrentCoach(coach);
      toast.success(`${coach.name || 'Koç'} ile bağlantı kuruldu! Artık mesajlaşabilirsiniz.`, { icon: '🎯' });
    } catch (err) {
      console.error(err);
      toast.error('Bağlantı kurulamadı: ' + err.message);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    if (!currentUser || !currentCoach) return;
    setConnecting('disconnect');
    try {
      // Sadece students koleksiyonunu güncelle
      await setDoc(doc(db, 'students', currentUser.uid), {
        coachId: null,
        coachName: null,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setCurrentCoach(null);
      toast.success('Koç bağlantısı kaldırıldı.');
    } catch (err) {
      console.error(err);
      toast.error('İşlem başarısız: ' + err.message);
    } finally {
      setConnecting(null);
    }
  };

  const filtered = coaches.filter(c => {
    const name = (c.name || c.displayName || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Koç Dizini</h1>
          <p className="text-sm text-textSecondary mt-1">Platformdaki koçları incele, birini seç ve mesajlaşmaya başla.</p>
        </div>
        {currentCoach && (
          <div className="hidden md:flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-700">Bağlı Koçunuz</p>
              <p className="text-sm font-bold text-emerald-800">{currentCoach.name || currentCoach.displayName}</p>
            </div>
            <button
              onClick={() => navigate('/student/dashboard/mesaj')}
              className="ml-2 flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Mesajlaş
            </button>
          </div>
        )}
      </div>

      {/* Mevcut Koç Kartı (Mobil) */}
      {currentCoach && (
        <div className="md:hidden flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-xs text-emerald-600 font-semibold">Bağlı Koçunuz</p>
              <p className="text-sm font-bold text-emerald-800">{currentCoach.name || currentCoach.displayName}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/dashboard/mesaj')}
            className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Mesajlaş
          </button>
        </div>
      )}

      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
        <input
          type="text"
          placeholder="Koç ara (isim veya e-posta)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-borderLight rounded-xl text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-borderLight rounded-2xl p-12 text-center shadow-sm">
          <Users className="w-10 h-10 mx-auto mb-3 text-textSecondary opacity-30" />
          <p className="font-semibold text-textPrimary">Koç bulunamadı</p>
          <p className="text-sm text-textSecondary mt-1">
            {search ? `"${search}" ile eşleşen koç yok.` : 'Platformda henüz aktif koç bulunmuyor.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(coach => {
            const isConnected = currentCoach?.id === coach.id;
            const isConnecting = connecting === coach.id;
            const initials = (coach.name || coach.displayName || 'K').charAt(0).toUpperCase();

            return (
              <div
                key={coach.id}
                className={clsx(
                  "bg-white rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md",
                  isConnected ? "border-emerald-300 ring-2 ring-emerald-100" : "border-borderLight"
                )}
              >
                {/* Koç Başlığı */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-textPrimary text-sm leading-tight">
                        {coach.name || coach.displayName || 'İsimsiz Koç'}
                      </h3>
                      <p className="text-xs text-textSecondary mt-0.5 truncate max-w-[160px]">{coach.email}</p>
                    </div>
                  </div>
                  {isConnected && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 whitespace-nowrap">
                      ✓ Bağlı
                    </span>
                  )}
                </div>

                {/* Koç Bilgileri */}
                <div className="space-y-2 mb-5">
                  {coach.specialty && (
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-xs text-textSecondary">{coach.specialty}</span>
                    </div>
                  )}
                  {coach.studentCount !== undefined && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                      <span className="text-xs text-textSecondary">{coach.studentCount} aktif öğrenci</span>
                    </div>
                  )}
                  {!coach.specialty && !coach.studentCount && (
                    <p className="text-xs text-textSecondary italic">Koç profili henüz tamamlanmamış.</p>
                  )}
                </div>

                {/* Butonlar */}
                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => navigate('/student/dashboard/mesaj')}
                        className="flex-1 flex items-center justify-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-secondary/90 transition-colors shadow-sm shadow-secondary/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Mesaj Gönder
                      </button>
                      <button
                        onClick={handleDisconnect}
                        disabled={connecting === 'disconnect'}
                        className="px-3 py-2.5 border border-borderLight text-textSecondary rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                        title="Bağlantıyı Kaldır"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(coach)}
                      disabled={isConnecting || !!connecting}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isConnecting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                      {isConnecting ? 'Bağlanıyor...' : 'Bu Koçu Seç'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
