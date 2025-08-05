import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { 
  showApiErrorToast, 
  showErrorToast, 
  AUTH_TOASTS,
  showAuthErrorToast 
} from '../utils/toast';

// Create axios instance with base configuration
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
    // Get JWT token from localStorage
    const token = localStorage.getItem('authToken');
    
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
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('authToken');
          showAuthErrorToast('token', AUTH_TOASTS.TOKEN_EXPIRED);
          // Redirect to login if needed
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden
          showAuthErrorToast('unauthorized', AUTH_TOASTS.UNAUTHORIZED);
          break;
          
        case 404:
          // Not found
          showErrorToast('The requested resource was not found.');
          break;
          
        case 422:
          // Validation error
          const message = data?.message || 'Validation failed. Please check your input.';
          showErrorToast(message);
          break;
          
        case 429:
          // Too many requests
          showErrorToast('Too many requests. Please wait a moment and try again.');
          break;
          
        case 500:
          // Server error
          showErrorToast('Server error. Please try again later.');
          break;
          
        default:
          // Generic error
          showApiErrorToast(error, 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      showAuthErrorToast('network', AUTH_TOASTS.NETWORK_ERROR);
    } else {
      // Something else happened
      showErrorToast('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API calls
 */
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      // Store JWT token
      if (response.data.data?.token) {
        localStorage.setItem('authToken', response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await api.post('/api/auth/logout');
      localStorage.removeItem('authToken');
      return response.data;
    } catch (error) {
      // Even if logout fails on server, remove token locally
      localStorage.removeItem('authToken');
      throw error;
    }
  }
};

/**
 * User API calls
 */
export const userAPI = {
  // Get all users
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/api/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user account
  deleteAccount: async (userId) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Recipe API calls (placeholder for future implementation)
 */
export const recipeAPI = {
  // Get all recipes
  getRecipes: async (params = {}) => {
    try {
      const response = await api.get('/api/recipes', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recipe by ID
  getRecipe: async (recipeId) => {
    try {
      const response = await api.get(`/api/recipes/${recipeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new recipe
  createRecipe: async (recipeData) => {
    try {
      const response = await api.post('/api/recipes', recipeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update recipe
  updateRecipe: async (recipeId, recipeData) => {
    try {
      const response = await api.put(`/api/recipes/${recipeId}`, recipeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete recipe
  deleteRecipe: async (recipeId) => {
    try {
      const response = await api.delete(`/api/recipes/${recipeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Utility functions
 */
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Get stored auth token
  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  // Clear auth token
  clearAuthToken: () => {
    localStorage.removeItem('authToken');
  },

  // Test API connection
  testConnection: async () => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
