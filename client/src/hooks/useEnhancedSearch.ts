import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './useToast';

interface SearchState {
  query: string;
  isSearching: boolean;
  hasSearched: boolean;
  searchError: string | null;
  suggestions: string[];
  recentSearches: string[];
  searchHistory: string[];
}

interface SearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxSuggestions?: number;
  maxRecentSearches?: number;
  enableHistory?: boolean;
  enableSuggestions?: boolean;
}

interface UseEnhancedSearchProps {
  onSearch: (query: string) => Promise<void> | void;
  onSuggestionsFetch?: (query: string) => Promise<string[]>;
  options?: SearchOptions;
}

const DEFAULT_OPTIONS: Required<SearchOptions> = {
  debounceMs: 300,
  minQueryLength: 2,
  maxSuggestions: 8,
  maxRecentSearches: 10,
  enableHistory: true,
  enableSuggestions: true,
};

const STORAGE_KEYS = {
  RECENT_SEARCHES: 'recipe_recent_searches',
  SEARCH_HISTORY: 'recipe_search_history',
} as const;

export const useEnhancedSearch = ({
  onSearch,
  onSuggestionsFetch,
  options = {},
}: UseEnhancedSearchProps) => {
  const toast = useToast();
  const config = { ...DEFAULT_OPTIONS, ...options };
  const debounceRef = useRef<NodeJS.Timeout>();
  const searchAbortRef = useRef<AbortController>();

  const [state, setState] = useState<SearchState>({
    query: '',
    isSearching: false,
    hasSearched: false,
    searchError: null,
    suggestions: [],
    recentSearches: [],
    searchHistory: [],
  });

  // Load search history from localStorage on mount
  useEffect(() => {
    if (!config.enableHistory) return;

    try {
      const recentSearches = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES) || '[]'
      );
      const searchHistory = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '[]'
      );

      setState(prev => ({
        ...prev,
        recentSearches: recentSearches.slice(0, config.maxRecentSearches),
        searchHistory: searchHistory.slice(0, 50), // Keep last 50 searches
      }));
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, [config.enableHistory, config.maxRecentSearches]);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((query: string) => {
    if (!config.enableHistory || !query.trim()) return;

    try {
      // Update recent searches
      const newRecentSearches = [
        query,
        ...state.recentSearches.filter(s => s !== query)
      ].slice(0, config.maxRecentSearches);

      // Update search history
      const newSearchHistory = [
        query,
        ...state.searchHistory.filter(s => s !== query)
      ].slice(0, 50);

      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(newRecentSearches));
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newSearchHistory));

      setState(prev => ({
        ...prev,
        recentSearches: newRecentSearches,
        searchHistory: newSearchHistory,
      }));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }, [config.enableHistory, config.maxRecentSearches, state.recentSearches, state.searchHistory]);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!config.enableSuggestions || !onSuggestionsFetch || query.length < config.minQueryLength) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    try {
      // Cancel previous request
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }

      searchAbortRef.current = new AbortController();
      const suggestions = await onSuggestionsFetch(query);
      
      setState(prev => ({
        ...prev,
        suggestions: suggestions.slice(0, config.maxSuggestions),
      }));
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.warn('Failed to fetch suggestions:', error);
        setState(prev => ({ ...prev, suggestions: [] }));
      }
    }
  }, [config.enableSuggestions, config.minQueryLength, config.maxSuggestions, onSuggestionsFetch]);

  // Debounced search execution
  const executeSearch = useCallback(async (query: string, immediate = false) => {
    const trimmedQuery = query.trim();

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // If immediate or empty query, execute right away
    if (immediate || !trimmedQuery) {
      setState(prev => ({ ...prev, isSearching: true, searchError: null }));

      try {
        await onSearch(trimmedQuery);
        
        if (trimmedQuery) {
          saveSearchHistory(trimmedQuery);
        }

        setState(prev => ({
          ...prev,
          isSearching: false,
          hasSearched: true,
          searchError: null,
        }));
      } catch (error: any) {
        const errorMessage = error.message || 'Search failed. Please try again.';
        setState(prev => ({
          ...prev,
          isSearching: false,
          searchError: errorMessage,
        }));
        toast.error(errorMessage);
      }
      return;
    }

    // Debounced execution
    debounceRef.current = setTimeout(async () => {
      setState(prev => ({ ...prev, isSearching: true, searchError: null }));

      try {
        await onSearch(trimmedQuery);
        saveSearchHistory(trimmedQuery);

        setState(prev => ({
          ...prev,
          isSearching: false,
          hasSearched: true,
          searchError: null,
        }));
      } catch (error: any) {
        const errorMessage = error.message || 'Search failed. Please try again.';
        setState(prev => ({
          ...prev,
          isSearching: false,
          searchError: errorMessage,
        }));
        toast.error(errorMessage);
      }
    }, config.debounceMs);
  }, [onSearch, saveSearchHistory, config.debounceMs, toast]);

  // Update query and trigger search/suggestions
  const setQuery = useCallback((newQuery: string) => {
    setState(prev => ({ ...prev, query: newQuery }));

    // Fetch suggestions for non-empty queries
    if (newQuery.trim()) {
      fetchSuggestions(newQuery);
      executeSearch(newQuery);
    } else {
      // Clear suggestions and execute empty search
      setState(prev => ({ ...prev, suggestions: [] }));
      executeSearch('', true);
    }
  }, [fetchSuggestions, executeSearch]);

  // Manual search trigger (e.g., on Enter key or button click)
  const triggerSearch = useCallback((query?: string) => {
    const searchQuery = query ?? state.query;
    executeSearch(searchQuery, true);
  }, [executeSearch, state.query]);

  // Clear search
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      suggestions: [],
      searchError: null,
    }));
    executeSearch('', true);
  }, [executeSearch]);

  // Clear search history
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      setState(prev => ({
        ...prev,
        recentSearches: [],
        searchHistory: [],
      }));
      toast.success('Search history cleared');
    } catch (error) {
      console.warn('Failed to clear search history:', error);
      toast.error('Failed to clear search history');
    }
  }, [toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    query: state.query,
    isSearching: state.isSearching,
    hasSearched: state.hasSearched,
    searchError: state.searchError,
    suggestions: state.suggestions,
    recentSearches: state.recentSearches,
    searchHistory: state.searchHistory,

    // Actions
    setQuery,
    triggerSearch,
    clearSearch,
    clearHistory,

    // Config
    config,
  };
};

export default useEnhancedSearch;
