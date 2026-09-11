import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { translations } from './data/translations';

export default function LeaderboardScreen({ userId, onBack, currentLang, setCurrentLang }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = translations[currentLang];

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, xp, level')
        .order('xp', { ascending: false })
        .limit(50);

      if (!error && data) {
        setLeaders(data);
      }
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  return (
    <div className="flex-1 flex flex-col relative w-full bg-surface pb-20">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] max-w-lg mx-auto">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button onClick={onBack} className="w-11 h-11 -ml-space-xs flex items-center justify-center text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-headline-sm text-headline-sm tracking-tight">{t.leaderboard}</h1>
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

      <main className="flex-1 flex flex-col pt-20 pb-safe px-margin gap-space-sm">
        {loading ? (
          <div className="text-center py-10">{t.loading}</div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[40px_1fr_80px] gap-2 px-3 py-1 text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
              <span>#</span>
              <span>{t.player}</span>
              <span className="text-right">{t.xp}</span>
            </div>
            {leaders.map((leader, index) => {
              const isMe = leader.id === userId;
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1);
              return (
                <div key={leader.id} className={`grid grid-cols-[40px_1fr_80px] gap-2 items-center px-3 py-3 rounded-xl shadow-sm ${isMe ? 'bg-primary-fixed/50 border border-primary/20' : 'bg-surface-container-lowest'}`}>
                  <span className="font-stat-counter text-headline-sm text-center">{medal}</span>
                  <div className="flex flex-col">
                    <span className={`font-label-md ${isMe ? 'text-primary font-bold' : 'text-on-surface'}`}>
                      {leader.username || 'Anonymous'} {isMe && `(${t.you})`}
                    </span>
                    <span className="font-label-sm text-on-surface-variant">{t.level} {leader.level}</span>
                  </div>
                  <span className="font-stat-counter text-right text-tertiary">{leader.xp} {t.xp}</span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

