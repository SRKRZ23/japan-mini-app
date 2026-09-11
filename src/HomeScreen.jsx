import React from 'react';
import { lessons } from './data/lessons';

const MASCOT_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuA7UelOZ2Dqt3xlIBxJeuKOM_G-rHLltGDraYhK9G2EmXdcmR4BmwXuAfUpD3jE8PzDKW1erjTaqzWnswlC4rflofRwZMsqTJDJ0lZkwGiPKEvB1QY_5omheM0RGTQXqLw_lOH7faIgoPr5dTIsaZl1yk_1K0x7M31pbrBYAfXpv-6XYi6D286mpD5qD6Sk78AvSb_Y75IfSUSRUfiHs9Gcb0zs-q1wBr9IBFgv1MP0_fYhWUFVYyL8";

const NODE_POSITIONS = [
  { translate: '0px',   icon: 'check_circle' },
  { translate: '-64px', icon: 'rice_bowl' },
  { translate: '64px',  icon: 'ramen_dining' },
  { translate: '0px',   icon: 'school' },
  { translate: '-64px', icon: 'menu_book' },
  { translate: '64px',  icon: 'military_tech' },
];

export default function HomeScreen({ onSelectLesson }) {
  const completedCount = 3;
  const currentLessonIndex = Math.min(completedCount, lessons.length - 1);

  return (
    <div className="min-h-screen flex flex-col antialiased bg-surface text-on-surface font-body-md">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              <img alt="Mascot" className="w-9 h-9 object-cover" src={MASCOT_URL} />
            </div>
            <div className="flex flex-col">
              <h1 className="font-headline-sm text-headline-sm tracking-tight">Nihongo Quest</h1>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Lvl 1 &middot; Beginner</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-low">
              <span className="material-symbols-outlined text-secondary text-[16px]">favorite</span>
              <span className="font-stat-counter text-stat-counter text-secondary text-[13px]">5</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-16 pb-safe bg-surface">
        <div className="px-margin py-space-xs bg-surface-container-lowest grid grid-cols-3 gap-1.5 shadow-sm">
          <div className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl bg-tertiary-fixed/40">
            <span className="material-symbols-outlined text-tertiary text-[18px]">local_fire_department</span>
            <span className="font-stat-counter text-stat-counter text-tertiary">7d</span>
          </div>
          <div className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl bg-secondary-fixed/50">
            <span className="material-symbols-outlined text-secondary text-[18px]">favorite</span>
            <span className="font-stat-counter text-stat-counter text-secondary">5/5</span>
          </div>
          <div className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl bg-surface-container">
            <span className="material-symbols-outlined text-tertiary-container text-[18px]">monetization_on</span>
            <span className="font-stat-counter text-stat-counter text-on-surface">340</span>
          </div>
        </div>

        <div className="px-margin pt-space-md">
          <div className="p-space-md rounded-xl bg-primary text-on-primary shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">UNIT 1</span>
                <span className="font-label-sm text-label-sm text-inverse-primary tracking-wide">JLPT N5</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary-fixed text-[16px]">stars</span>
                <span className="font-stat-counter text-stat-counter text-on-primary">{completedCount} / {lessons.length}</span>
              </div>
            </div>
            <h2 className="font-headline-sm text-headline-sm tracking-tight">Greetings &amp; Vocabulary</h2>
            <p className="font-body-sm text-body-sm text-inverse-primary/90 mt-0.5">Master Japanese essentials step by step</p>
            <div className="mt-space-sm w-full bg-on-primary-fixed-variant/40 h-2 rounded-full overflow-hidden">
              <div className="bg-primary-fixed h-full rounded-full" style={{ width: (completedCount / lessons.length) * 100 + "%" }}></div>
            </div>
          </div>
        </div>

        <div className="relative px-margin py-space-lg w-full flex flex-col items-center">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 180 70 C 180 120, 110 130, 110 170 C 110 210, 260 220, 260 270 C 260 320, 180 340, 180 390 C 180 430, 90 450, 90 500 C 90 550, 260 570, 260 630"
              fill="none"
              stroke="#bbcabf"
              strokeDasharray="10 8"
              strokeLinecap="round"
              strokeWidth="8"
              opacity="0.5"
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center w-full space-y-7">
            {lessons.map((lesson, idx) => {
              const isCompleted = idx < completedCount;
              const isCurrent = idx === currentLessonIndex;
              const isLocked = idx > currentLessonIndex;
              const pos = NODE_POSITIONS[idx % NODE_POSITIONS.length];

              return (
                <div
                  key={lesson.id}
                  className="flex flex-col items-center"
                  style={{ transform: "translateX(" + pos.translate + ")" }}
                >
                  {isCurrent && (
                    <div className="mb-2 px-3 py-1 rounded-full bg-primary text-on-primary shadow-lg flex items-center gap-1.5 animate-bounce">
                      <span className="material-symbols-outlined text-primary-fixed text-[16px]">play_arrow</span>
                      <span className="font-label-sm text-label-sm font-bold tracking-wide">START &middot; +20 XP</span>
                    </div>
                  )}

                  <div className="relative">
                    {isCurrent && (
                      <div className="absolute -inset-2 rounded-full bg-primary/20 animate-ping"></div>
                    )}
                    <button
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      disabled={isLocked}
                      className={
                        "relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform " +
                        (isCompleted || isCurrent
                          ? "bg-primary-container text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant")
                      }
                    >
                      {isLocked ? (
                        <span className="material-symbols-outlined text-[28px]">lock</span>
                      ) : (
                        <span className="material-symbols-outlined text-[30px]">{pos.icon}</span>
                      )}
                    </button>
                  </div>

                  {!isLocked && (
                    <div className="flex items-center gap-0.5 mt-1.5">
                      <span className="material-symbols-outlined text-tertiary-container text-[16px]">star</span>
                      <span className="material-symbols-outlined text-tertiary-container text-[16px]">star</span>
                      <span className="material-symbols-outlined text-tertiary-container text-[16px]">star</span>
                    </div>
                  )}

                  <span className={"font-label-md text-label-md mt-0.5 text-center max-w-[140px] " + (isLocked ? "text-on-surface-variant" : "text-on-surface")}>
                    {idx + 1}. {lesson.title}
                  </span>
                  {isLocked && (
                    <span className="font-label-sm text-label-sm text-tertiary">Requires previous lesson</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-margin pb-space-lg">
          <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-space-sm min-w-0">
              <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[22px]">target</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">Daily Mission</span>
                <span className="font-body-md text-body-md text-on-surface truncate">Complete 2 lessons (0/2)</span>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm shrink-0 flex items-center gap-1 shadow-sm">
              <span>+50</span>
              <span className="material-symbols-outlined text-[14px]">monetization_on</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 inset-x-0 bg-surface-container-lowest shadow-lg px-space-sm py-2 flex items-center justify-around z-40 pb-safe">
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl bg-primary-fixed text-on-primary-fixed">
            <span className="material-symbols-outlined text-[22px]">explore</span>
            <span className="font-label-sm text-label-sm font-bold">Quests</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-[22px]">menu_book</span>
            <span className="font-label-sm text-label-sm">Vocab</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-[22px]">leaderboard</span>
            <span className="font-label-sm text-label-sm">Ranks</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-[22px]">person</span>
            <span className="font-label-sm text-label-sm">Profile</span>
          </button>
        </div>
      </main>
    </div>
  );
}

