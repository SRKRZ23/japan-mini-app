import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { translations } from './data/translations';
import { lessons } from './data/lessons';

export default function ProfileScreen({ userId, userProgress, onBack, currentLang, setCurrentLang }) {
  const [profile, setProfile] = useState(null);
  const t = translations[currentLang];

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from('users').select('*').eq('id', userId).single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [userId]);

  const completedCount = Object.keys(userProgress).length;
  const totalStars = Object.entries(userProgress).reduce((sum, [lessonId, progress]) => {
    const lessonData = lessons.find(l => l.id === parseInt(lessonId));
    const maxScore = lessonData ? lessonData.questions.length * 20 : 100;
    const percent = (progress.score / maxScore) * 100;
    if (percent >= 90) return sum + 3;
    if (percent >= 60) return sum + 2;
    return sum + 1;
  }, 0);

  return (
    <div className="flex-1 flex flex-col relative w-full bg-surface pb-20">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] max-w-lg mx-auto">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button onClick={onBack} className="w-11 h-11 -ml-space-xs flex items-center justify-center text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-headline-sm text-headline-sm tracking-tight">{t.profile}</h1>
          </div>
          <div className="flex items-center bg-surface-container-high p-0.5 rounded-full shadow-sm">
            {['RU', 'UZ', 'EN'].map(lang => (
              <button key={lang} onClick={() => setCurrentLang(lang)} className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm transition-all ${currentLang === lang ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant'}`}>
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-20 pb-safe px-margin gap-space-md">
        <div className="bg-primary text-on-primary rounded-xl p-space-md shadow-md flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-3xl shrink-0">
            🥷
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="font-headline-sm tracking-tight">{profile?.username || 'Anonymous'}</h2>
            <span className="font-label-sm text-label-sm text-inverse-primary uppercase tracking-wider">
              {t.level} {profile?.level || 1} &middot; {t.beginner}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-tertiary text-[32px]">bolt</span>
            <span className="font-stat-counter text-headline-md text-tertiary font-extrabold">{profile?.xp || 0}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{t.xp}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-primary text-[32px]">stars</span>
            <span className="font-stat-counter text-headline-md text-primary font-extrabold">{totalStars}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Stars</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-secondary text-[32px]">local_fire_department</span>
            <span className="font-stat-counter text-headline-md text-secondary font-extrabold">{profile?.streak || 0}d</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{t.streak}</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col items-center">
            <span className="material-symbols-outlined text-tertiary-container text-[32px]">check_circle</span>
            <span className="font-stat-counter text-headline-md text-tertiary-container font-extrabold">{completedCount}/{lessons.length}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Lessons</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <h3 className="font-headline-sm text-headline-sm mb-3">Achievements</h3>
          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-3 p-2 rounded-lg ${completedCount >= 1 ? 'bg-primary-fixed/30' : 'bg-surface-container opacity-50'}`}>
              <span className="text-2xl">🎯</span>
              <div className="flex flex-col">
                <span className="font-label-md text-on-surface font-bold">First Steps</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Complete your first lesson</span>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-2 rounded-lg ${totalStars >= 9 ? 'bg-primary-fixed/30' : 'bg-surface-container opacity-50'}`}>
              <span className="text-2xl">⭐</span>
              <div className="flex flex-col">
                <span className="font-label-md text-on-surface font-bold">Star Collector</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Earn 9 stars total</span>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-2 rounded-lg ${(profile?.xp || 0) >= 100 ? 'bg-primary-fixed/30' : 'bg-surface-container opacity-50'}`}>
              <span className="text-2xl">🏆</span>
              <div className="flex flex-col">
                <span className="font-label-md text-on-surface font-bold">XP Hunter</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Earn 100 XP</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

