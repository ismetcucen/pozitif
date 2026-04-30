import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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
const auth = getAuth(app);

async function fixStudent() {
  const email = "kodkahramanlari@gmail.com";
  const passwordsToTry = ["123456", "password123", "12345678", "kodkahramanlari"];
  
  let uid = null;
  
  for (const pw of passwordsToTry) {
     try {
        const cred = await signInWithEmailAndPassword(auth, email, pw);
        uid = cred.user.uid;
        console.log("Successfully logged in with password:", pw);
        break;
     } catch(e) {}
  }
  
  if (!uid) {
    console.log("Could not guess the password. Please delete the user from Firebase Auth first or provide the password.");
    process.exit(1);
  }

  try {
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
    console.error("Error creating student:", err.message);
    process.exit(1);
  }
}

fixStudent();
