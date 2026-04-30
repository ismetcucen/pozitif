import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function listAll() {
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const studentsSnap = await getDocs(collection(db, 'students'));
  const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const appointmentsSnap = await getDocs(collection(db, 'appointments'));
  const appointments = appointmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  console.log("USERS:", users.map(u => u.email).join(', '));
  console.log("STUDENTS:", students.map(s => s.name + ' (' + s.email + ')').join(', '));
}

listAll().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
