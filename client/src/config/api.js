const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://your-railway-app.railway.app' : 'http://localhost:5000');

export { API_BASE_URL };