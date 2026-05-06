'use client';

import TypingGame from './components/TypingGame';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <TypingGame />
    </main>
  );
}