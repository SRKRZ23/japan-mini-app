import React from 'react';
import { lessons } from './data/lessons';

export default function HomeScreen({ onSelectLesson }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Nihongo Quest</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Select a lesson</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson)}
            style={{
              padding: '20px',
              fontSize: '18px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {lesson.title} ({lesson.questions.length} questions)
          </button>
        ))}
      </div>
    </div>
  );
}
