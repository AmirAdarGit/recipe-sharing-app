import React from 'react';
import './SearchResultsHeader.css';

interface SearchResultsHeaderProps {
  totalResults: number;
  currentResults: number;
  searchQuery: string;
  isLoading: boolean;
  hasSearched: boolean;
  searchError?: string | null;
  onClearSearch?: () => void;
  loadingText?: string;
}

const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  totalResults,
  currentResults,
  searchQuery,
  isLoading,
  hasSearched,
  searchError,
  onClearSearch,
  loadingText = 'Searching...'
}) => {
  const hasQuery = searchQuery.trim().length > 0;
  const hasResults = totalResults > 0;

  // Don't show anything if no search has been performed
  if (!hasSearched && !hasQuery) {
    return null;
  }

  return (
    <div className="search-results-header">
      {/* Loading State */}
      {isLoading && (
        <div className="search-status loading">
          <div className="status-icon">
            <div className="loading-spinner">⟳</div>
          </div>
          <div className="status-content">
            <h3 className="status-title">{loadingText}</h3>
            {hasQuery && (
              <p className="status-description">
                Looking for recipes matching "{searchQuery}"...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {searchError && !isLoading && (
        <div className="search-status error">
          <div className="status-icon">⚠️</div>
          <div className="status-content">
            <h3 className="status-title">Search Error</h3>
            <p className="status-description">{searchError}</p>
            <button 
              onClick={onClearSearch}
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Results State */}
      {!isLoading && !searchError && hasSearched && (
        <div className="search-status results">
          <div className="status-icon">
            {hasResults ? '🔍' : '😔'}
          </div>
          <div className="status-content">
            {hasResults ? (
              <>
                <h3 className="status-title">
                  {totalResults.toLocaleString()} recipe{totalResults !== 1 ? 's' : ''} found
                  {hasQuery && (
                    <span className="search-query"> for "{searchQuery}"</span>
                  )}
                </h3>
                <p className="status-description">
                  Showing {currentResults} of {totalResults.toLocaleString()} results
                  {hasQuery && (
                    <button 
                      onClick={onClearSearch}
                      className="clear-search-link"
                    >
                      Clear search
                    </button>
                  )}
                </p>
              </>
            ) : (
              <>
                <h3 className="status-title">
                  No recipes found
                  {hasQuery && (
                    <span className="search-query"> for "{searchQuery}"</span>
                  )}
                </h3>
                <p className="status-description">
                  Try adjusting your search terms or{' '}
                  <button 
                    onClick={onClearSearch}
                    className="clear-search-link"
                  >
                    browse all recipes
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Suggestions for No Results */}
      {!isLoading && !searchError && hasSearched && !hasResults && hasQuery && (
        <div className="search-suggestions">
          <h4 className="suggestions-title">Try searching for:</h4>
          <div className="suggestions-list">
            {[
              'pasta recipes',
              'chicken dishes',
              'vegetarian meals',
              'quick dinners',
              'healthy options',
              'desserts'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onClearSearch?.()}
                className="suggestion-chip"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsHeader;
