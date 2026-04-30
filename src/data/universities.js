const COMMON_DEPARTMENTS = [
  // Eğitim Bilimleri / Öğretmenlikler
  "Almanca Öğretmenliği", "Arapça Öğretmenliği", "Beden Eğitimi ve Spor Öğretmenliği", "Bilgisayar ve Öğretim Teknolojileri Öğretmenliği", 
  "Biyoloji Öğretmenliği", "Coğrafya Öğretmenliği", "Fen Bilgisi Öğretmenliği", "Fizik Öğretmenliği", "Fransızca Öğretmenliği", 
  "İlköğretim Matematik Öğretmenliği", "İngilizce Öğretmenliği", "Japonca Öğretmenliği", "Kimya Öğretmenliği", 
  "Matematik Öğretmenliği", "Okul Öncesi Öğretmenliği", "Özel Eğitim Öğretmenliği", "Rehberlik ve Psikolojik Danışmanlık (PDR)", 
  "Sınıf Öğretmenliği", "Sosyal Bilgiler Öğretmenliği", "Tarih Öğretmenliği", "Türk Dili ve Edebiyatı Öğretmenliği", "Türkçe Öğretmenliği",
  
  // Tıp ve Sağlık Bilimleri
  "Acil Yardım ve Afet Yönetimi", "Beslenme ve Diyetetik", "Çocuk Gelişimi", "Dil ve Konuşma Terapisi", "Diş Hekimliği", "Ebelik", 
  "Eczacılık", "Ergoterapi", "Fizyoterapi ve Rehabilitasyon", "Gerontoloji", "Hemşirelik", "Odyoloji", "Ortez ve Protez", 
  "Perfüzyon", "Sağlık Yönetimi", "Sosyal Hizmet", "Tıp", "Veteriner", "Zootekni",

  // Mühendislik ve Doğa Bilimleri
  "Adli Bilişim Mühendisliği", "Ağaç İşleri Endüstri Mühendisliği", "Astronomi ve Uzay Bilimleri", "Bilgisayar Mühendisliği", 
  "Bilişim Sistemleri Mühendisliği", "Biyomedikal Mühendisliği", "Biyomühendislik", "Biyoteknoloji", "Cevher Hazırlama Mühendisliği", 
  "Çevre Mühendisliği", "Deniz Ulaştırma İşletme Mühendisliği", "Deri Mühendisliği", "Elektrik Mühendisliği", 
  "Elektrik-Elektronik Mühendisliği", "Elektronik ve Haberleşme Mühendisliği", "Endüstri Mühendisliği", "Endüstriyel Tasarım Mühendisliği", 
  "Enerji Sistemleri Mühendisliği", "Fizik Mühendisliği", "Gemi İnşaatı ve Gemi Makineleri Mühendisliği", "Gemi Makineleri İşletme Mühendisliği", 
  "Geomatik Mühendisliği", "Gıda Mühendisliği", "Harita Mühendisliği", "Havacılık ve Uzay Mühendisliği", "İmalat Mühendisliği", 
  "İnşaat Mühendisliği", "İşletme Mühendisliği", "Jeofizik Mühendisliği", "Jeoloji Mühendisliği", "Kimya Mühendisliği", 
  "Kontrol ve Otomasyon Mühendisliği", "Maden Mühendisliği", "Makine Mühendisliği", "Malzeme Bilimi ve Mühendisliği", 
  "Mekatronik Mühendisliği", "Metalurji ve Malzeme Mühendisliği", "Meteoroloji Mühendisliği", "Mimarlık", "Nükleer Enerji Mühendisliği", 
  "Orman Endüstrisi Mühendisliği", "Orman Mühendisliği", "Otomotiv Mühendisliği", "Petrol ve Doğalgaz Mühendisliği", 
  "Peyzaj Mimarlığı", "Raylı Sistemler Mühendisliği", "Su Ürünleri Mühendisliği", "Tarım Makineleri ve Teknolojileri Mühendisliği", 
  "Tarımsal Yapılar ve Sulama", "Tekstil Mühendisliği", "Uçak Mühendisliği", "Uzay Mühendisliği", "Yapay Zeka Mühendisliği", "Yapay Zeka ve Veri Mühendisliği", "Yazılım Mühendisliği",

  // İktisadi ve İdari Bilimler
  "Aktüerya Bilimleri", "Bankacılık ve Finans", "Çalışma Ekonomisi ve Endüstri İlişkileri", "Ekonometri", "Ekonomi", "Ekonomi ve Finans", 
  "Gümrük İşletme", "Havacılık Yönetimi", "İktisat", "İnsan Kaynakları Yönetimi", "İslam İktisadı ve Finans", "İşletme", 
  "Kamu Yönetimi", "Lojistik Yönetimi", "Maliye", "Muhasebe ve Finans Yönetimi", "Pazarlama", "Sağlık Yönetimi", "Sermaye Piyasası", 
  "Sigortacılık ve Risk Yönetimi", "Siyaset Bilimi ve Kamu Yönetimi", "Siyaset Bilimi ve Uluslararası İlişkiler", "Uluslararası Finans", 
  "Uluslararası İlişkiler", "Uluslararası Ticaret ve İşletmecilik", "Uluslararası Ticaret ve Lojistik", "Yönetim Bilişim Sistemleri (YBS)",

  // Hukuk ve Sosyal Bilimler
  "Arkeoloji", "Arkeoloji ve Sanat Tarihi", "Bilgi ve Belge Yönetimi", "Coğrafya", "Çağdaş Türk Lehçeleri ve Edebiyatları", 
  "Felsefe", "Hukuk", "İlahiyat", "İslami İlimler", "Psikoloji", "Sanat Tarihi", "Sosyoloji", "Tarih", "Türk Dili ve Edebiyatı", "Zaza Dili ve Edebiyatı",

  // Temel Bilimler
  "Biyoloji", "Fizik", "İstatistik", "İstatistik ve Bilgisayar Bilimleri", "Kimya", "Matematik", "Matematik ve Bilgisayar Bilimleri", "Moleküler Biyoloji ve Genetik",

  // İletişim, Sanat ve Tasarım
  "Animasyon", "Çizgi Film ve Animasyon", "Dijital Oyun Tasarımı", "Endüstriyel Tasarım", "Gastronomi ve Mutfak Sanatları", 
  "Gazetecilik", "Görsel İletişim Tasarımı", "Grafik Tasarım", "Halkla İlişkiler ve Reklamcılık", "Halkla İlişkiler ve Tanıtım", 
  "İç Mimarlık", "İç Mimarlık ve Çevre Tasarımı", "İletişim Bilimleri", "İletişim Tasarımı ve Yönetimi", "Kentsel Tasarım ve Peyzaj Mimarlığı", 
  "Medya ve Görsel Sanatlar", "Moda Tasarımı", "Radyo, Televizyon ve Sinema", "Reklamcılık", "Sanat ve Kültür Yönetimi", 
  "Şehir ve Bölge Planlama", "Takı Tasarımı", "Tekstil ve Moda Tasarımı", "Tiyatro Eleştirmenliği ve Dramaturji", "Yeni Medya", "Yeni Medya ve İletişim",

  // Yabancı Diller
  "Alman Dili ve Edebiyatı", "Amerikan Kültürü ve Edebiyatı", "Arap Dili ve Edebiyatı", "Arnavut Dili ve Edebiyatı", "Boşnak Dili ve Edebiyatı", 
  "Bulgar Dili ve Edebiyatı", "Çeviribilim", "Çin Dili ve Edebiyatı", "Ermeni Dili ve Edebiyatı", "Fars Dili ve Edebiyatı", 
  "Fransız Dili ve Edebiyatı", "Gürcü Dili ve Edebiyatı", "Hindoloji", "Hititoloji", "Hungaroloji", "İbrani Dili ve Edebiyatı", 
  "İngiliz Dilbilimi", "İngiliz Dili ve Edebiyatı", "İspanyol Dili ve Edebiyatı", "İtalyan Dili ve Edebiyatı", "Japon Dili ve Edebiyatı", 
  "Karşılaştırmalı Edebiyat", "Kore Dili ve Edebiyatı", "Latin Dili ve Edebiyatı", "Leh Dili ve Edebiyatı", "Mütercim-Tercümanlık", 
  "Rus Dili ve Edebiyatı", "Sinoloji", "Sümeroloji", "Urdu Dili ve Edebiyatı", "Yunan Dili ve Edebiyatı",

  // Denizcilik ve Spor
  "Antrenörlük Eğitimi", "Beden Eğitimi ve Spor Yüksekokulu", "Deniz Ulaştırma İşletme Mühendisliği", "Denizcilik İşletmeleri Yönetimi", 
  "Gemi Makineleri İşletme Mühendisliği", "Rekreasyon", "Spor Yöneticiliği"
].sort();

// Türkiye'deki tüm ana devlet ve vakıf üniversitelerinin genişletilmiş tam listesi
const ALL_TURKISH_UNIVERSITIES = [
  "Abant İzzet Baysal Üniversitesi", "Abdullah Gül Üniversitesi", "Acıbadem Üniversitesi", "Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi", 
  "Adıyaman Üniversitesi", "Afyon Kocatepe Üniversitesi", "Ağrı İbrahim Çeçen Üniversitesi", "Akdeniz Üniversitesi", "Aksaray Üniversitesi", 
  "Alanya Alaaddin Keykubat Üniversitesi", "Altınbaş Üniversitesi", "Amasya Üniversitesi", "Anadolu Üniversitesi", "Ankara Hacı Bayram Veli Üniversitesi", 
  "Ankara Medipol Üniversitesi", "Ankara Sosyal Bilimler Üniversitesi", "Ankara Üniversitesi", "Ankara Yıldırım Beyazıt Üniversitesi", 
  "Antalya Bilim Üniversitesi", "Ardahan Üniversitesi", "Artvin Çoruh Üniversitesi", "Aydın Adnan Menderes Üniversitesi", "Atılım Üniversitesi", 
  "Atatürk Üniversitesi", "Avrasya Üniversitesi", "Bahçeşehir Üniversitesi", "Balıkesir Üniversitesi", "Bandırma Onyedi Eylül Üniversitesi", 
  "Bartın Üniversitesi", "Başkent Üniversitesi", "Batman Üniversitesi", "Bayburt Üniversitesi", "Beykent Üniversitesi", "Bilecik Şeyh Edebali Üniversitesi", 
  "Bingöl Üniversitesi", "Biruni Üniversitesi", "Bitlis Eren Üniversitesi", "Boğaziçi Üniversitesi", "Bozok Üniversitesi", "Bursa Teknik Üniversitesi", 
  "Bursa Uludağ Üniversitesi", "Canik Başarı Üniversitesi", "Çağ Üniversitesi", "Çanakkale Onsekiz Mart Üniversitesi", "Çankaya Üniversitesi", 
  "Çankırı Karatekin Üniversitesi", "Çukurova Üniversitesi", "Dicle Üniversitesi", "Doğuş Üniversitesi", "Dokuz Eylül Üniversitesi", 
  "Düzce Üniversitesi", "Ege Üniversitesi", "Erciyes Üniversitesi", "Erzincan Binali Yıldırım Üniversitesi", "Erzurum Teknik Üniversitesi", 
  "Eskişehir Osmangazi Üniversitesi", "Eskişehir Teknik Üniversitesi", "Fatih Sultan Mehmet Vakıf Üniversitesi", "Fenerbahçe Üniversitesi", 
  "Fırat Üniversitesi", "Galatasaray Üniversitesi", "Gazi Üniversitesi", "Gaziantep Üniversitesi", "Gaziosmanpaşa Üniversitesi", 
  "Gebze Teknik Üniversitesi", "Giresun Üniversitesi", "Gümüşhane Üniversitesi", "Hacettepe Üniversitesi", "Hakkari Üniversitesi", 
  "Haliç Üniversitesi", "Harran Üniversitesi", "Hasan Kalyoncu Üniversitesi", "Hitit Üniversitesi", "Iğdır Üniversitesi", "Isparta Uygulamalı Bilimler Üniversitesi", 
  "Işık Üniversitesi", "İbn Haldun Üniversitesi", "İhsan Doğramacı Bilkent Üniversitesi", "İnönü Üniversitesi", "İskenderun Teknik Üniversitesi", 
  "İstanbul 29 Mayıs Üniversitesi", "İstanbul Arel Üniversitesi", "İstanbul Atlas Üniversitesi", "İstanbul Aydın Üniversitesi", 
  "İstanbul Ayvansaray Üniversitesi", "İstanbul Bilgi Üniversitesi", "İstanbul Bilim Üniversitesi", "İstanbul Esenyurt Üniversitesi", 
  "İstanbul Galata Üniversitesi", "İstanbul Gedik Üniversitesi", "İstanbul Gelişim Üniversitesi", "İstanbul Kent Üniversitesi", 
  "İstanbul Kültür Üniversitesi", "İstanbul Medeniyet Üniversitesi", "İstanbul Medipol Üniversitesi", "İstanbul Okan Üniversitesi", 
  "İstanbul Rumeli Üniversitesi", "İstanbul Sabahattin Zaim Üniversitesi", "İstanbul Şehir Üniversitesi", "İstanbul Teknik Üniversitesi (İTÜ)", 
  "İstanbul Ticaret Üniversitesi", "İstanbul Üniversitesi", "İstanbul Üniversitesi-Cerrahpaşa", "İstanbul Yeni Yüzyıl Üniversitesi", 
  "İstinye Üniversitesi", "İzmir Bakırçay Üniversitesi", "İzmir Demokrasi Üniversitesi", "İzmir Ekonomi Üniversitesi", "İzmir Katip Çelebi Üniversitesi", 
  "İzmir Yüksek Teknoloji Enstitüsü", "Kadir Has Üniversitesi", "Kafkas Üniversitesi", "Kahramanmaraş İstiklal Üniversitesi", "Kahramanmaraş Sütçü İmam Üniversitesi", 
  "Karabük Üniversitesi", "Karadeniz Teknik Üniversitesi (KTÜ)", "Karamanoğlu Mehmetbey Üniversitesi", "Kastamonu Üniversitesi", "Kayseri Üniversitesi", 
  "Kırıkkale Üniversitesi", "Kırklareli Üniversitesi", "Kırşehir Ahi Evran Üniversitesi", "Kilis 7 Aralık Üniversitesi", "Kocaeli Üniversitesi", 
  "Koç Üniversitesi", "Konya Gıda ve Tarım Üniversitesi", "Konya Teknik Üniversitesi", "KTO Karatay Üniversitesi", "Kütahya Dumlupınar Üniversitesi", 
  "Kütahya Sağlık Bilimleri Üniversitesi", "Lokman Hekim Üniversitesi", "Malatya Turgut Özal Üniversitesi", "Maltepe Üniversitesi", "Manisa Celal Bayar Üniversitesi", 
  "Mardin Artuklu Üniversitesi", "Marmara Üniversitesi", "MEF Üniversitesi", "Mersin Üniversitesi", "Mimar Sinan Güzel Sanatlar Üniversitesi", 
  "Muğla Sıtkı Koçman Üniversitesi", "Munzur Üniversitesi", "Muş Alparslan Üniversitesi", "Necmettin Erbakan Üniversitesi", "Nevşehir Hacı Bektaş Veli Üniversitesi", 
  "Niğde Ömer Halisdemir Üniversitesi", "Nuh Naci Yazgan Üniversitesi", "Ondokuz Mayıs Üniversitesi", "Ordu Üniversitesi", "Orta Doğu Teknik Üniversitesi (ODTÜ)", 
  "Osmaniye Korkut Ata Üniversitesi", "Ostim Teknik Üniversitesi", "Özyeğin Üniversitesi", "Pamukkale Üniversitesi", "Piri Reis Üniversitesi", 
  "Recep Tayyip Erdoğan Üniversitesi", "Sabancı Üniversitesi", "Sağlık Bilimleri Üniversitesi", "Sakarya Uygulamalı Bilimler Üniversitesi", "Sakarya Üniversitesi", 
  "Samsun Üniversitesi", "Sanko Üniversitesi", "Selçuk Üniversitesi", "Siirt Üniversitesi", "Sinop Üniversitesi", "Sivas Cumhuriyet Üniversitesi", 
  "Süleyman Demirel Üniversitesi", "Şırnak Üniversitesi", "Tarsus Üniversitesi", "TED Üniversitesi", "Tekirdağ Namık Kemal Üniversitesi", 
  "TOBB Ekonomi ve Teknoloji Üniversitesi", "Tokat Gaziosmanpaşa Üniversitesi", "Trabzon Üniversitesi", "Trakya Üniversitesi", "Türk-Alman Üniversitesi", 
  "Ufuk Üniversitesi", "Uşak Üniversitesi", "Üsküdar Üniversitesi", "Van Yüzüncü Yıl Üniversitesi", "Yalova Üniversitesi", "Yaşar Üniversitesi", 
  "Yeditepe Üniversitesi", "Yıldız Teknik Üniversitesi (YTÜ)", "Yüksek İhtisas Üniversitesi", "Zonguldak Bülent Ecevit Üniversitesi"
];

const builtUniversities = {};
ALL_TURKISH_UNIVERSITIES.sort().forEach(uni => {
  builtUniversities[uni] = COMMON_DEPARTMENTS;
});

// En üste Diğer / Hedefsiz seçeneğini ekleyelim
export const UNIVERSITIES = {
  "Diğer / Hedefsiz": ["Diğer / Hedefsiz"],
  "LİSELER (LGS)": [
    "Fen Lisesi", 
    "Anadolu Lisesi", 
    "Sosyal Bilimler Lisesi", 
    "Anadolu İmam Hatip Lisesi", 
    "Mesleki ve Teknik Anadolu Lisesi", 
    "Özel Lise", 
    "Diğer / Hedefsiz"
  ],
  ...builtUniversities
};
