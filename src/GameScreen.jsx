import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { translations } from './data/translations';

export default function GameScreen({ lesson, userId, onBack, currentLang, setCurrentLang }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
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

  const saveProgress = async (finalScore) => {
    if (!userId) return;
    try {
      await supabase.from('progress').insert({ user_id: userId, lesson_id: lesson.id, score: finalScore });
      const { data: userData } = await supabase.from('users').select('xp, level').eq('id', userId).single();
      if (userData) {
        const newXp = userData.xp + finalScore;
        const newLevel = Math.floor(newXp / 100) + 1;
        await supabase.from('users').update({ xp: newXp, level: newLevel }).eq('id', userId);
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleSubmit = () => {
    if (!selectedId || isAnswered) return;
    setIsAnswered(true);
    const correct = selectedId === question.correctId;
    setIsCorrect(correct);
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(correct ? 'success' : 'error');

    if (correct) {
      setScore(score + 20);
    } else {
      setHearts(hearts - 1);
    }
  };

  const handleNext = () => {
    if (!isCorrect && hearts <= 0) {
      saveProgress(score);
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
      saveProgress(score);
      alert(t.lessonComplete + score);
      onBack();
    }
  };

  return (
    <div className="flex-1 flex flex-col relative w-full bg-surface pb-20">
      <audio ref={audioRef} src={question.audioUrl} />
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] max-w-lg mx-auto">
        <div className="h-16 px-margin flex items-center justify-between">
          <button onClick={onBack} className="w-11 h-11 -ml-space-xs flex items-center justify-center text-on-surface hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-space-xs">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-low">
              <span className="material-symbols-outlined text-secondary text-[16px]">favorite</span>
              <span className="font-stat-counter text-stat-counter text-secondary text-[13px]">{hearts}</span>
            </div>
            <div className="flex items-center bg-surface-container-high p-0.5 rounded-full shadow-sm">
              {['RU', 'UZ', 'EN'].map(lang => (
                <button key={lang} onClick={() => setCurrentLang(lang)} className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm transition-all ${currentLang === lang ? 'bg-surface-container-lowest text-primary shadow-sm font-bold' : 'text-on-surface-variant'}`}>
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
              <span className="material-symbols-outlined text-[16px]">bolt</span> +20 {t.xp}
            </span>
          </div>
          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5 shadow-inner">
            <div className="h-full bg-primary-container rounded-full relative shadow-sm transition-all duration-500" style={{ width: `${((currentQ + 1) / lesson.questions.length) * 100}%` }}></div>
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
          {options.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <div key={opt.id} onClick={() => !isAnswered && setSelectedId(opt.id)} className={`cursor-pointer relative bg-surface-container-lowest rounded-xl p-space-xs flex flex-col items-center transition-all duration-200 shadow-md ${isSelected ? 'bg-primary-container/10 -translate-y-0.5' : 'shadow-sm opacity-90'}`}>
                <div className="w-full aspect-square rounded-lg overflow-hidden relative bg-surface-container flex items-center justify-center text-6xl">
                  {opt.visual}
                  <div className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full font-stat-counter text-stat-counter shadow-sm ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                    {opt.id.toUpperCase()}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                  )}
                </div>
                <span className="font-label-md text-label-md text-on-surface mt-1.5 text-center font-bold">{opt.kanji}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">{t.matchScript}</span>
          <button onClick={() => setShowFurigana(!showFurigana)} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-primary">translate</span>
            <span className="font-label-sm text-label-sm font-bold">{t.furigana}: {showFurigana ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-space-sm select-none">
          {options.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <button key={opt.id} onClick={() => !isAnswered && setSelectedId(opt.id)} className={`flex flex-col items-center justify-center p-space-sm rounded-xl transition-all duration-150 active:translate-y-0.5 shadow-sm ${isSelected ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'}`}>
                {showFurigana && <span className={`text-[11px] leading-none mb-0.5 ${isSelected ? 'opacity-90' : 'opacity-70'}`}>{opt.furigana}</span>}
                <span className="font-japanese-card text-headline-sm font-bold tracking-wide">{opt.kanji}</span>
                <span className={`font-body-sm text-body-sm mt-0.5 ${isSelected ? 'text-on-primary/90' : 'text-on-surface-variant'}`}>{opt.translation[currentLang]}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`rounded-xl p-space-sm flex items-center justify-between shadow-sm transition-all duration-300 ${isCorrect ? 'bg-primary-fixed/30' : 'bg-error-container/30'}`}>
            <div className="flex items-center gap-space-xs">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${isCorrect ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error text-on-error'}`}>
                <span className="material-symbols-outlined text-[22px]">{isCorrect ? 'stars' : 'close'}</span>
              </div>
              <div className="flex flex-col">
                <span className={`font-headline-sm text-headline-sm font-extrabold ${isCorrect ? 'text-primary' : 'text-error'}`}>{isCorrect ? t.correct : t.incorrect}</span>
                <span className="font-label-sm text-label-sm text-tertiary font-bold">{isCorrect ? t.reward : ''}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-space-sm pt-space-xs">
          {!isAnswered ? (
            <>
              <button onClick={onBack} className="px-4 py-3.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md font-bold transition-transform active:scale-95 hover:bg-surface-container-high">{t.skip}</button>
              <button onClick={handleSubmit} disabled={!selectedId} className={`flex-1 py-3.5 rounded-xl font-headline-sm flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-[0.98] ${selectedId ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'}`}>
                <span className="tracking-wide">{t.check}</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </>
          ) : (
            <button onClick={handleNext} className="flex-1 py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-[0.98]">
              <span className="tracking-wide">{currentQ < lesson.questions.length - 1 ? t.continue : t.finish}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

