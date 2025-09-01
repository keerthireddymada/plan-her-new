import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8001', // Backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors (e.g., token expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 errors for protected routes (not login/signup itself)
    if (error.response?.status === 401) {
      const isAuthRoute = error.config.url?.includes('/auth/login') || 
                         error.config.url?.includes('/auth/register');
      
      if (!isAuthRoute) {
        // Token expired or invalid for protected routes, clear storage and redirect
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

// --- API Endpoints --- //

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const profileAPI = {
  getProfile: () => api.get('/profiles/me'),
  createProfile: (profileData) => api.post('/profiles/me', profileData),
  updateProfile: (profileData) => api.put('/profiles/me', profileData),
};

export const periodAPI = {
  getPeriods: (params = {}) => api.get('/periods/', { params }),
  createPeriod: (periodData) => api.post('/periods/', periodData),
  updatePeriod: (id, periodData) => api.put(`/periods/${id}`, periodData),
  deletePeriod: (id) => api.delete(`/periods/${id}`),
};

export const moodAPI = {
  getMoods: (params = {}) => api.get('/moods/', { params }),
  createMood: (moodData) => api.post('/moods/', moodData),
  updateMood: (id, moodData) => api.put(`/moods/${id}`, moodData),
  deleteMood: (id) => api.delete(`/moods/${id}`),
};

export const predictionsAPI = {
  getCurrentPrediction: (date) => { // Handles optional date and YYYY-MM-DD format
    const params = {};
    if (date) {
      const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
      params.target_date = formattedDate;
    }
    return api.get('/predictions/current', { params });
  },
  getPredictionHistory: (startDate, endDate) => 
    api.get('/predictions/history', { params: { start_date: startDate, end_date: endDate } }),
  retrainModel: () => api.post('/predictions/retrain'),
  confirmPeriod: (periodData) => api.post('/predictions/confirm-period', periodData), 
  getModelStatus: () => api.get('/predictions/model-status'),
  getCycleInfo: () => api.get('/predictions/cycle-info'),
  get7DayPlan: () => api.get('/predictions/7-day-plan'),
};

export const insightsAPI = {
  getInsights: () => api.get('/insights/'),
};

export default api;
