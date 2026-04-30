/**
 * assign_admins.mjs
 * ismetcucen@gmail.com ve sedatdurmus@gmail.com kullanıcılarını
 * Firestore'da 'kurucu' rolüne (hem koç hem admin) atar.
 * 
 * Kullanım: node assign_admins.mjs <admin_email> <admin_password>
 */

import { initializeApp } from "firebase/app";
import { 
  getFirestore, collection, getDocs, query, 
  where, setDoc, doc, getDoc 
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

const TARGET_EMAILS = [
  "ismetcucen@gmail.com",
  "sedatdurmus@gmail.com"
];

async function assignAdmin(adminEmail, adminPassword) {
  // Admin olarak sisteme giriş yap
  console.log(`\n🔐 Admin girişi yapılıyor: ${adminEmail}`);
  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  console.log("✅ Giriş başarılı!\n");

  let successCount = 0;

  for (const email of TARGET_EMAILS) {
    console.log(`\n📧 İşleniyor: ${email}`);

    // Önce users koleksiyonunda ara
    let uid = null;
    let existingData = {};

    const usersSnap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
    if (!usersSnap.empty) {
      uid = usersSnap.docs[0].id;
      existingData = usersSnap.docs[0].data();
      console.log(`   ✓ users koleksiyonunda bulundu. UID: ${uid}`);
    } else {
      // students koleksiyonunda ara
      const studentsSnap = await getDocs(query(collection(db, "students"), where("email", "==", email)));
      if (!studentsSnap.empty) {
        uid = studentsSnap.docs[0].id;
        existingData = studentsSnap.docs[0].data();
        console.log(`   ✓ students koleksiyonunda bulundu. UID: ${uid}`);
      }
    }

    if (!uid) {
      console.log(`   ⚠️  ${email} sistemde bulunamadı. Bu kullanıcı önce kayıt olmalı.`);
      continue;
    }

    // users koleksiyonuna kurucu olarak yaz/güncelle
    const userData = {
      ...existingData,
      uid,
      email,
      name: existingData.name || existingData.displayName || email.split("@")[0],
      role: "kurucu",          // hem koç hem admin erişimi
      isVIP: true,
      plan: "premium",
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", uid), userData);
    console.log(`   ✅ users/${uid} → role: 'kurucu', plan: 'premium' olarak güncellendi.`);

    // Eğer students koleksiyonunda varsa oradan temizle / sadece role güncelle
    const studentRef = doc(db, "students", uid);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) {
      await setDoc(studentRef, { role: "kurucu" }, { merge: true });
      console.log(`   ℹ️  students/${uid} → role: 'kurucu' (merge) olarak güncellendi.`);
    }

    successCount++;
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ ${successCount}/${TARGET_EMAILS.length} kullanıcı başarıyla kurucu yapıldı.`);
  if (successCount < TARGET_EMAILS.length) {
    console.log(`⚠️  Eksik kullanıcıların önce platforma kayıt olması gerekiyor.`);
  }
  process.exit(0);
}

const [,, adminEmail, adminPassword] = process.argv;

if (!adminEmail || !adminPassword) {
  console.error("\n❌ Kullanım: node assign_admins.mjs <admin_email> <admin_password>");
  console.error("   Örnek: node assign_admins.mjs ismetcucen@gmail.com sifren123\n");
  process.exit(1);
}

assignAdmin(adminEmail, adminPassword).catch(err => {
  console.error("\n❌ Hata:", err.message);
  process.exit(1);
});
