import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { translations } from './data/translations';
import { playDing, playBuzz, getCurrentHearts, MAX_HEARTS } from './utils/gameLogic';

export default function GameScreen({ lesson, userId, onBack, currentLang, setCurrentLang, userStats }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(() => getCurrentHearts(userStats));
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const audioRef = useRef(null);

  const question = lesson.questions[currentQ];
  const options = question.options;
  const t = translations[currentLang];

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Play blocked:", e));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => playAudio(), 500);
    return () => clearTimeout(timer);
  }, [currentQ]);

  const saveProgress = async (finalScore, finalCoins) => {
    if (!userId) return;
    try {
      // Save progress (upsert)
      const { data: existing } = await supabase
        .from('progress')
        .select('score')
        .eq('user_id', userId)
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      const previousScore = existing?.score || 0;
      const newBestScore = Math.max(previousScore, finalScore);
      const improvement = newBestScore - previousScore;

      await supabase.from('progress').upsert({
        user_id: userId,
        lesson_id: lesson.id,
        score: newBestScore,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });

      // Update user: XP + coins + hearts + streak
      const { data: userData } = await supabase
        .from('users')
        .select('xp, level, coins, streak')
        .eq('id', userId)
        .single();

      if (userData) {
        const newXp = (userData.xp || 0) + Math.max(0, improvement);
        const newLevel = Math.floor(newXp / 100) + 1;
        const newCoins = (userData.coins || 0) + finalCoins;

        // Calculate streak
        const { data: allProgress } = await supabase
          .from('progress')
          .select('completed_at')
          .eq('user_id', userId);

        let streak = 0;
        if (allProgress && allProgress.length > 0) {
          const dates = [...new Set(allProgress.map(p =>
            new Date(p.completed_at).toISOString().split('T')[0]
          ))].sort().reverse();
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (dates[0] === today || dates[0] === yesterday) {
            streak = 1;
            for (let i = 1; i < dates.length; i++) {
              const diff = Math.round((new Date(dates[i-1]) - new Date(dates[i])) / 86400000);
              if (diff === 1) streak++;
              else break;
            }
          }
        }

        await supabase
          .from('users')
          .update({
            xp: newXp,
            level: newLevel,
            coins: newCoins,
            hearts: hearts,
            hearts_updated_at: new Date().toISOString(),
            streak: streak
          })
          .eq('id', userId);

        console.log('Saved:', previousScore, '->', newBestScore, '(+' + improvement + ' XP, +' + finalCoins + ' coins)');
      }
    } catch (err) {
      console.error('saveProgress error:', err);
    }
  };

  const handleSubmit = () => {
    if (!selectedId || isAnswered) return;
    setIsAnswered(true);
    const correct = selectedId === question.correctId;
    setIsCorrect(correct);

    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(correct ? 'success' : 'error');
    } catch (e) {}

    if (correct) {
      playDing();
      setScore(score + 20);
      setCoinsEarned(coinsEarned + 5);
    } else {
      playBuzz();
      setHearts(Math.max(0, hearts - 1));
    }
  };

  const handleNext = async () => {
    if (!isCorrect && hearts <= 0) {
      await saveProgress(score, coinsEarned);
      alert(t.gameOver);
      onBack();
      return;
    }
    if (currentQ < lesson.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedId(null);
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      await saveProgress(score, coinsEarned);
      alert(t.lessonComplete + score + ' XP, +' + coinsEarned + ' coins');
      onBack();
    }
  };

  const getCardClass = (opt) => {
    const isSelected = selectedId === opt.id;
    let base = "cursor-pointer relative bg-surface-container-lowest rounded-xl p-space-xs flex flex-col items-center transition-all duration-200 ";
    if (isAnswered) {
      if (isCorrect && isSelected) return base + "bg-primary-container/20 border-2 border-primary shadow-md";
      if (!isCorrect && isSelected) return base + "bg-error-container/20 border-2 border-error shadow-md";
      if (!isCorrect && opt.id === question.correctId) return base + "bg-primary-container/10 border-2 border-primary/50 shadow-sm";
      return base + "opacity-50 shadow-sm";
    }
    if (isSelected) return base + "bg-primary-container/10 border-2 border-primary -translate-y-0.5 shadow-md";
    return base + "shadow-sm opacity-90";
  };

  const getWordBtnClass = (opt) => {
    const isSelected = selectedId === opt.id;
    let base = "flex flex-col items-center justify-center p-space-sm rounded-xl transition-all duration-150 shadow-sm ";
    if (isAnswered) {
      if (isCorrect && isSelected) return base + "bg-primary text-on-primary shadow-md";
      if (!isCorrect && isSelected) return base + "bg-error text-on-error shadow-md";
      if (!isCorrect && opt.id === question.correctId) return base + "bg-primary/50 text-on-primary shadow-sm";
      return base + "bg-surface-container text-on-surface-variant opacity-50";
    }
    if (isSelected) return base + "bg-primary text-on-primary shadow-md";
    return base + "bg-surface-container-lowest text-on-surface";
  };

  return (
    <div className="flex-1 flex flex-col relative w-full bg-surface pb-20">
      <audio ref={audioRef} src={question.audioUrl} />
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] max-w-lg mx-auto">
        <div className="h-16 px-margin flex items-center justify-between">
          <button onClick={onBack} className="w-11 h-11 -ml-space-xs flex items-center justify-center text-on-surface">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-space-xs">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-low">
              <span className="material-symbols-outlined text-secondary text-[16px]">favorite</span>
              <span className="font-stat-counter text-stat-counter text-secondary text-[13px]">{hearts}</span>
            </div>
            <div className="flex items-center bg-surface-container-high p-0.5 rounded-full shadow-sm">
              {['RU', 'UZ', 'EN'].map(lang => (
                <button key={lang} onClick={() => setCurrentLang(lang)} className={'px-2 py-0.5 rounded-full font-label-sm text-label-sm transition-all ' + (currentLang === lang ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant')}>
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col pt-20 pb-safe px-margin gap-space-sm">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Q {currentQ + 1} of {lesson.questions.length}</span>
            <span className="font-stat-counter text-stat-counter text-tertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[16px]">bolt</span> +20 {t.xp} &middot; +5 💰
            </span>
          </div>
          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5 shadow-inner">
            <div className="h-full bg-primary-container rounded-full relative shadow-sm transition-all duration-500" style={{ width: ((currentQ + 1) / lesson.questions.length) * 100 + '%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setTutorialOpen(!tutorialOpen)}>
            <div className="flex items-center gap-space-xs">
              <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface font-bold">Quest Guide</span>
            </div>
            <span className="material-symbols-outlined text-[20px]">{tutorialOpen ? 'expand_more' : 'chevron_right'}</span>
          </div>
          {tutorialOpen && (
            <div className="mt-space-xs pt-space-xs border-t border-outline-variant/30 text-on-surface-variant">
              <p className="font-body-sm text-body-sm mt-0.5">{t.tutorial}</p>
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-space-md">
            <button onClick={playAudio} className="relative w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[30px] z-10">volume_up</span>
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping pointer-events-none opacity-50"></span>
            </button>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Audio Prompt</span>
              <p className="font-headline-sm text-headline-sm text-on-surface truncate">{t.listenAgain}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          {options.map((opt) => (
            <div key={opt.id} onClick={() => !isAnswered && setSelectedId(opt.id)} className={getCardClass(opt)}>
              <div className="w-full aspect-square rounded-lg overflow-hidden relative bg-surface-container flex items-center justify-center text-6xl">
                {opt.visual}
                <div className={'absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full font-stat-counter text-stat-counter shadow-sm ' + (selectedId === opt.id ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant')}>
                  {opt.id.toUpperCase()}
                </div>
                {isAnswered && opt.id === question.correctId && (
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                )}
                {isAnswered && !isCorrect && selectedId === opt.id && (
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-error flex items-center justify-center text-on-error shadow-md">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </div>
                )}
              </div>
              <span className="font-label-md text-label-md text-on-surface mt-1.5 text-center font-bold">{opt.kanji}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">{t.matchScript}</span>
          <button onClick={() => setShowFurigana(!showFurigana)} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-primary">translate</span>
            <span className="font-label-sm text-label-sm font-bold">{t.furigana}: {showFurigana ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-space-sm select-none">
          {options.map((opt) => {
            const isSelected = selectedId === opt.id;
            const highlight = isSelected || (isAnswered && opt.id === question.correctId);
            return (
              <button key={opt.id} onClick={() => !isAnswered && setSelectedId(opt.id)} className={getWordBtnClass(opt)}>
                {showFurigana && <span className={'text-[11px] leading-none mb-0.5 ' + (highlight ? 'opacity-90' : 'opacity-70')}>{opt.furigana}</span>}
                <span className="font-japanese-card text-headline-sm font-bold tracking-wide">{opt.kanji}</span>
                <span className={'font-body-sm text-body-sm mt-0.5 ' + (highlight ? 'text-on-primary/90' : 'text-on-surface-variant')}>{opt.translation[currentLang]}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={'rounded-xl p-space-sm flex items-center justify-between shadow-sm transition-all duration-300 ' + (isCorrect ? 'bg-primary-fixed/30' : 'bg-error-container/30')}>
            <div className="flex items-center gap-space-xs">
              <div className={'w-9 h-9 rounded-full flex items-center justify-center shadow-sm ' + (isCorrect ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error text-on-error')}>
                <span className="material-symbols-outlined text-[22px]">{isCorrect ? 'stars' : 'close'}</span>
              </div>
              <div className="flex flex-col">
                <span className={'font-headline-sm text-headline-sm font-extrabold ' + (isCorrect ? 'text-primary' : 'text-error')}>{isCorrect ? t.correct : t.incorrect}</span>
                <span className="font-label-sm text-label-sm text-tertiary font-bold">{isCorrect ? '+20 XP, +5 💰' : ''}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-space-sm pt-space-xs">
          {!isAnswered ? (
            <>
              <button onClick={onBack} className="px-4 py-3.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md font-bold">{t.skip}</button>
              <button onClick={handleSubmit} disabled={!selectedId} className={'flex-1 py-3.5 rounded-xl font-headline-sm flex items-center justify-center gap-space-xs shadow-md transition-all ' + (selectedId ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant')}>
                <span className="tracking-wide">{t.check}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </>
          ) : (
            <button onClick={handleNext} className="flex-1 py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm flex items-center justify-center gap-space-xs shadow-md transition-all">
              <span className="tracking-wide">{currentQ < lesson.questions.length - 1 ? t.continue : t.finish}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

