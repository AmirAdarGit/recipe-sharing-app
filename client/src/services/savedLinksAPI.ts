import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { auth } from '../config/firebase';
import { API_BASE_URL } from '../config/api';
import { SavedLink } from '../pages/SavedLinks';

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Query parameters interface
interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  platform?: string;
  tags?: string[];
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
      // Handle unauthorized access
      console.error('Unauthorized access - redirecting to login');
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

/**
 * Saved Links API calls
 */
export const savedLinksAPI = {
  // Get all saved links for the current user
  getLinks: async (params: QueryParams = {}): Promise<ApiResponse<SavedLink[]>> => {
    try {
      const response = await api.get('/api/saved-links', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific saved link by ID
  getLink: async (linkId: string): Promise<ApiResponse<SavedLink>> => {
    try {
      const response = await api.get(`/api/saved-links/${linkId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new saved link
  createLink: async (linkData: Partial<SavedLink>): Promise<ApiResponse<SavedLink>> => {
    try {
      const response = await api.post('/api/saved-links', linkData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing saved link
  updateLink: async (linkId: string, updates: Partial<SavedLink>): Promise<ApiResponse<SavedLink>> => {
    try {
      const response = await api.put(`/api/saved-links/${linkId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a saved link
  deleteLink: async (linkId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/api/saved-links/${linkId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk delete saved links
  bulkDeleteLinks: async (linkIds: string[]): Promise<ApiResponse<void>> => {
    try {
      const response = await api.post('/api/saved-links/bulk-delete', { linkIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk update tags for saved links
  bulkUpdateTags: async (linkIds: string[], tags: string[]): Promise<ApiResponse<SavedLink[]>> => {
    try {
      const response = await api.post('/api/saved-links/bulk-update-tags', { linkIds, tags });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Increment visit count for a link
  incrementVisitCount: async (linkId: string): Promise<ApiResponse<SavedLink>> => {
    try {
      const response = await api.post(`/api/saved-links/${linkId}/visit`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get link preview/metadata from URL
  getLinkPreview: async (url: string): Promise<ApiResponse<{
    title?: string;
    description?: string;
    thumbnail?: string;
    platform?: string;
    metadata?: any;
  }>> => {
    try {
      const response = await api.post('/api/saved-links/preview', { url });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Import multiple links from a list of URLs
  importLinks: async (urls: string[]): Promise<ApiResponse<{
    successful: SavedLink[];
    failed: { url: string; error: string; }[];
  }>> => {
    try {
      const response = await api.post('/api/saved-links/import', { urls });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export saved links
  exportLinks: async (format: 'json' | 'csv' = 'json'): Promise<ApiResponse<{
    data: string;
    filename: string;
  }>> => {
    try {
      const response = await api.get(`/api/saved-links/export?format=${format}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's saved link statistics
  getStats: async (): Promise<ApiResponse<{
    totalLinks: number;
    linksByPlatform: Record<string, number>;
    linksByTag: Record<string, number>;
    totalVisits: number;
    recentActivity: Array<{
      date: string;
      linksAdded: number;
      linksVisited: number;
    }>;
  }>> => {
    try {
      const response = await api.get('/api/saved-links/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search saved links with advanced filters
  searchLinks: async (query: {
    search?: string;
    platforms?: string[];
    tags?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    links: SavedLink[];
    total: number;
    page: number;
    totalPages: number;
  }>> => {
    try {
      const response = await api.post('/api/saved-links/search', query);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

/**
 * Utility functions for saved links
 */
export const savedLinksUtils = {
  // Extract platform from URL
  getPlatformFromUrl: (url: string): SavedLink['platform'] => {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('instagram.com')) return 'instagram';
    if (hostname.includes('tiktok.com')) return 'tiktok';
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
    if (hostname.includes('pinterest.com')) return 'pinterest';
    
    return 'website';
  },

  // Validate URL format
  isValidUrl: (url: string): boolean => {
    try {
      // Clean the URL first
      const cleanUrl = url.trim();
      const urlObj = new URL(cleanUrl);
      
      // Check if it's a valid protocol
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  // Generate filename for export
  generateExportFilename: (format: 'json' | 'csv'): string => {
    const date = new Date().toISOString().split('T')[0];
    return `saved-links-${date}.${format}`;
  },

  // Format visit count for display
  formatVisitCount: (count: number): string => {
    if (count === 0) return 'Never visited';
    if (count === 1) return '1 visit';
    if (count < 1000) return `${count} visits`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K visits`;
    return `${(count / 1000000).toFixed(1)}M visits`;
  },

  // Get platform icon/emoji
  getPlatformIcon: (platform: SavedLink['platform']): string => {
    const icons = {
      instagram: '📸',
      tiktok: '🎵',
      youtube: '📺',
      pinterest: '📌',
      website: '🌐',
      other: '🔗'
    };
    return icons[platform] || icons.other;
  }
};

export default savedLinksAPI;
