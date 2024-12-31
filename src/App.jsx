import React from 'react';
import { createRoot } from 'react-dom/client';
import { ImageScanner } from './components/ImageScanner';

function App() {
  return (
    <div>
      <ImageScanner />
    </div>
  );
}

// Create root and render
const root = createRoot(document.getElementById('root'));
root.render(<App />); 