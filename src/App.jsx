import { useEffect } from 'react';
import GameScreen from './GameScreen';

function App() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  return (
    <div className="App">
      <GameScreen />
    </div>
  );
}

export default App;
