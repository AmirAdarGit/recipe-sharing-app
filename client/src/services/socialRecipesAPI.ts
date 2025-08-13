import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { auth } from '../config/firebase';
import { API_BASE_URL } from '../config/api';
import { SocialRecipe, RecipeFilters, UserActivity } from '../pages/Recipes';

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Search response interface
interface SearchResponse {
  recipes: SocialRecipe[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Query parameters interface
interface SearchParams extends Partial<RecipeFilters> {
  page?: number;
  limit?: number;
}

// Comment interface
interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    displayName: string;
    photoURL?: string;
  };
  recipeId: string;
  parentCommentId?: string;
  replies?: Comment[];
  likes: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// User profile interface
interface UserProfile {
  _id: string;
  firebaseUid: string;
  displayName: string;
  photoURL?: string;
  profile: {
    bio?: string;
    location?: string;
    website?: string;
    followerCount: number;
    followingCount: number;
    recipeCount: number;
    totalLikes: number;
    joinedAt: string;
  };
  isFollowing: boolean;
  isOwnProfile: boolean;
}

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Firebase auth token
api.interceptors.request.use(
  async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${idToken}`
        };
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access - redirecting to login');
    }
    return Promise.reject(error);
  }
);

/**
 * Social Recipes API calls
 */
export const socialRecipesAPI = {
  // Search and discover recipes
  searchRecipes: async (params: SearchParams = {}): Promise<ApiResponse<SearchResponse>> => {
    try {
      const response = await api.get('/api/recipes/search', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get trending recipes
  getTrendingRecipes: async (limit: number = 10): Promise<ApiResponse<SocialRecipe[]>> => {
    try {
      const response = await api.get('/api/recipes/trending', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recipes from followed users
  getFollowingFeed: async (page: number = 1, limit: number = 10): Promise<ApiResponse<SearchResponse>> => {
    try {
      const response = await api.get('/api/recipes/following-feed', { 
        params: { page, limit } 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get activity feed
  getActivityFeed: async (limit: number = 20): Promise<ApiResponse<UserActivity[]>> => {
    try {
      const response = await api.get('/api/social/activity-feed', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Like/unlike a recipe
  toggleLike: async (recipeId: string): Promise<ApiResponse<{ isLiked: boolean; likesCount: number; }>> => {
    try {
      const response = await api.post(`/api/recipes/${recipeId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save/unsave a recipe
  toggleSave: async (recipeId: string): Promise<ApiResponse<{ isSaved: boolean; savesCount: number; }>> => {
    try {
      const response = await api.post(`/api/recipes/${recipeId}/save`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Follow/unfollow a user
  toggleFollow: async (userId: string): Promise<ApiResponse<{ isFollowing: boolean; followerCount: number; }>> => {
    try {
      const response = await api.post(`/api/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recipe comments
  getComments: async (recipeId: string, page: number = 1): Promise<ApiResponse<{
    comments: Comment[];
    total: number;
    hasMore: boolean;
  }>> => {
    try {
      const response = await api.get(`/api/recipes/${recipeId}/comments`, {
        params: { page, limit: 10 }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add a comment
  addComment: async (recipeId: string, content: string, parentCommentId?: string): Promise<ApiResponse<Comment>> => {
    try {
      const response = await api.post(`/api/recipes/${recipeId}/comments`, {
        content,
        parentCommentId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Like/unlike a comment
  toggleCommentLike: async (commentId: string): Promise<ApiResponse<{ isLiked: boolean; likesCount: number; }>> => {
    try {
      const response = await api.post(`/api/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/api/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (userId: string): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await api.get(`/api/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's recipes
  getUserRecipes: async (userId: string, page: number = 1): Promise<ApiResponse<SearchResponse>> => {
    try {
      const response = await api.get(`/api/users/${userId}/recipes`, {
        params: { page, limit: 12 }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's followers
  getUserFollowers: async (userId: string, page: number = 1): Promise<ApiResponse<{
    users: UserProfile[];
    total: number;
    hasMore: boolean;
  }>> => {
    try {
      const response = await api.get(`/api/users/${userId}/followers`, {
        params: { page, limit: 20 }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's following
  getUserFollowing: async (userId: string, page: number = 1): Promise<ApiResponse<{
    users: UserProfile[];
    total: number;
    hasMore: boolean;
  }>> => {
    try {
      const response = await api.get(`/api/users/${userId}/following`, {
        params: { page, limit: 20 }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Rate a recipe
  rateRecipe: async (recipeId: string, rating: number): Promise<ApiResponse<{
    averageRating: number;
    ratingCount: number;
    userRating: number;
  }>> => {
    try {
      const response = await api.post(`/api/recipes/${recipeId}/rate`, { rating });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Report content
  reportContent: async (contentType: 'recipe' | 'comment', contentId: string, reason: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post('/api/reports', {
        contentType,
        contentId,
        reason
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recipe suggestions based on user preferences
  getRecommendations: async (limit: number = 10): Promise<ApiResponse<SocialRecipe[]>> => {
    try {
      const response = await api.get('/api/recipes/recommendations', { params: { limit } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search users
  searchUsers: async (query: string, page: number = 1): Promise<ApiResponse<{
    users: UserProfile[];
    total: number;
    hasMore: boolean;
  }>> => {
    try {
      const response = await api.get('/api/users/search', {
        params: { q: query, page, limit: 20 }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Utility functions for social recipes
 */
export const socialRecipesUtils = {
  // Format cooking time for display
  formatCookingTime: (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  },

  // Format difficulty for display
  formatDifficulty: (difficulty: string): string => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  },

  // Format stats for display
  formatCount: (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  },

  // Get difficulty color
  getDifficultyColor: (difficulty: string): string => {
    const colors = {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#ef4444'
    };
    return colors[difficulty as keyof typeof colors] || colors.medium;
  },

  // Generate recipe URL
  getRecipeUrl: (recipeId: string): string => {
    return `${window.location.origin}/recipe/${recipeId}`;
  },

  // Generate user profile URL
  getUserProfileUrl: (userId: string): string => {
    return `${window.location.origin}/profile/${userId}`;
  }
};

export default socialRecipesAPI;
