import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ethara-ai-2e0n.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
