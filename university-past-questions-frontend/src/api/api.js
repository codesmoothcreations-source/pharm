import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_PRIMARY || 'http://localhost:5001/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  getProfile: () => API.get('/auth/me'),
};

export const pastQuestionsAPI = {
  getAll: (params = {}) => API.get('/past-questions', { params }),
  getSingle: (id) => API.get(`/past-questions/${id}`),
  create: (data) => API.post('/past-questions', data),
  update: (id, data) => API.put(`/past-questions/${id}`, data),
  delete: (id) => API.delete(`/past-questions/${id}`),
};

export const videosAPI = {
  search: (query) => API.get('/videos/search', { params: { query } }),
};

export default API;