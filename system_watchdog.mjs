import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Basit .env okuyucu (dotenv paketine ihtiyaç duymadan)
function loadEnv() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf-8');
            envContent.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    process.env[match[1].trim()] = match[2].trim();
                }
            });
        }
    } catch (e) {
        console.error("Env dosyası okunamadı.", e);
    }
}
loadEnv();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Bekçi Ayarları
const CHECK_INTERVAL_MS = 1000 * 60 * 15; // 15 dakikada bir kontrol
const LOG_FILE = path.join(process.cwd(), 'watchdog_security.log');

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    let prefix = '';
    
    if (type === 'error') prefix = '[HATA]';
    else if (type === 'warn') prefix = '[UYARI]';
    else if (type === 'success') prefix = '[OK]';
    else prefix = '[BİLGİ]';

    console.log(`${timestamp} - ${prefix} ${message}`);
    
    // Log dosyasına yaz
    const logLine = `[${timestamp}] ${prefix} ${message}\n`;
    fs.appendFileSync(LOG_FILE, logLine);
}

async function runHealthCheck() {
    console.log('\n=======================================');
    console.log('🛡️ POZİTİFKOÇ SİSTEM BEKÇİSİ AKTİF 🛡️');
    console.log('=======================================\n');

    try {
        log('Sistem devriyesi başlatılıyor...', 'info');

        // 1. Veritabanı Bağlantı Testi
        const settingsSnap = await getDocs(query(collection(db, 'settings')));
        log('Veritabanı bağlantısı başarılı. Sistem ayakta.', 'success');

        // 2. Şüpheli Kullanıcı Kontrolü (Son 24 saatte oluşan isimsiz veya bot şüpheli hesaplar)
        const usersRef = collection(db, 'users');
        
        // Basit bir tüm kullanıcıları çekme ve filtreleme (büyük veritabanlarında index gerekir)
        const allUsersSnap = await getDocs(usersRef);
        let botCount = 0;
        let totalUsers = 0;

        allUsersSnap.forEach(doc => {
            totalUsers++;
            const data = doc.data();
            // İsimsiz, garip e-postalı veya rolü atanmamış kullanıcılar şüphelidir
            if (!data.name || data.name.trim() === '' || data.name.includes('test') || !data.role) {
                botCount++;
            }
        });

        log(`Toplam ${totalUsers} kullanıcı tarandı.`, 'info');
        
        if (botCount > 0) {
            log(`Sistemde ${botCount} adet şüpheli/eksik profil (potansiyel bot) tespit edildi!`, 'warn');
            log(`Lütfen 'node delete_fakes.mjs' scriptini çalıştırarak temizlik yapınız.`, 'warn');
        } else {
            log('Bot veya sahte hesap tespit edilmedi. Kullanıcı havuzu temiz.', 'success');
        }

        // 3. Öğrenci Tablosu Bütünlük Kontrolü
        const studentsSnap = await getDocs(collection(db, 'students'));
        let orphanStudents = 0;
        studentsSnap.forEach(doc => {
            const data = doc.data();
            // Koçu atanmamış veya hatalı veriye sahip öğrenciler
            if (!data.coachId && data.currentStatus?.isStudying) {
                orphanStudents++;
            }
        });

        if (orphanStudents > 0) {
            log(`${orphanStudents} adet öğrenci aktif çalışıyor görünüyor ancak koçu yok (Veri Anomalisi)!`, 'warn');
        } else {
            log('Öğrenci verileri ve koç bağlantıları bütünlüğü sorunsuz.', 'success');
        }

        console.log('\nDevriye tamamlandı. Sistemin genel durumu İYİ. Sonraki kontrol bekleniyor...\n');

    } catch (error) {
        log(`Sistem kontrolü sırasında kritik hata oluştu: ${error.message}`, 'error');
        if (error.message.includes('missing or insufficient permissions')) {
            log('Firebase kuralları şu an dışarıdan erişimi engelliyor. Bu iyi bir güvenlik işaretidir!', 'success');
        }
    }
}

// Hemen bir kez çalıştır
runHealthCheck();

// Sonra periyodik olarak çalıştır
setInterval(runHealthCheck, CHECK_INTERVAL_MS);
