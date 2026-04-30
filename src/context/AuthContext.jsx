import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Bir öğrencinin Premium (VIP) erişimi olup olmadığını hesaplar.
 * Kurallar:
 *  1. isVIP: true  → Her zaman erişim var
 *  2. plan === 'coach_managed' → Koç aktifse erişim var
 *  3. plan === 'trial' ve trialEndsAt gelecekte → Deneme süresinde, erişim var
 *  4. plan === 'premium' → Ödeme yapılmış, erişim var
 *  5. Diğer → Free, kısıtlı erişim
 */
function computeIsVIP(data) {
  if (!data) return false;
  if (data.isVIP === true) return true;
  if (data.plan === 'coach_managed') return true;
  if (data.plan === 'premium') return true;
  if (data.plan === 'trial' && data.trialEndsAt) {
    return new Date(data.trialEndsAt) > new Date();
  }
  return false;
}

/**
 * Deneme süresinde kaç gün kaldığını döner. Deneme yoksa null döner.
 */
function computeTrialDaysLeft(data) {
  if (!data || data.plan !== 'trial' || !data.trialEndsAt) return null;
  const diff = new Date(data.trialEndsAt) - new Date();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isVIP, setIsVIP] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          // Önce 'users' koleksiyonuna bak
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            // Eğer koç/admin ise isVIP hesaplamayı geç
            if (['coach', 'admin', 'super_admin', 'kurucu'].includes(data.role)) {
              setUserRole(data.role);
              setUserData({ ...data, isVIP: true });
              setIsVIP(true);
              setTrialDaysLeft(null);
            } else {
              // Student'ın detay verisini students koleksiyonundan al
              const studentRef = doc(db, 'students', user.uid);
              const studentSnap = await getDoc(studentRef);
              const studentData = studentSnap.exists()
                ? { ...studentSnap.data(), role: 'student' }
                : { ...data, role: 'student' };
              setUserRole('student');
              setUserData(studentData);
              setIsVIP(computeIsVIP(studentData));
              setTrialDaysLeft(computeTrialDaysLeft(studentData));
            }
          } else {
            // Sadece students koleksiyonunda var
            const studentRef = doc(db, 'students', user.uid);
            const studentSnap = await getDoc(studentRef);
            if (studentSnap.exists()) {
              const studentData = { ...studentSnap.data(), role: 'student' };
              setUserRole('student');
              setUserData(studentData);
              setIsVIP(computeIsVIP(studentData));
              setTrialDaysLeft(computeTrialDaysLeft(studentData));
            } else {
              setUserRole('student');
              setUserData({ id: user.uid, email: user.email });
              setIsVIP(false);
              setTrialDaysLeft(null);
            }
          }
        } catch (error) {
          console.error('Auth context error:', error);
          setUserRole('student');
          setIsVIP(false);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
        setIsVIP(false);
        setTrialDaysLeft(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    isVIP,
    trialDaysLeft,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
