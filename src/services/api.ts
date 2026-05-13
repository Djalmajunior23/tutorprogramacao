import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Interceptor for Auth (if needed later)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const educationService = {
  getPaths: async () => {
    const response = await api.get('/learning-paths');
    return response.data;
  },
  getRanking: async () => {
    const response = await api.get('/ranking');
    return response.data;
  }
};
