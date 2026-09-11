import { useEffect, useState } from 'react';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';
import { supabase } from './supabaseClient';

function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

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

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', fontSize: '18px' }}>Loading...</div>;

  return (
    <div className="App">
      {selectedLesson ? (
        <GameScreen 
          lesson={selectedLesson} 
          userId={userId} 
          onBack={() => setSelectedLesson(null)} 
        />
      ) : (
        <HomeScreen onSelectLesson={(lesson) => setSelectedLesson(lesson)} />
      )}
    </div>
  );
}

export default App;
