import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '../config/api';
import {
  showApiErrorToast,
  showErrorToast,
  AUTH_TOASTS,
  showAuthErrorToast
} from '../utils/toast';

// API Response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

interface User {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    stepNumber: number;
    instruction: string;
    duration?: number;
  }>;
  cookingTime: {
    prep: number;
    cook: number;
    total: number;
  };
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  cuisine: string;
  tags: string[];
  notes?: string;
  isPublic: boolean;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  authorFirebaseUid: string;
  author?: User;
  stats: {
    views: number;
    likes: number;
    saves: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for general configuration
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Firebase authentication is handled separately in the AuthContext
    // No need to add JWT tokens here
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Handle different types of errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - handled by Firebase Auth
          showAuthErrorToast('unauthorized', AUTH_TOASTS.UNAUTHORIZED);
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
          const message = (data as any)?.message || 'Validation failed. Please check your input.';
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
 * Authentication is handled by Firebase Auth in AuthContext
 * No separate authentication API needed
 */

/**
 * User API calls
 */
export const userAPI = {
  // Get all users
  getUsers: async (params: QueryParams = {}): Promise<ApiResponse<User[]>> => {
    try {
      const response = await api.get('/api/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user account
  deleteAccount: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Recipe API calls
 */
export const recipeAPI = {
  // Get all recipes
  getRecipes: async (params: QueryParams = {}): Promise<ApiResponse<Recipe[]>> => {
    try {
      const response = await api.get('/api/recipes', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recipe by ID
  getRecipe: async (recipeId: string): Promise<ApiResponse<Recipe>> => {
    try {
      const response = await api.get(`/api/recipes/${recipeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new recipe
  createRecipe: async (recipeData: Omit<Recipe, '_id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<ApiResponse<Recipe>> => {
    try {
      const response = await api.post('/api/recipes', recipeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update recipe
  updateRecipe: async (recipeId: string, recipeData: Partial<Recipe>): Promise<ApiResponse<Recipe>> => {
    try {
      const response = await api.put(`/api/recipes/${recipeId}`, recipeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete recipe
  deleteRecipe: async (recipeId: string): Promise<ApiResponse<void>> => {
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
  // Test API connection
  testConnection: async (): Promise<ApiResponse<{ status: string; timestamp: string }>> => {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;
