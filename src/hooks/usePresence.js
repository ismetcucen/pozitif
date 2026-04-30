import { useEffect } from 'react';
import { trackingEngine } from '../modules/tracking/TrackingEngine';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { query, collection, where, onSnapshot } from 'firebase/firestore';

/**
 * Öğrencinin platformdaki aktifliğini takip eder ve 
 * periyodik olarak Firestore'a "online" bilgisi gönderir.
 */
export function usePresence() {
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    if (!currentUser || userRole !== 'student') return;

    let weeklyPlans = [];
    // 1. Planları dinle
    const q = query(collection(db, 'weeklyPlans'), where('studentId', '==', currentUser.uid));
    const unsubPlans = onSnapshot(q, (snap) => {
      weeklyPlans = snap.docs.map(d => d.data());
      // Planlar güncellendiğinde hemen senkronize et
      trackingEngine.syncWithSchedule(currentUser.uid, weeklyPlans);
    });

    // 2. İlk girişte online yap
    trackingEngine.updatePresence(currentUser.uid, true);

    // 3. Periyodik takip
    const interval = setInterval(() => {
      trackingEngine.updatePresence(currentUser.uid, true);
      trackingEngine.syncWithSchedule(currentUser.uid, weeklyPlans);
    }, 120000); 

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
         trackingEngine.updatePresence(currentUser.uid, true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubPlans();
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      trackingEngine.updatePresence(currentUser.uid, false);
    };
  }, [currentUser, userRole]);
}
