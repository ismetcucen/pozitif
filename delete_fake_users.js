import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function deleteFakeAccounts() {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const admins = ['sedatdurmus@gmail.com', 'ismetcucen@gmail.com'];
  let deletedCount = 0;

  for (const user of users) {
    if (!admins.includes(user.email) && user.role !== 'admin') {
      console.log(`Deleting fake account: ${user.name} (${user.email})`);
      await deleteDoc(doc(db, 'users', user.id));
      deletedCount++;
    }
  }

  // Check pending_students and pending_coaches as well, and delete if they are test accounts
  const pendingCols = ['pending_students', 'pending_coaches'];
  for (const colName of pendingCols) {
    const snap = await getDocs(collection(db, colName));
    for (const d of snap.docs) {
      console.log(`Deleting pending account from ${colName}: ${d.data().name} (${d.data().email})`);
      await deleteDoc(doc(db, colName, d.id));
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} fake accounts.`);
}

deleteFakeAccounts()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
