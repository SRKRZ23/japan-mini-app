import React, { useState, useRef, useEffect } from 'react';

// Временные данные для примера (в реальном проекте брать из БД)
const QUESTIONS = [
  {
    id: 1,
    audioUrl: '/audio/ohayou.mp3', // Положите файл в public/audio/ohayou.mp3
    correctText: 'おはよう ございます',
    options: [
      { id: 'a', text: 'おはよう ございます', img: '/img/morning.png' },
      { id: 'b', text: 'こんにちは', img: '/img/afternoon.png' },
      { id: 'c', text: 'こんばんは', img: '/img/evening.png' },
      { id: 'd', text: 'おやすみなさい', img: '/img/night.png' }
    ]
  }
];

export default function GameScreen() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [selectedText, setSelectedText] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const audioRef = useRef(null);

  const question = QUESTIONS[currentQ];

  // Автовоспроизведение аудио при загрузке вопроса
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Автовоспроизведение заблокировано:", e));
    }
  }, [currentQ]);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleAnswer = (text) => {
    setSelectedText(text);
    if (text === question.correctText) {
      setIsCorrect(true);
      setScore(score + 10);
      // Вибрация Telegram (если доступно)
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      
      setTimeout(() => {
        if (currentQ < QUESTIONS.length - 1) {
          setCurrentQ(currentQ + 1);
          setSelectedText(null);
          setIsCorrect(null);
        } else {
          alert(`Игра окончена! Ваш счет: ${score + 10}`);
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      setHearts(hearts - 1);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      
      if (hearts - 1 <= 0) {
        alert("Игра окончена! Вы потеряли все жизни.");
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span>Прогресс: {currentQ + 1}/{QUESTIONS.length}</span>
        <span>❤️ {hearts}</span>
        <span>⭐ {score}</span>
      </div>

      <audio ref={audioRef} src={question.audioUrl} />
      <button 
        onClick={handlePlayAudio} 
        style={{ width: '100%', padding: '15px', fontSize: '20px', marginBottom: '20px', cursor: 'pointer', borderRadius: '8px' }}
      >
        🔊 Прослушать снова
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {question.options.map((opt) => (
          <div key={opt.id} style={{ textAlign: 'center' }}>
            <img 
              src={opt.img} 
              alt={opt.text} 
              style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #ccc' }} 
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleAnswer(opt.text)}
            disabled={selectedText !== null}
            style={{
              padding: '15px',
              fontSize: '18px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              backgroundColor: selectedText === opt.text 
                ? (isCorrect ? '#4CAF50' : '#F44336') 
                : '#f0f0f0',
              color: selectedText === opt.text ? 'white' : 'black',
              transition: 'background-color 0.3s'
            }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
