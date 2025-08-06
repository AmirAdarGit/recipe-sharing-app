const API_BASE_URL: string = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://recipe-sharing-app-production.up.railway.app' : 'http://localhost:5000');

export { API_BASE_URL };