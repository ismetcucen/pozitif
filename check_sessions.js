import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc } from 'firebase/firestore';

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
const db = getFirestore(app);

async function checkSessions() {
  const sessionsCol = collection(db, 'studySessions');
  const sessionSnapshot = await getDocs(sessionsCol);
  const sessions = sessionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  console.log(`Found ${sessions.length} total sessions.`);
  if (sessions.length > 0) {
      console.log('Sample of the last 3 sessions:');
      console.log(sessions.slice(-3));
  }
}

checkSessions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
