import React from 'react';
import { Award, Zap, Target, Flame, Star, Trophy } from 'lucide-react';
import clsx from 'clsx';

const BADGE_MAP = {
  'first_step': { label: 'İlk Adım', icon: Zap, color: 'text-yellow-400', desc: 'İlk çalışma seansını tamamladın.' },
  'early_bird': { label: 'Erken Kalkan', icon: Flame, color: 'text-orange-500', desc: 'Sabah 08:00den önce çalışmaya başladın.' },
  'night_owl': { label: 'Gece Kuşu', icon: Star, color: 'text-indigo-400', desc: 'Gece 22:00den sonra çalışmaya devam ettin.' },
  'focused': { label: 'Odaklanmış', icon: Target, color: 'text-emerald-400', desc: 'Kesintisiz 120 dakika çalıştın.' },
  'exam_hero': { label: 'Deneme Canavarı', icon: Trophy, color: 'text-primary', desc: 'Son denemede netlerini %20 artırdın.' },
};

export default function BadgeGallery({ userBadges = [] }) {
  const badgeIds = userBadges.map(b => b.id);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">
      {Object.entries(BADGE_MAP).map(([id, info]) => {
        const isUnlocked = badgeIds.includes(id);
        return (
          <div key={id} className={clsx(
            "glass-card p-6 flex flex-col items-center text-center space-y-3 transition-all group",
            isUnlocked ? "border-primary/40 bg-primary/5" : "opacity-40 grayscale"
          )}>
            <div className={clsx(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
              isUnlocked ? "bg-glass " + info.color : "bg-slate-800 text-slate-500"
            )}>
              <info.icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest">{info.label}</h4>
              <p className="text-[8px] font-bold text-text-muted leading-tight mt-1">{info.desc}</p>
            </div>
            {isUnlocked && (
               <div className="absolute top-2 right-2">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
