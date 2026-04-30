const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Replace with your Firebase config from src/firebase.js if needed
// For now, I'll use a placeholder structure
const firebaseConfig = {
  // Config would go here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const posts = [
  {
    title: "YKS'de Son 3 Ay: Stres Yönetimi ve Odaklanma",
    category: "MOTİVASYON",
    excerpt: "Sınav yaklaştıkça artan kaygıyı nasıl kontrol edebilirsin? İşte uzman koçlarımızdan pratik tavsiyeler.",
    content: "Uzun bir içerik buraya gelecek...",
    createdAt: serverTimestamp()
  },
  {
    title: "Matematik Netlerini Artırmanın 5 Altın Kuralı",
    category: "STRATEJİ",
    excerpt: "Temel kavramlardan türeve kadar matematikte hız kazanmanın ve hata payını düşürmenin yolları.",
    content: "Uzun bir içerik buraya gelecek...",
    createdAt: serverTimestamp()
  },
  {
    title: "Verimli Ders Çalışma Teknikleri: Pomodoro vs. Flow",
    category: "REHBERLİK",
    excerpt: "Hangi teknik senin öğrenme tarzına daha uygun? Bilimsel araştırmalarla verimlilik rehberi.",
    content: "Uzun bir içerik buraya gelecek...",
    createdAt: serverTimestamp()
  }
];

async function seed() {
  for (const post of posts) {
    await addDoc(collection(db, 'blogPosts'), post);
    console.log(`Added: ${post.title}`);
  }
}

seed();
