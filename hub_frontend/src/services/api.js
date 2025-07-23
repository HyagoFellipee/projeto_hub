import axios from 'axios';

const API_BASE_URL = 'http://localhost:8002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (!config.url.includes('/auth/login/')) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login/')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    console.log('API URL:', `${API_BASE_URL}/auth/login/`);
    console.log('Credentials:', credentials);
    
    const response = await api.post('/auth/login/', credentials);
    const { access, refresh } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/'),
};

export const clienteService = {
  list: (params = {}) => api.get('/clientes/', { params }),
  get: (id) => api.get(`/clientes/${id}/`),
  create: (data) => api.post('/clientes/', data),
  update: (id, data) => api.put(`/clientes/${id}/`, data),
  delete: (id) => api.delete(`/clientes/${id}/`),
};

export const correspondenciaService = {
  list: (params = {}) => api.get('/correspondencias/', { params }),
  create: (data) => api.post('/correspondencias/', data),
  marcarRetirada: (id, data) => api.post(`/correspondencias/${id}/marcar_retirada/`, data),
  pendentes: () => api.get('/correspondencias/pendentes/'),
};

export default api;