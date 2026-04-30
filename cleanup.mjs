import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKVaK0MXWKhZEFmNBTHdIK5chPigf9c2s",
  authDomain: "kocluk-5bbe0.firebaseapp.com",
  projectId: "kocluk-5bbe0",
  storageBucket: "kocluk-5bbe0.firebasestorage.app",
  messagingSenderId: "828123702605",
  appId: "1:828123702605:web:0e53af0b52dd4e0868c304"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const admins = [
  "sedatdurmus@gmail.com",
  "ismetcucen@gmail.com",
  "robotveotesi@gmail.com",
  "serapgezen@gmail.com",
  "alikorkmaz@gmail.com",
  "mehmetseven@gmail.com",
  "serdarkonuk@gmail.com"
];

async function cleanup() {
  console.log("Starting thorough cleanup...");

  // 1. Clean Users
  const usersSnap = await getDocs(collection(db, 'users'));
  for (const d of usersSnap.docs) {
    const data = d.data();
    if (!admins.includes(data.email) && data.role !== 'super_admin' && data.role !== 'kurucu') {
      console.log(`Deleting User: ${data.email}`);
      await deleteDoc(doc(db, 'users', d.id));
    }
  }

  // 2. Clean Students
  const studentsSnap = await getDocs(collection(db, 'students'));
  for (const d of studentsSnap.docs) {
    const data = d.data();
    if (!admins.includes(data.email)) {
       console.log(`Deleting Student: ${data.email}`);
       await deleteDoc(doc(db, 'students', d.id));
    }
  }

  // 3. Clean pending collections
  const pending = ['pending_students', 'pending_coaches'];
  for (const col of pending) {
    const snap = await getDocs(collection(db, col));
    for (const d of snap.docs) {
      console.log(`Deleting Pending ${col}: ${d.id}`);
      await deleteDoc(doc(db, col, d.id));
    }
  }

  // 4. Clean all notifications (usually fakes)
  const notifsSnap = await getDocs(collection(db, 'notifications'));
  for (const d of notifsSnap.docs) {
    await deleteDoc(doc(db, 'notifications', d.id));
  }
  console.log("Deleted all notifications.");

  console.log("Cleanup finished.");
}

cleanup().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
