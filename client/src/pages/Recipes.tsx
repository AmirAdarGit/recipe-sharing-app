import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { useEnhancedSearch } from '../hooks/useEnhancedSearch';
import { socialRecipesAPI } from '../services/socialRecipesAPI';
import { getSearchSuggestions } from '../services/searchSuggestionsAPI';
import { searchCache } from '../services/searchCache';
import SearchBar from '../components/SearchBar';
import SearchResultsHeader from '../components/SearchResultsHeader';
import RecipeFilters from '../components/RecipeFilters';
import RecipeCard from '../components/RecipeCard';
import UserProfileCard from '../components/UserProfileCard';
import ActivityFeed from '../components/ActivityFeed';
import InfiniteScroll from '../components/InfiniteScroll';
import './Recipes.css';

// TypeScript interfaces
export interface SocialRecipe {
  _id: string;
  title: string;
  description: string;
  author: {
    _id: string;
    firebaseUid: string;
    displayName: string;
    photoURL?: string;
    profile?: {
      bio?: string;
      followerCount?: number;
      followingCount?: number;
      recipeCount?: number;
    };
  };
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
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
    image?: string;
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
  dietaryInfo: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isNutFree: boolean;
    isKeto: boolean;
    isPaleo: boolean;
  };
  stats: {
    views: number;
    likes: number;
    saves: number;
    comments: number;
    rating: {
      average: number;
      count: number;
    };
  };
  socialInteractions: {
    isLiked: boolean;
    isSaved: boolean;
    isFollowingAuthor: boolean;
  };
  isPublic: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeFilters {
  search: string;
  category: string;
  cuisine: string;
  difficulty: string;
  cookingTime: string;
  dietaryRestrictions: string[];
  tags: string[];
  author: string;
  sortBy: 'relevance' | 'newest' | 'popular' | 'rating' | 'cookingTime';
  sortOrder: 'asc' | 'desc';
}

export interface UserActivity {
  _id: string;
  type: 'recipe_published' | 'recipe_liked' | 'user_followed' | 'comment_added';
  user: {
    _id: string;
    displayName: string;
    photoURL?: string;
  };
  recipe?: {
    _id: string;
    title: string;
    images: Array<{ url: string; isPrimary: boolean; }>;
  };
  targetUser?: {
    _id: string;
    displayName: string;
    photoURL?: string;
  };
  createdAt: string;
}

const Recipes: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State management
  const [recipes, setRecipes] = useState<SocialRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);

  // Activity feed state
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  // Helper function to parse filters from URL params
  const parseFiltersFromParams = useCallback((params: URLSearchParams): RecipeFilters => ({
    search: params.get('search') || '',
    category: params.get('category') || '',
    cuisine: params.get('cuisine') || '',
    difficulty: params.get('difficulty') || '',
    cookingTime: params.get('cookingTime') || '',
    dietaryRestrictions: params.get('dietary')?.split(',').filter(Boolean) || [],
    tags: params.get('tags')?.split(',').filter(Boolean) || [],
    author: params.get('author') || '',
    sortBy: (params.get('sortBy') as RecipeFilters['sortBy']) || 'relevance',
    sortOrder: (params.get('sortOrder') as RecipeFilters['sortOrder']) || 'desc'
  }), []);

  // Ref to track if we're updating from URL to prevent loops
  const isUpdatingFromURL = useRef(false);

  // Filter state - initialize with default values first
  const [filters, setFilters] = useState<RecipeFilters>(() =>
    parseFiltersFromParams(searchParams)
  );

  // Available filter options (would come from API in real implementation)
  const filterOptions = useMemo(() => ({
    categories: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Beverage'],
    cuisines: ['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Indian', 'French', 'Thai'],
    difficulties: ['easy', 'medium', 'hard'],
    cookingTimes: ['under-30', '30-60', '60-120', 'over-120'],
    dietaryRestrictions: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo'],
    sortOptions: [
      { value: 'relevance', label: 'Most Relevant' },
      { value: 'newest', label: 'Newest First' },
      { value: 'popular', label: 'Most Popular' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'cookingTime', label: 'Cooking Time' }
    ]
  }), []);

  // Update URL params when filters change (simplified to break dependency chain)
  const updateURLParams = useCallback((newFilters: RecipeFilters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (typeof value === 'string' && value.trim()) {
          params.set(key, value);
        }
      }
    });

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Sync filters with URL params when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newFilters = parseFiltersFromParams(searchParams);
    // Only update if filters actually changed to prevent infinite loop
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(newFilters);
    if (filtersChanged) {
      setFilters(newFilters);
    }
  }, [searchParams, parseFiltersFromParams]); // Removed filters dependency

  // Enhanced fetch recipes with caching
  const fetchRecipes = useCallback(async (
    filtersToUse: RecipeFilters,
    pageNum: number = 1,
    resetData: boolean = true
  ) => {
    try {
      if (resetData) {
        setLoading(true);
        setError(null);
      }

      // Check cache first
      const cachedData = searchCache.get(filtersToUse, pageNum);
      if (cachedData && !resetData) {
        setRecipes(prev => [...prev, ...cachedData.recipes]);
        setTotalRecipes(cachedData.total);
        setHasMore(cachedData.hasMore);
        setPage(pageNum);
        if (resetData) {
          setLoading(false);
        }
        return;
      }

      const queryParams = {
        page: pageNum,
        limit: 12,
        ...filtersToUse,
        dietaryRestrictions: filtersToUse.dietaryRestrictions.length > 0 ? filtersToUse.dietaryRestrictions : undefined,
        tags: filtersToUse.tags.length > 0 ? filtersToUse.tags : undefined
      };

      const response = await socialRecipesAPI.searchRecipes(queryParams);

      if (response.success && response.data) {
        const { recipes: newRecipes, total, hasMore: moreAvailable } = response.data;

        // Cache the results
        const cacheData = {
          recipes: newRecipes,
          total,
          hasMore: moreAvailable,
          page: pageNum
        };
        searchCache.set(filtersToUse, pageNum, cacheData);

        if (resetData) {
          setRecipes(newRecipes);
        } else {
          setRecipes(prev => [...prev, ...newRecipes]);
        }

        setTotalRecipes(total);
        setHasMore(moreAvailable);
        setPage(pageNum);
      } else {
        throw new Error('Failed to fetch recipes');
      }
    } catch (error: any) {
      console.error('Error fetching recipes:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load recipes';
      setError(errorMessage);
      if (resetData) {
        toast.error(errorMessage);
      }
    } finally {
      if (resetData) {
        setLoading(false);
      }
    }
  }, [toast]);

  // Fetch activity feed
  const fetchActivityFeed = useCallback(async () => {
    if (!user) return;

    try {
      setLoadingActivities(true);
      const response = await socialRecipesAPI.getActivityFeed();

      if (response.success && response.data) {
        setActivities(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setLoadingActivities(false);
    }
  }, [user]);

  // Enhanced search functionality
  const enhancedSearch = useEnhancedSearch({
    onSearch: async (query: string) => {
      const searchFilters = { ...filters, search: query };
      await fetchRecipes(searchFilters, 1, true);
    },
    onSuggestionsFetch: getSearchSuggestions,
    options: {
      debounceMs: 300,
      minQueryLength: 1,
      maxSuggestions: 8,
      maxRecentSearches: 10,
      enableHistory: true,
      enableSuggestions: true,
    }
  });

  // Load recipes when filters change
  useEffect(() => {
    fetchRecipes(filters, 1, true);
  }, [filters]); // Removed fetchRecipes dependency to prevent infinite loop

  // Load activity feed for logged-in users
  useEffect(() => {
    if (user && showActivityFeed) {
      fetchActivityFeed();
    }
  }, [user, showActivityFeed, fetchActivityFeed]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<RecipeFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    updateURLParams(updatedFilters);
    setPage(1);
  }, [filters, updateURLParams]);

  // Handle clearing all filters
  const handleClearFilters = useCallback(() => {
    const clearedFilters: RecipeFilters = {
      search: '',
      category: '',
      cuisine: '',
      difficulty: '',
      cookingTime: '',
      dietaryRestrictions: [],
      tags: [],
      author: '',
      sortBy: 'relevance',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    updateURLParams(clearedFilters);
    setPage(1);
  }, [updateURLParams]);

  // Handle load more for infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchRecipes(filters, page + 1, false);
    }
  }, [loading, hasMore, page, filters, fetchRecipes]);

  // Handle recipe interactions
  const handleLikeRecipe = useCallback(async (recipeId: string) => {
    if (!user) {
      toast.authError('login', 'Please log in to like recipes');
      return;
    }

    try {
      const recipe = recipes.find(r => r._id === recipeId);
      if (!recipe) return;

      const wasLiked = recipe.socialInteractions.isLiked;

      // Optimistic update
      setRecipes(prev => prev.map(r =>
        r._id === recipeId
          ? {
              ...r,
              socialInteractions: { ...r.socialInteractions, isLiked: !wasLiked },
              stats: { ...r.stats, likes: wasLiked ? r.stats.likes - 1 : r.stats.likes + 1 }
            }
          : r
      ));

      const response = await socialRecipesAPI.toggleLike(recipeId);

      if (!response.success) {
        // Revert optimistic update on failure
        setRecipes(prev => prev.map(r =>
          r._id === recipeId
            ? {
                ...r,
                socialInteractions: { ...r.socialInteractions, isLiked: wasLiked },
                stats: { ...r.stats, likes: wasLiked ? r.stats.likes + 1 : r.stats.likes - 1 }
              }
            : r
        ));
        throw new Error('Failed to update like status');
      }

      toast.success(wasLiked ? 'Recipe unliked' : 'Recipe liked');
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  }, [user, recipes, toast]);

  const handleSaveRecipe = useCallback(async (recipeId: string) => {
    if (!user) {
      toast.authError('login', 'Please log in to save recipes');
      return;
    }

    try {
      const recipe = recipes.find(r => r._id === recipeId);
      if (!recipe) return;

      const wasSaved = recipe.socialInteractions.isSaved;

      // Optimistic update
      setRecipes(prev => prev.map(r =>
        r._id === recipeId
          ? {
              ...r,
              socialInteractions: { ...r.socialInteractions, isSaved: !wasSaved },
              stats: { ...r.stats, saves: wasSaved ? r.stats.saves - 1 : r.stats.saves + 1 }
            }
          : r
      ));

      const response = await socialRecipesAPI.toggleSave(recipeId);

      if (!response.success) {
        // Revert optimistic update on failure
        setRecipes(prev => prev.map(r =>
          r._id === recipeId
            ? {
                ...r,
                socialInteractions: { ...r.socialInteractions, isSaved: wasSaved },
                stats: { ...r.stats, saves: wasSaved ? r.stats.saves + 1 : r.stats.saves - 1 }
              }
            : r
        ));
        throw new Error('Failed to update save status');
      }

      toast.success(wasSaved ? 'Recipe removed from saved' : 'Recipe saved');
    } catch (error: any) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update save status');
    }
  }, [user, recipes, toast]);

  const handleFollowUser = useCallback(async (userId: string) => {
    if (!user) {
      toast.authError('login', 'Please log in to follow users');
      return;
    }

    try {
      const response = await socialRecipesAPI.toggleFollow(userId);

      if (response.success) {
        // Update recipes to reflect follow status
        setRecipes(prev => prev.map(r =>
          r.author._id === userId
            ? {
                ...r,
                socialInteractions: {
                  ...r.socialInteractions,
                  isFollowingAuthor: !r.socialInteractions.isFollowingAuthor
                }
              }
            : r
        ));

        const isNowFollowing = !recipes.find(r => r.author._id === userId)?.socialInteractions.isFollowingAuthor;
        toast.success(isNowFollowing ? 'User followed' : 'User unfollowed');
      } else {
        throw new Error('Failed to update follow status');
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  }, [user, recipes, toast]);

  const handleShareRecipe = useCallback(async (recipe: SocialRecipe) => {
    try {
      const shareData = {
        title: recipe.title,
        text: recipe.description,
        url: `${window.location.origin}/recipe/${recipe._id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Recipe link copied to clipboard');
      }
    } catch (error: any) {
      console.error('Error sharing recipe:', error);
      if (error.name !== 'AbortError') {
        toast.error('Failed to share recipe');
      }
    }
  }, [toast]);

  const handleViewRecipe = useCallback((recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  }, [navigate]);

  const handleViewProfile = useCallback((userId: string) => {
    navigate(`/profile/${userId}`);
  }, [navigate]);

  // Loading state
  if (loading && recipes.length === 0) {
    return (
      <div className="recipes-page theme-bg-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Discovering amazing recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && recipes.length === 0) {
    return (
      <div className="recipes-page theme-bg-page">
        <div className="container">
          <div className="error-state theme-card">
            <div className="error-icon">😞</div>
            <h2>Failed to Load Recipes</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button
                onClick={() => fetchRecipes(1, true)}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recipes-page theme-bg-page">
      <div className="container">
        {/* Page Header */}
        <header className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">🍽️ Discover Recipes</h1>
              <p className="page-description">
                Explore amazing recipes from our community of food lovers
              </p>
            </div>

            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-value">{totalRecipes.toLocaleString()}</span>
                <span className="stat-label">Recipes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{recipes.length}</span>
                <span className="stat-label">Showing</span>
              </div>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="search-section">
          <SearchBar
            value={enhancedSearch.query}
            onChange={enhancedSearch.setQuery}
            placeholder="Search recipes, ingredients, or authors..."
            suggestions={enhancedSearch.suggestions}
            recentSearches={enhancedSearch.recentSearches}
            onSuggestionSelect={(suggestion) => {
              enhancedSearch.setQuery(suggestion);
              handleFilterChange({ search: suggestion });
            }}
            onSearch={(query) => {
              enhancedSearch.triggerSearch(query);
              handleFilterChange({ search: query });
            }}
            onClear={() => {
              enhancedSearch.clearSearch();
              handleFilterChange({ search: '' });
            }}
            isLoading={enhancedSearch.isSearching || loading}
            hasSearched={enhancedSearch.hasSearched}
            searchError={enhancedSearch.searchError}
            showRecentSearches={true}
          />

          {/* Search Results Header */}
          <SearchResultsHeader
            totalResults={totalRecipes}
            currentResults={recipes.length}
            searchQuery={enhancedSearch.query}
            isLoading={enhancedSearch.isSearching || loading}
            hasSearched={enhancedSearch.hasSearched}
            searchError={enhancedSearch.searchError || error}
            onClearSearch={() => {
              enhancedSearch.clearSearch();
              handleClearFilters();
            }}
            loadingText={enhancedSearch.isSearching ? 'Searching...' : 'Loading recipes...'}
          />

          <div className="filter-controls">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            >
              <span className="btn-icon">⚙️</span>
              <span className="btn-text">Filters</span>
              {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
                <span className="filter-indicator">●</span>
              )}
            </button>

            <div className="view-controls">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Grid view"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                title="List view"
              >
                ☰
              </button>
            </div>

            {user && (
              <button
                onClick={() => setShowActivityFeed(!showActivityFeed)}
                className={`activity-toggle-btn ${showActivityFeed ? 'active' : ''}`}
              >
                <span className="btn-icon">📈</span>
                <span className="btn-text">Activity</span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <RecipeFilters
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Main Content */}
        <div className="main-content">
          {/* Recipe Feed */}
          <div className="recipe-feed">
            {recipes.length === 0 && !loading && !enhancedSearch.isSearching ? (
              <div className="empty-state theme-card">
                <div className="empty-icon">
                  {enhancedSearch.query ? '🔍' : '🍽️'}
                </div>
                <h2>
                  {enhancedSearch.query
                    ? `No recipes found for "${enhancedSearch.query}"`
                    : 'Welcome to Recipe Discovery!'
                  }
                </h2>
                <p>
                  {enhancedSearch.query
                    ? 'Try different keywords or browse our popular categories below.'
                    : 'Start by searching for your favorite ingredients or browse our curated collections.'
                  }
                </p>

                {/* Popular search suggestions */}
                <div className="popular-searches">
                  <h4>Popular searches:</h4>
                  <div className="search-chips">
                    {['pasta', 'chicken', 'vegetarian', 'dessert', 'quick meals', 'healthy'].map(term => (
                      <button
                        key={term}
                        onClick={() => {
                          enhancedSearch.setQuery(term);
                          handleFilterChange({ search: term });
                        }}
                        className="search-chip"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    enhancedSearch.clearSearch();
                    handleClearFilters();
                  }}
                  className="btn btn-primary"
                >
                  {enhancedSearch.query ? 'Clear Search' : 'Browse All Recipes'}
                </button>
              </div>
            ) : recipes.length > 0 ? (
              <InfiniteScroll
                hasMore={hasMore}
                loadMore={handleLoadMore}
                loading={loading}
              >
                <div className={`recipes-grid ${viewMode}`}>
                  {recipes.map(recipe => (
                    <RecipeCard
                      key={recipe._id}
                      recipe={recipe}
                      onLike={() => handleLikeRecipe(recipe._id)}
                      onSave={() => handleSaveRecipe(recipe._id)}
                      onShare={() => handleShareRecipe(recipe)}
                      onView={() => handleViewRecipe(recipe._id)}
                      onFollowAuthor={() => handleFollowUser(recipe.author._id)}
                      onViewProfile={() => handleViewProfile(recipe.author._id)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            ) : null}
          </div>

          {/* Activity Feed Sidebar */}
          {user && showActivityFeed && (
            <aside className="activity-sidebar">
              <ActivityFeed
                activities={activities}
                loading={loadingActivities}
                onRefresh={fetchActivityFeed}
                onViewProfile={handleViewProfile}
                onViewRecipe={handleViewRecipe}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
