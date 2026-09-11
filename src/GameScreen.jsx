import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function GameScreen({ lesson, userId, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [selectedText, setSelectedText] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const question = lesson.questions[currentQ];

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.audioText);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support speech synthesis.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(question.audioText);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentQ, question.audioText]);

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
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Back</button>
        <span>Q: {currentQ + 1}/{lesson.questions.length}</span>
        <span>❤️ {hearts}</span>
        <span>⭐ {score}</span>
      </div>

      <h2 style={{ textAlign: 'center', fontSize: '20px', color: '#333' }}>{lesson.title}</h2>

      <button 
        onClick={playAudio} 
        style={{ width: '100%', padding: '20px', fontSize: '24px', marginBottom: '20px', cursor: 'pointer', borderRadius: '12px', backgroundColor: '#2196F3', color: 'white', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
      >
        Listen again
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        {question.options.map((opt) => (
          <div key={opt.text} style={{ 
            textAlign: 'center', 
            padding: '20px', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '12px', 
            fontSize: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '120px',
            border: '2px solid #e0e0e0'
          }}>
            {opt.visual}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((opt) => (
          <button
            key={opt.text}
            onClick={() => handleAnswer(opt.text)}
            disabled={selectedText !== null}
            style={{
              padding: '18px',
              fontSize: '20px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              cursor: 'pointer',
              backgroundColor: selectedText === opt.text 
                ? (isCorrect ? '#4CAF50' : '#F44336') 
                : '#fff',
              color: selectedText === opt.text ? 'white' : '#333',
              transition: 'background-color 0.3s',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
