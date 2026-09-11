import React, { useState } from 'react';
import { lessons } from './data/lessons';
import { translations } from './data/translations';

export default function VocabScreen({ onBack, currentLang, setCurrentLang }) {
  const [search, setSearch] = useState('');
  const t = translations[currentLang];

  const allWords = lessons.flatMap(lesson =>
    lesson.questions.flatMap(q => q.options)
  );

  const uniqueWords = allWords.reduce((acc, word) => {
    if (!acc.find(w => w.kanji === word.kanji)) acc.push(word);
    return acc;
  }, []);

  const filtered = uniqueWords.filter(w =>
    w.kanji.includes(search) ||
    w.translation[currentLang].toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col relative w-full bg-surface pb-20">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] max-w-lg mx-auto">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button onClick={onBack} className="w-11 h-11 -ml-space-xs flex items-center justify-center text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-headline-sm text-headline-sm tracking-tight">{t.vocab}</h1>
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
        <div className="bg-surface-container-lowest rounded-xl px-3 py-2 shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent outline-none font-body-md text-body-md"
          />
        </div>

        <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold mt-2">
          {filtered.length} words
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((word, idx) => (
            <div key={idx} className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-3xl shrink-0">
                {word.visual}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-japanese-card text-headline-sm font-bold">{word.kanji}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{word.furigana}</span>
                <span className="font-body-sm text-body-sm text-primary">{word.translation[currentLang]}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

