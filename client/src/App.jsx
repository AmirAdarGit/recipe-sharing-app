import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test server connection
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => {
        setServerData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Server connection failed:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🍳 Recipe Sharing App</h1>
        
        {loading ? (
          <p>Connecting to server...</p>
        ) : serverData ? (
          <div>
            <p>✅ Server Connected!</p>
            <p>{serverData.message}</p>
          </div>
        ) : (
          <p>❌ Server connection failed</p>
        )}
        
        <p>Frontend: React + Vite</p>
        <p>Backend: Node.js + Express</p>
      </header>
    </div>
  );
}

export default App;
