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

async function checkStudents() {
  const snap = await getDocs(collection(db, 'students'));
  const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const validEmails = ["ismet", "sedat", "test", "Ahmet"]; // Let's see what is there
  console.log("Total students:", students.length);
  students.forEach(s => {
    console.log(`ID: ${s.id} | Name: ${s.name} | Email: ${s.email} | addedBy: ${s.addedBy || 'N/A'}`);
  });
}

checkStudents();
