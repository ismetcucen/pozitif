import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDKVaK0MXWKhZEFmNBTHdIK5chPigf9c2s",
  authDomain: "kocluk-5bbe0.firebaseapp.com",
  projectId: "kocluk-5bbe0",
  storageBucket: "kocluk-5bbe0.firebasestorage.app",
  messagingSenderId: "828123702605",
  appId: "1:828123702605:web:0e53af0b52dd4e0868c304",
  measurementId: "G-ZKLXZ93GSB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Koçun oturumunu kapatmadan yeni öğrenci "Auth" hesabı açabilmek için ikincil Firebase örneği
const secondaryApp = getApps().find(app => app.name === "SecondaryApp") || initializeApp(firebaseConfig, "SecondaryApp");
export const secondaryAuth = getAuth(secondaryApp);
