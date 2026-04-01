import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          // Önce 'users' (Admin/Koç) koleksiyonuna bak
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserRole(data.role);
            setUserData(data);
          } else {
            // Eğer orada yoksa 'students' (Öğrenci) koleksiyonuna bak
            const studentRef = doc(db, 'students', user.uid);
            const studentSnap = await getDoc(studentRef);
            
            if (studentSnap.exists()) {
              setUserRole('student');
              setUserData(studentSnap.data());
            } else {
              // HİÇBİR YERDE YOKSA BİLE (Yeni giriş) varsayılan olarak student kabul et (Döngüyü kır!)
              setUserRole('student');
              setUserData({ id: user.uid, email: user.email });
            }
          }
        } catch (error) {
          console.error('Veri çekilirken hata (Fallback devreye girdi):', error);
          setUserRole('student'); // Hata durumunda bile döngüye girmemesi için rol ver
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
