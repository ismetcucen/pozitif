import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, query, where } from "firebase/firestore";

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

async function findAndFixStudent() {
  const email = "kodkahramanlari@gmail.com";
  
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snap = await getDocs(q);
    
    if (snap.empty) {
       console.log("User not found in Firestore. It might only exist in Auth.");
       process.exit(1);
    }
    
    const uid = snap.docs[0].id;
    console.log("Found user in Firestore with UID:", uid);

    await setDoc(doc(db, 'users', uid), {
      name: "Kod Kahramanları",
      email: email,
      role: 'student',
      isVIP: true,
      addedBy: "system",
      createdAt: new Date().toISOString()
    });
    
    await setDoc(doc(db, 'students', uid), {
      name: "Kod Kahramanları",
      email: email,
      educationLevel: "Lise",
      grade: "12",
      examField: "SAYISAL",
      target: { university: "ODTÜ", department: "Bilgisayar Mühendisliği" },
      status: 'Aktif',
      isVIP: true,
      addedBy: "system",
      createdAt: new Date().toISOString()
    });
    
    console.log("Student document successfully forced to 'student' in Firestore!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

findAndFixStudent();
