import { useNavigate } from 'react-router-dom';
import { 
  Users, Video, ListTodo, CheckSquare, 
  MessageSquareText, LineChart, Bot, BookOpen 
} from 'lucide-react';

const menuItems = [
  {
    icon: Users,
    title: 'Öğrenci Kayıt ve Takip',
    desc: 'Her öğrenciye özel hesap oluşturun. Gelişim, deneme sonuçları ve plan takibini detaylıca yönetin.',
    path: '/coach/students'
  },
  {
    icon: Video,
    title: 'Canlı Ders Planlama',
    desc: 'Zoom, Google Meet gibi platformlarla entegre ders planları oluşturun. Bağlantı ve açıklamaları öğrencilere özel yapın.',
    path: '/coach/live-lessons'
  },
  {
    icon: ListTodo,
    title: 'Haftalık Ders Planı',
    desc: 'Konu, kaynak, soru sayısı gibi detaylarla öğrencilerle ortak çalışma takvimi hazırlayın ve takibini yapın.',
    path: '/coach/weekly-plan'
  },
  {
    icon: CheckSquare,
    title: 'Görev ve Plan Takibi',
    desc: 'Öğrencilerin planı tamamlayıp tamamlamadığını kontrol edin, koç onayıyla çift yönlü izleme sağlayın.',
    path: '/coach/tasks'
  },
  {
    icon: MessageSquareText,
    title: 'İletişim ve Notlar',
    desc: 'Görüşme notları, oturum tarihleri ve sonraki randevular sistemde kayıtlı. Planlı takip artık çok kolay.',
    path: '/coach/notes'
  },
  {
    icon: LineChart,
    title: 'Detaylı Deneme Analizi',
    desc: 'Online denemeler ekleyin. Doğru-yanlış, net, boş analizleriyle eksikleri tespit edin.',
    path: '/coach/exams'
  },
  {
    icon: Bot,
    title: 'Yapay Zekâ ile Çözüm',
    desc: 'Öğrencinin yapay zeka ile soru çözme geçmişini takip edin, eksiklerini akıllı önerilerle kapatın.',
    path: '/coach/ai'
  },
  {
    icon: BookOpen,
    title: 'Materyal ve Serbest Çalışma',
    desc: 'Öğrencinin motivasyonunu artıracak görseller, videolar ve PDF dosyaları paylaşın.',
    path: '/coach/library'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      <header className="mb-10 text-center xl:text-left">
        <h2 className="text-3xl font-bold text-white tracking-tight">Koç Ana Menü</h2>
        <p className="text-textMuted mt-2 text-lg">Tüm modüllere tek bir ekrandan, hızla erişin.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems.map((item, i) => (
          <div 
            key={i} 
            onClick={() => navigate(item.path)}
            className="bg-surface/60 backdrop-blur-md border border-border/50 rounded-2xl p-8 hover:bg-surface/80 hover:border-primary/40 transition-all duration-300 flex flex-col items-center text-center cursor-pointer group shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
              <item.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
