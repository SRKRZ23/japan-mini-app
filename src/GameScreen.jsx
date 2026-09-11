import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

export default function GameScreen({ lesson, userId, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [selectedText, setSelectedText] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const audioRef = useRef(null);

  const question = lesson.questions[currentQ];

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Play blocked:", e));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
      }
    }, 500);
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

  const handleAnswer = (text) => {
    setSelectedText(text);
    if (text === question.correctText) {
      setIsCorrect(true);
      const newScore = score + 10;
      setScore(newScore);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      
      setTimeout(() => {
        if (currentQ < lesson.questions.length - 1) {
          setCurrentQ(currentQ + 1);
          setSelectedText(null);
          setIsCorrect(null);
        } else {
          saveProgress(newScore);
          alert("Lesson complete! Score: " + newScore);
          onBack();
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      setHearts(hearts - 1);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      
      if (hearts - 1 <= 0) {
        saveProgress(score);
        alert("Game over! You lost all hearts.");
        onBack();
      }
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <audio ref={audioRef} src={question.audioUrl} />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
        <button onClick={onBack} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{currentQ + 1}/{lesson.questions.length}</span>
        <span style={{ fontSize: '14px' }}>❤️ {hearts}</span>
        <span style={{ fontSize: '14px' }}>⭐ {score}</span>
      </div>

      {/* Title */}
      <h2 style={{ textAlign: 'center', fontSize: '18px', color: '#333', marginBottom: '16px', marginTop: '0' }}>{lesson.title}</h2>

      {/* Listen Button */}
      <button 
        onClick={playAudio} 
        style={{ width: '100%', padding: '16px', fontSize: '20px', marginBottom: '16px', cursor: 'pointer', borderRadius: '12px', backgroundColor: '#2196F3', color: 'white', border: 'none', boxShadow: '0 4px 6px rgba(33,150,243,0.3)', fontWeight: 'bold' }}
      >
        🔊 Listen again
      </button>

      {/* Image Grid 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {question.options.map((opt) => (
          <div key={opt.text} style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9', 
            borderRadius: '12px', 
            fontSize: '56px',
            height: '110px',
            border: '2px solid #e0e0e0',
            userSelect: 'none'
          }}>
            {opt.visual}
          </div>
        ))}
      </div>

      {/* Text Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((opt) => (
          <button
            key={opt.text}
            onClick={() => handleAnswer(opt.text)}
            disabled={selectedText !== null}
            style={{
              padding: '16px',
              fontSize: '18px',
              borderRadius: '12px',
              border: '1px solid #ddd',
              cursor: 'pointer',
              backgroundColor: selectedText === opt.text 
                ? (isCorrect ? '#4CAF50' : '#F44336') 
                : '#fff',
              color: selectedText === opt.text ? 'white' : '#333',
              transition: 'all 0.2s',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              width: '100%'
            }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
