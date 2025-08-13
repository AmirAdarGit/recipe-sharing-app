import { SocialRecipe, RecipeFilters } from '../pages/Recipes';

// Cache configuration
const CACHE_CONFIG = {
  MAX_ENTRIES: 100,
  CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Cache entry interface
interface CacheEntry {
  data: {
    recipes: SocialRecipe[];
    total: number;
    hasMore: boolean;
    page: number;
  };
  timestamp: number;
  filters: RecipeFilters;
  expiresAt: number;
}

// Search cache class
class SearchCache {
  private cache = new Map<string, CacheEntry>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Generate cache key from filters
   */
  private generateCacheKey(filters: RecipeFilters, page: number = 1): string {
    const keyData = {
      ...filters,
      page,
      // Normalize arrays to ensure consistent keys
      dietaryRestrictions: [...filters.dietaryRestrictions].sort(),
      tags: [...filters.tags].sort(),
    };
    
    return JSON.stringify(keyData);
  }

  /**
   * Check if cache entry is valid
   */
  private isValidEntry(entry: CacheEntry): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Get cached search results
   */
  get(filters: RecipeFilters, page: number = 1): CacheEntry['data'] | null {
    const key = this.generateCacheKey(filters, page);
    const entry = this.cache.get(key);

    if (!entry || !this.isValidEntry(entry)) {
      if (entry) {
        this.cache.delete(key);
      }
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached search results
   */
  set(
    filters: RecipeFilters,
    page: number,
    data: CacheEntry['data']
  ): void {
    const key = this.generateCacheKey(filters, page);
    const now = Date.now();

    const entry: CacheEntry = {
      data,
      timestamp: now,
      filters: { ...filters },
      expiresAt: now + CACHE_CONFIG.CACHE_DURATION,
    };

    this.cache.set(key, entry);

    // Enforce cache size limit
    if (this.cache.size > CACHE_CONFIG.MAX_ENTRIES) {
      this.evictOldestEntries();
    }
  }

  /**
   * Check if results exist in cache
   */
  has(filters: RecipeFilters, page: number = 1): boolean {
    const key = this.generateCacheKey(filters, page);
    const entry = this.cache.get(key);
    return entry ? this.isValidEntry(entry) : false;
  }

  /**
   * Clear all cached results
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear cached results for specific filters
   */
  clearForFilters(filters: Partial<RecipeFilters>): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      const shouldDelete = Object.entries(filters).every(([filterKey, filterValue]) => {
        const entryValue = entry.filters[filterKey as keyof RecipeFilters];
        
        if (Array.isArray(filterValue) && Array.isArray(entryValue)) {
          return filterValue.every(v => entryValue.includes(v));
        }
        
        return entryValue === filterValue;
      });

      if (shouldDelete) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;
    let totalHits = 0;
    let totalRequests = 0;

    this.cache.forEach(entry => {
      if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
      if (newestTimestamp === null || entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
      }
    });

    return {
      size: this.cache.size,
      maxSize: CACHE_CONFIG.MAX_ENTRIES,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      oldestEntry: oldestTimestamp,
      newestEntry: newestTimestamp,
    };
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const entriesToRemove = entries.slice(0, Math.floor(CACHE_CONFIG.MAX_ENTRIES * 0.2));
    entriesToRemove.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now >= entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.debug(`Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  /**
   * Stop automatic cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }

  /**
   * Prefetch results for common search patterns
   */
  async prefetch(
    commonFilters: RecipeFilters[],
    fetchFunction: (filters: RecipeFilters, page: number) => Promise<CacheEntry['data']>
  ): Promise<void> {
    const prefetchPromises = commonFilters.map(async (filters) => {
      if (!this.has(filters, 1)) {
        try {
          const data = await fetchFunction(filters, 1);
          this.set(filters, 1, data);
        } catch (error) {
          console.warn('Failed to prefetch search results:', error);
        }
      }
    });

    await Promise.allSettled(prefetchPromises);
  }
}

// Create singleton instance
const searchCache = new SearchCache();

// Export cache instance and utilities
export { searchCache, CACHE_CONFIG };

export default searchCache;
