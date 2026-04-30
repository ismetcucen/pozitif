import { auth, db, googleProvider } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

class AuthService {
  async loginWithEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return this.getUserData(result.user.uid);
  }

  async registerWithEmail(email, password, displayName, role, coachData = null) {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    const extraData = {
      name: displayName,
      coachId: coachData?.id || null,
      coachName: coachData?.name || coachData?.displayName || null,
    };
    await this.createNewUser(result.user, role, extraData);
    return result.user;
  }

  async loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create as student
    const userData = await this.getUserData(user.uid);
    if (!userData) {
      await this.createNewUser(user, 'student');
    }
    return user;
  }

  async logout() {
    return await signOut(auth);
  }

  async resetPassword(email) {
    return await sendPasswordResetEmail(auth, email);
  }

  async getUserData(uid) {
    // Try users collection first
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) return userSnap.data();

    // Try students collection
    const studentRef = doc(db, 'students', uid);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) return { ...studentSnap.data(), role: 'student' };

    return null;
  }

  async createNewUser(user, role, extraData = {}) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7 günlük deneme

    const data = {
      uid: user.uid,
      name: user.displayName || extraData.name || '',
      email: user.email,
      role: role,
      createdAt: new Date().toISOString(),
      registeredBy: 'self',    // 'self' | 'coach'
      plan: 'trial',           // 'trial' | 'free' | 'premium' | 'coach_managed'
      trialEndsAt: trialEndsAt.toISOString(),
      isVIP: false,
      coachId: extraData.coachId || null,
      coachName: extraData.coachName || null,
    };

    if (role === 'student') {
      await setDoc(doc(db, 'students', user.uid), {
        ...data,
        xp: 0,
        level: 1,
        addedBy: data.coachId, // Koçun listesinde görünmesi için
        currentStatus: { isStudying: false }
      });
      // users koleksiyonuna da ekle (login için role kontrolü)
      await setDoc(doc(db, 'users', user.uid), { role: 'student', email: user.email, name: data.name });
    } else {
      await setDoc(doc(db, 'users', user.uid), data);
    }
  }
}

export const authService = new AuthService();
