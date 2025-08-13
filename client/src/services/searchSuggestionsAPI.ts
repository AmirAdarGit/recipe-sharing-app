import { socialRecipesAPI } from './socialRecipesAPI';

// Cache for search suggestions
const suggestionCache = new Map<string, { suggestions: string[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Popular search terms (fallback when no suggestions available)
const POPULAR_SEARCHES = [
  'pasta',
  'chicken',
  'vegetarian',
  'dessert',
  'quick meals',
  'healthy',
  'italian',
  'mexican',
  'asian',
  'breakfast',
  'lunch',
  'dinner',
  'appetizers',
  'salad',
  'soup',
  'bread',
  'cake',
  'cookies',
  'pizza',
  'sandwich'
];

// Recipe categories for suggestions
const RECIPE_CATEGORIES = [
  'appetizers',
  'main course',
  'desserts',
  'beverages',
  'breakfast',
  'lunch',
  'dinner',
  'snacks',
  'side dishes',
  'soups',
  'salads',
  'pasta',
  'pizza',
  'seafood',
  'meat',
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'low-carb',
  'keto',
  'paleo'
];

// Cuisine types for suggestions
const CUISINE_TYPES = [
  'italian',
  'mexican',
  'chinese',
  'japanese',
  'indian',
  'thai',
  'french',
  'greek',
  'mediterranean',
  'american',
  'korean',
  'vietnamese',
  'spanish',
  'middle eastern',
  'moroccan',
  'brazilian',
  'german',
  'british'
];

// Common ingredients for suggestions
const COMMON_INGREDIENTS = [
  'chicken',
  'beef',
  'pork',
  'fish',
  'salmon',
  'shrimp',
  'eggs',
  'cheese',
  'tomatoes',
  'onions',
  'garlic',
  'potatoes',
  'rice',
  'pasta',
  'bread',
  'flour',
  'butter',
  'olive oil',
  'herbs',
  'spices'
];

interface SuggestionResponse {
  suggestions: string[];
  categories: string[];
  ingredients: string[];
  recipes: string[];
}

/**
 * Generate local suggestions based on query
 */
const generateLocalSuggestions = (query: string): string[] => {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    return POPULAR_SEARCHES.slice(0, 8);
  }

  const suggestions: string[] = [];
  
  // Add matching popular searches
  POPULAR_SEARCHES.forEach(term => {
    if (term.toLowerCase().includes(lowerQuery) && !suggestions.includes(term)) {
      suggestions.push(term);
    }
  });

  // Add matching categories
  RECIPE_CATEGORIES.forEach(category => {
    if (category.toLowerCase().includes(lowerQuery) && !suggestions.includes(category)) {
      suggestions.push(category);
    }
  });

  // Add matching cuisines
  CUISINE_TYPES.forEach(cuisine => {
    if (cuisine.toLowerCase().includes(lowerQuery) && !suggestions.includes(cuisine)) {
      suggestions.push(cuisine);
    }
  });

  // Add matching ingredients
  COMMON_INGREDIENTS.forEach(ingredient => {
    if (ingredient.toLowerCase().includes(lowerQuery) && !suggestions.includes(ingredient)) {
      suggestions.push(ingredient);
    }
  });

  // If no matches, return popular searches
  if (suggestions.length === 0) {
    return POPULAR_SEARCHES.slice(0, 5);
  }

  return suggestions.slice(0, 8);
};

/**
 * Check if cache is valid
 */
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

/**
 * Get search suggestions from cache or generate new ones
 */
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  const trimmedQuery = query.trim().toLowerCase();
  
  // Return empty array for very short queries
  if (trimmedQuery.length < 1) {
    return [];
  }

  // Check cache first
  const cached = suggestionCache.get(trimmedQuery);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.suggestions;
  }

  try {
    // For now, use local suggestions since we don't have a backend endpoint
    // In a real app, you would call an API endpoint here
    const suggestions = generateLocalSuggestions(trimmedQuery);
    
    // Cache the results
    suggestionCache.set(trimmedQuery, {
      suggestions,
      timestamp: Date.now()
    });

    return suggestions;
  } catch (error) {
    console.warn('Failed to fetch search suggestions:', error);
    
    // Fallback to local suggestions
    const fallbackSuggestions = generateLocalSuggestions(trimmedQuery);
    
    // Cache fallback results with shorter duration
    suggestionCache.set(trimmedQuery, {
      suggestions: fallbackSuggestions,
      timestamp: Date.now() - (CACHE_DURATION * 0.8) // Expire sooner for fallback
    });

    return fallbackSuggestions;
  }
};

/**
 * Get trending search terms (mock implementation)
 */
export const getTrendingSearches = async (): Promise<string[]> => {
  // In a real app, this would fetch from an analytics API
  return [
    'holiday recipes',
    'quick dinner',
    'healthy breakfast',
    'comfort food',
    'meal prep',
    'one pot meals',
    'vegetarian dinner',
    'easy desserts'
  ];
};

/**
 * Clear suggestion cache
 */
export const clearSuggestionCache = (): void => {
  suggestionCache.clear();
};

/**
 * Get cache size for debugging
 */
export const getCacheSize = (): number => {
  return suggestionCache.size;
};

/**
 * Preload popular suggestions
 */
export const preloadPopularSuggestions = async (): Promise<void> => {
  try {
    const popularQueries = ['chicken', 'pasta', 'vegetarian', 'dessert', 'quick'];
    
    await Promise.all(
      popularQueries.map(query => getSearchSuggestions(query))
    );
  } catch (error) {
    console.warn('Failed to preload suggestions:', error);
  }
};

export default {
  getSearchSuggestions,
  getTrendingSearches,
  clearSuggestionCache,
  getCacheSize,
  preloadPopularSuggestions
};
