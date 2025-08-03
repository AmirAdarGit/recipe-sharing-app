import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './config/api.js';
import './App.css';

function App() {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use axios instead of fetch
    axios.get(`${API_BASE_URL}/api/health`)
      .then(response => {
        setServerData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Server connection failed:', error);
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