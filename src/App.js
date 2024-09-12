// src/App.js

import './App.css';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function App() {
  useEffect(() => {
    if (!navigator.gpu) {
      console.error('WebGPU is not supported on this browser.');
    } else {
      console.log('WebGPU is supported!');
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Welcome to the Enigma</h2>
        <p>Unveil the secrets hidden within your expressions.</p>
        <Link to="/face-to-emoji" className="mystery-link">
          Begin the Journey
        </Link>
      </header>
    </div>
  );
}

export default App;
