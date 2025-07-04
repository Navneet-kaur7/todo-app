import axios from 'axios';
import API_BASE_URL from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
};

export const taskAPI = {
  getTasks: () => api.get('/api/tasks'),
  createTask: (task) => api.post('/api/tasks', task),
  updateTask: (id, task) => api.put(`/api/tasks/${id}`, task),
  deleteTask: (id) => api.delete(`/api/tasks/${id}`),
};

export default api;