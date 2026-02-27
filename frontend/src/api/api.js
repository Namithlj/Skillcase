import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' }
})

// attach token from localStorage if present for convenience
API.interceptors.request.use(cfg => {
  try {
    const raw = localStorage.getItem('skillcase_auth');
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return cfg;
})

export default API
