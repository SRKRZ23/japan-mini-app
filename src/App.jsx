import { useEffect, useState } from 'react';
import GameScreen from './GameScreen';
import { supabase } from './supabaseClient';

function App() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;

  return (
    <div className="App">
      <GameScreen userId={userId} />
    </div>
  );
}

export default App;
