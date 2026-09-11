import React from 'react';
import { lessons } from './data/lessons';

export default function HomeScreen({ onSelectLesson }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ textAlign: 'center', color: '#333', fontSize: '28px', marginBottom: '8px' }}>Nihongo Quest</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '16px' }}>Select a lesson</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson)}
            style={{
              padding: '20px',
              fontSize: '18px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(76,175,80,0.3)',
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{lesson.title}</span>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>{lesson.questions.length} q</span>
          </button>
        ))}
      </div>
    </div>
  );
}
