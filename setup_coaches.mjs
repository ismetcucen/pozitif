/**
 * setup_coaches.mjs
 * İsmet ve Sedat'ı Firestore'a koç+admin (kurucu) olarak yazar.
 * Auth gerektirmez — doğrudan Firestore'a yazar.
 * NOT: Firestore kuralları izin veriyorsa çalışır.
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, getDocs, query,
  where, setDoc, doc
} from "firebase/firestore";
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

const COACHES = [
  {
    email: "ismetcucen@gmail.com",
    name: "İsmet Cucen",
    specialty: "YKS - Sayısal & TM",
  },
  {
    email: "sedatdurmus@gmail.com",
    name: "Sedat Durmuş",
    specialty: "YKS - Sözel & Dil",
  }
];

async function run() {
  const [,, loginEmail, loginPassword] = process.argv;
  if (!loginEmail || !loginPassword) {
    console.error("Kullanım: node setup_coaches.mjs <email> <şifre>");
    process.exit(1);
  }

  console.log(`\n🔐 Giriş yapılıyor: ${loginEmail}`);
  await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
  console.log("✅ Giriş başarılı!\n");

  for (const coach of COACHES) {
    console.log(`\n📧 İşleniyor: ${coach.email}`);
    
    // Mevcut UID'yi bul
    let uid = null;
    const snap = await getDocs(query(collection(db, "users"), where("email", "==", coach.email)));
    if (!snap.empty) {
      uid = snap.docs[0].id;
      console.log(`   Mevcut kullanıcı bulundu: ${uid}`);
    } else {
      const sSnap = await getDocs(query(collection(db, "students"), where("email", "==", coach.email)));
      if (!sSnap.empty) {
        uid = sSnap.docs[0].id;
        console.log(`   students koleksiyonunda bulundu: ${uid}`);
      }
    }

    if (!uid) {
      // Kullanıcı sistemde yoksa → belge UID olmadan kaydedemeyiz
      // Bu koç henüz kayıt olmamış, fake UID ile kayıt edemeyiz
      console.log(`   ⚠️  ${coach.email} henüz sisteme kayıt olmamış.`);
      console.log(`       → Lütfen bu hesapla /register sayfasından 'Koç' olarak kayıt ol.`);
      continue;
    }

    // users koleksiyonuna yaz
    await setDoc(doc(db, "users", uid), {
      uid,
      email: coach.email,
      name: coach.name,
      role: "kurucu",
      specialty: coach.specialty,
      isVIP: true,
      plan: "premium",
      updatedAt: new Date().toISOString(),
    });

    console.log(`   ✅ ${coach.name} → role: 'kurucu' olarak yazıldı.`);
  }

  console.log("\n✅ Tamamlandı!\n");
  process.exit(0);
}

run().catch(err => {
  console.error("\n❌ Hata:", err.code, err.message);
  process.exit(1);
});
