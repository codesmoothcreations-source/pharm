import axios from 'axios';

// eslint-disable-next-line no-undef
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_PRIMARY || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const pastQuestionAPI = {
  getAll: (params = {}) => api.get('/past-questions', { params }),
  getById: (id) => api.get(`/past-questions/${id}`),
  create: (data) => api.post('/past-questions', data),
  update: (id, data) => api.put(`/past-questions/${id}`, data),
  delete: (id) => api.delete(`/past-questions/${id}`),
  approve: (id) => api.put(`/past-questions/${id}/approve`),
};

export const videoAPI = {
  search: (params) => api.get('/videos/search', { params }),
  addToQuestion: (questionId, videoData) => 
    api.post(`/videos/past-question/${questionId}`, videoData),
};

export default api;