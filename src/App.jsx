import { useEffect, useState } from 'react';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';
import LeaderboardScreen from './LeaderboardScreen';
import VocabScreen from './VocabScreen';
import ProfileScreen from './ProfileScreen';
import { supabase } from './supabaseClient';
import { translations } from './data/translations';
import { getCurrentHearts } from './utils/gameLogic';

function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentLang, setCurrentLang] = useState('EN');
  const [userProgress, setUserProgress] = useState({});
  const [progressRaw, setProgressRaw] = useState([]);
  const [userStats, setUserStats] = useState(null);

  const fetchProgress = async (uid) => {
    if (!uid) return;
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('lesson_id, score, completed_at')
        .eq('user_id', uid);

      if (error) { console.error('fetchProgress error:', error); return; }

      const progressMap = {};
      if (data) {
        data.forEach(p => {
          const key = String(p.lesson_id);
          if (!progressMap[key] || p.score > progressMap[key].score) {
            progressMap[key] = p;
          }
        });
      }
      setProgressRaw(data || []);
      setUserProgress(progressMap);
    } catch (err) { console.error('fetchProgress exception:', err); }
  };

  const fetchUserStats = async (uid) => {
    if (!uid) return;
    const { data, error } = await supabase
      .from('users')
      .select('coins, hearts, hearts_updated_at, xp, level, streak')
      .eq('id', uid)
      .single();
    if (error) { console.error('fetchUserStats error:', error); return; }
    if (data) {
      data.hearts = getCurrentHearts(data);
      setUserStats(data);
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) { setLoading(false); return; }
    tg.ready();
    tg.expand();

    const authenticate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('telegram-auth', {
          body: { initData: tg.initData }
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setUserId(data.userId);
        await fetchProgress(data.userId);
        await fetchUserStats(data.userId);
      } catch (err) { console.error('Auth error:', err); }
      finally { setLoading(false); }
    };
    authenticate();
  }, []);

  const handleBackToHome = async () => {
    if (userId) {
      await fetchProgress(userId);
      await fetchUserStats(userId);
    }
    setCurrentScreen('home');
  };

  const t = translations[currentLang];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">{t.loading}</div>;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface font-body-md max-w-lg mx-auto w-full shadow-2xl relative">
      {currentScreen === 'home' && (
        <HomeScreen
          onSelectLesson={(lesson) => { setSelectedLesson(lesson); setCurrentScreen('game'); }}
          onNavigate={(screen) => setCurrentScreen(screen)}
          userProgress={userProgress}
          progressRaw={progressRaw}
          userStats={userStats}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
        />
      )}
      {currentScreen === 'game' && (
        <GameScreen
          lesson={selectedLesson}
          userId={userId}
          onBack={handleBackToHome}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
          userStats={userStats}
        />
      )}
      {currentScreen === 'leaderboard' && (
        <LeaderboardScreen
          userId={userId}
          onBack={() => setCurrentScreen('home')}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
        />
      )}
      {currentScreen === 'vocab' && (
        <VocabScreen
          onBack={() => setCurrentScreen('home')}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
        />
      )}
      {currentScreen === 'profile' && (
        <ProfileScreen
          userId={userId}
          userProgress={userProgress}
          onBack={() => setCurrentScreen('home')}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
        />
      )}
    </div>
  );
}

export default App;

