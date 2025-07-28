import axios from 'axios';

// Create axios instance
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // For Vercel deployment
  : 'http://localhost:8000';  // For local development

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    
    if (!error.response) {
      throw new Error('Network error. Please check if the backend is running.');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    
    throw error;
  }
);

// API endpoints
export const carQuizApi = {
  // Health check
  healthCheck: () => api.get('/health'),
  
  // Quiz endpoints
  submitQuiz: (quizData) => api.post('/api/quiz/submit', quizData),
  
  // Test endpoints
  testGetCars: () => api.get('/api/test/cars'),
};

export default api;