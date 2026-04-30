import admin from 'firebase-admin';
import { readFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  console.log("No serviceAccountKey.json found. Let me know if there's an admin sdk setup somewhere.");
  process.exit(1);
}

const db = admin.firestore();

async function run() {
  const snap = await db.collection('studySessions').get();
  console.log(`There are ${snap.docs.length} studySessions in total.`);
  if (snap.docs.length > 0) {
      console.log('Last 5 sessions:');
      const docs = snap.docs.slice(-5);
      docs.forEach(d => console.log(d.id, d.data()));
  }
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
