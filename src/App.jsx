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
  const [errorMsg, setErrorMsg] = useState(null);
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
        const key = String(p.lesson_id);
        if (!progressMap[key] || p.score > progressMap[key].score) {
          progressMap[key] = p;
        }
      });
    }
    setUserProgress(progressMap);
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    console.log('🔵 Telegram WebApp:', tg ? 'AVAILABLE' : 'MISSING');
    
    if (!tg) {
      setErrorMsg('Open this app inside Telegram to play');
      setLoading(false);
      return;
    }

    tg.ready();
    tg.expand();
    
    console.log('🔵 initData length:', tg.initData?.length);
    console.log('🔵 user:', tg.initDataUnsafe?.user?.username);

    const authenticate = async () => {
      try {
        console.log('🔵 Calling telegram-auth...');
        const { data, error } = await supabase.functions.invoke('telegram-auth', {
          body: { initData: tg.initData }
        });
        
        console.log('🔵 Response:', data);
        console.log('🔵 Error:', error);
        
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        
        setUserId(data.userId);
        await fetchProgress(data.userId);
      } catch (err) {
        console.error('🔴 Auth error:', err);
        setErrorMsg('Auth failed: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    authenticate();
  }, []);

  const handleBackToHome = async () => {
    if (userId) await fetchProgress(userId);
    setCurrentScreen('home');
  };

  const t = translations[currentLang];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg">{t.loading}</div>;

  if (errorMsg) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
      <div className="text-6xl">⚠️</div>
      <p className="font-body-md text-on-surface">{errorMsg}</p>
      <p className="font-body-sm text-on-surface-variant text-xs">Check console for details (F12)</p>
    </div>
  );

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

