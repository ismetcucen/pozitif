import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDKVaK0MXWKhZEFmNBTHdIK5chPigf9c2s",
  authDomain: "kocluk-5bbe0.firebaseapp.com",
  projectId: "kocluk-5bbe0",
  storageBucket: "kocluk-5bbe0.firebasestorage.app",
  messagingSenderId: "828123702605",
  appId: "1:828123702605:web:0e53af0b52dd4e0868c304"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function run() {
  try {
    // Log in as coach (using a known coach email if possible)
    // If we don't know the password, we can't test. I will just query students blindly. 
    // Actually, I can query users to find an admin, wait we can't do that if rules block it.
    // Let's at least log the error.
    const snap = await getDocs(collection(db, 'studySessions'));
    console.log(`Found ${snap.docs.length} sessions.`);
    snap.docs.forEach(doc => console.log(doc.id, doc.data()));
  } catch (err) {
    console.error('Firestore restricted:', err.message);
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));
