import React from 'react';

export default function Loader({ message = 'Analyzing with AI...' }) {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner" />
      <div className="loader-text">{message}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 250 }}>
        Gemini is processing your request. This may take 10–30 seconds.
      </div>
    </div>
  );
}
