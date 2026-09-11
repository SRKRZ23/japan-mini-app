import { useEffect, useState } from 'react';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';
import LeaderboardScreen from './LeaderboardScreen';
import VocabScreen from './VocabScreen';
import ProfileScreen from './ProfileScreen';
import { supabase } from './supabaseClient';
import { translations } from './data/translations';

function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentLang, setCurrentLang] = useState('EN');
  const [userProgress, setUserProgress] = useState({});

  const fetchProgress = async (uid) => {
    if (!uid) return;
    const { data } = await supabase.from('progress').select('*').eq('user_id', uid);
    const progressMap = {};
    if (data) {
      data.forEach(p => {
        if (!progressMap[p.lesson_id] || p.score > progressMap[p.lesson_id].score) {
          progressMap[p.lesson_id] = p;
        }
      });
    }
    setUserProgress(progressMap);
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const authenticate = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('telegram-auth', {
            body: { initData: tg.initData }
          });
          if (error) throw error;
          setUserId(data.userId);
          await fetchProgress(data.userId);
        } catch (err) {
          console.error('Auth error:', err);
        } finally {
          setLoading(false);
        }
      };
      authenticate();
    } else {
      setLoading(false);
    }
  }, []);

  const handleBackToHome = async () => {
    if (userId) await fetchProgress(userId);
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

