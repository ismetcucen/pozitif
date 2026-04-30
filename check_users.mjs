import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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

async function checkUsers() {
  const collections = ['users', 'coaches', 'pending_students'];
  for (const c of collections) {
     const snap = await getDocs(collection(db, c));
     const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
     console.log(`--- ${c} ---`);
     docs.forEach(s => {
       console.log(`ID: ${s.id} | Email: ${s.email} | Name: ${s.name} | Role: ${s.role}`);
     });
  }
}

checkUsers();
