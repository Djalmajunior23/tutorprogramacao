import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;
const isPreviewEnv = typeof window !== 'undefined' && (window.location.hostname.includes('run.app') || window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'));
const API_URL = isPreviewEnv ? '/api' : (VITE_API_URL || '/api');
console.log("FINAL API_URL:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Unauthorized/Expired tokens and non-JSON responses
api.interceptors.response.use(
  (response) => {
    // If response is HTML but we expected JSON, it might be a routing issue (SPA fallback)
    const contentType = response.headers['content-type'] as string | undefined;
    if (typeof contentType === 'string' && contentType.includes('text/html') && typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('API returned HTML instead of JSON. Possible routing issue.');
      return Promise.reject(new Error('Resposta do servidor inválida (HTML recebido em vez de JSON).'));
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const isAuthPath = error.config?.url?.includes('/auth/');
    
    if (status === 401 || (status === 404 && isAuthPath)) {
      localStorage.removeItem('token');
      // If we are not on the login page, we might want to redirect or notify the user
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
         console.warn("Sessão expirada ou não autorizada.");
      }
    }
    return Promise.reject(error);
  }
);

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
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  verifyEmail: async (email: string) => {
    const response = await api.post('/auth/verify-email', { email });
    return response.data;
  },
  resetPassword: async (data: any) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }
};

export const educationService = {
  getLanguages: async () => {
    const response = await api.get('/languages');
    return response.data;
  },
  getConcepts: async () => {
    const response = await api.get('/concepts');
    return response.data;
  },
  getPaths: async () => {
    const response = await api.get('/learning-paths');
    return response.data;
  },
  getChallenges: async () => {
    const response = await api.get('/challenges');
    return response.data;
  },
  getRanking: async () => {
    const response = await api.get('/ranking');
    return response.data;
  },
  getClasses: async () => {
    const response = await api.get('/classes');
    return response.data;
  }
};

export const dashboardService = {
  getStudentDashboard: async () => {
    const response = await api.get('/student/dashboard');
    return response.data;
  },
  getTeacherDashboard: async () => {
    const response = await api.get('/teacher/dashboard');
    return response.data;
  }
};

export const studentsService = {
  getAll: async (params?: Record<string, string | number | boolean>) => {
    const response = await api.get('/students', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/students', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/students/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: string, active: boolean) => {
    const response = await api.patch(`/students/${id}/status`, { active });
    return response.data;
  },
  resetPassword: async (id: string, data: any) => {
    const response = await api.patch(`/students/${id}/reset-password`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/students/stats');
    return response.data;
  }
};
