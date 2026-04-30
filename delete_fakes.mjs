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

async function deleteFakeUsers() {
  const snap = await getDocs(collection(db, 'users'));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const emailsToKeep = [
     "sedatdurmus@gmail.com",
     "ismetcucen@gmail.com",
     "robotveotesi@gmail.com",
     "serapgezen@gmail.com",
     "alikorkmaz@gmail.com",
     "mehmetseven@gmail.com",
     "serdarkonuk@gmail.com"
  ];

  for (const user of docs) {
     if (!emailsToKeep.includes(user.email)) {
       console.log(`Deleting fake user: ${user.name} (${user.email})`);
       try {
         await deleteDoc(doc(db, 'users', user.id));
         console.log(`Deleted: ${user.id}`);
       } catch (err) {
         console.error(`Failed to delete ${user.id}:`, err);
       }
     } else {
       console.log(`Keeping: ${user.name} (${user.email})`);
     }
  }
}

deleteFakeUsers();
