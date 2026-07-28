import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Backend URL (proxied in dev, absolute via Vercel in prod)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
