import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 min for AI responses
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── API Functions ─────────────────────────────────────────────────────────────

export const safetyAPI = {
  analyze: (formData) => api.post('/api/safety/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const cracksAPI = {
  analyze: (formData) => api.post('/api/cracks/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const valuationAPI = {
  estimate: (data) => api.post('/api/valuation/estimate', data),
};

export const planningAPI = {
  generate: (data) => api.post('/api/planning/generate', data),
};

export const assistantAPI = {
  daily: (data) => api.post('/api/assistant/daily', data),
  chat: (data) => api.post('/api/assistant/chat', data),
};

export const historyAPI = {
  get: (module = null, limit = 50) => {
    const params = { limit };
    if (module) params.module = module;
    return api.get('/api/history', { params });
  },
  delete: (id) => api.delete(`/api/history/${id}`),
  clearAll: () => api.delete('/api/history'),
};

export const settingsAPI = {
  get: () => api.get('/api/settings'),
  setKey: (api_key) => api.post('/api/settings/apikey', { api_key }),
  testKey: () => api.post('/api/settings/test-key'),
};

export const healthAPI = {
  check: () => api.get('/api/health'),
};

export default api;

