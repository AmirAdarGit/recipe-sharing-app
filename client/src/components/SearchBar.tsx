import React, { useState, useRef, useEffect, useMemo } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
  isLoading?: boolean;
  hasSearched?: boolean;
  searchError?: string | null;
  showRecentSearches?: boolean;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  suggestions = [],
  recentSearches = [],
  onSuggestionSelect,
  onSearch,
  onClear,
  className = '',
  isLoading = false,
  hasSearched = false,
  searchError = null,
  showRecentSearches = true,
  disabled = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on current input
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(value.toLowerCase()) && suggestion !== value
  );

  // Combine suggestions and recent searches for display
  const displayItems = useMemo(() => {
    const items: Array<{ text: string; type: 'suggestion' | 'recent' }> = [];

    // Add filtered suggestions first
    filteredSuggestions.forEach(suggestion => {
      items.push({ text: suggestion, type: 'suggestion' });
    });

    // Add recent searches if no current value or if showing recent searches
    if (showRecentSearches && (!value.trim() || filteredSuggestions.length < 3)) {
      const relevantRecent = recentSearches
        .filter(recent =>
          recent !== value &&
          !items.some(item => item.text === recent) &&
          (!value.trim() || recent.toLowerCase().includes(value.toLowerCase()))
        )
        .slice(0, value.trim() ? 3 : 5);

      relevantRecent.forEach(recent => {
        items.push({ text: recent, type: 'recent' });
      });
    }

    return items.slice(0, 8); // Limit total items
  }, [filteredSuggestions, recentSearches, value, showRecentSearches]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setActiveSuggestionIndex(-1);

    if (newValue.trim() || displayItems.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true);
    if (value.trim() || displayItems.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for suggestion clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    }, 150);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        if (showSuggestions && displayItems.length > 0) {
          e.preventDefault();
          setActiveSuggestionIndex(prev =>
            prev < displayItems.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        if (showSuggestions && displayItems.length > 0) {
          e.preventDefault();
          setActiveSuggestionIndex(prev =>
            prev > 0 ? prev - 1 : displayItems.length - 1
          );
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (showSuggestions && activeSuggestionIndex >= 0 && displayItems[activeSuggestionIndex]) {
          handleSuggestionClick(displayItems[activeSuggestionIndex].text);
        } else {
          // Trigger search with current value
          onSearch?.(value);
          setShowSuggestions(false);
          inputRef.current?.blur();
        }
        break;

      case 'Escape':
        if (showSuggestions) {
          setShowSuggestions(false);
          setActiveSuggestionIndex(-1);
        } else {
          // Clear search if suggestions are not shown
          handleClear();
        }
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Handle clear button
  const handleClear = () => {
    onChange('');
    onClear?.();
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`search-bar ${className} ${isFocused ? 'focused' : ''} ${isLoading ? 'loading' : ''} ${searchError ? 'error' : ''}`}>
      <div className="search-input-container">
        <div className="search-icon">
          {isLoading ? (
            <div className="loading-spinner">⟳</div>
          ) : (
            '🔍'
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="search-input"
          autoComplete="off"
          disabled={disabled}
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
        />

        {value && !isLoading && (
          <button
            onClick={handleClear}
            className="clear-button"
            type="button"
            title="Clear search"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Error */}
      {searchError && (
        <div className="search-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{searchError}</span>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && displayItems.length > 0 && (
        <div ref={suggestionsRef} className="suggestions-dropdown" role="listbox">
          <div className="suggestions-list">
            {displayItems.map((item, index) => (
              <button
                key={`${item.type}-${item.text}`}
                onClick={() => handleSuggestionClick(item.text)}
                className={`suggestion-item ${item.type} ${
                  index === activeSuggestionIndex ? 'active' : ''
                }`}
                type="button"
                role="option"
                aria-selected={index === activeSuggestionIndex}
              >
                <span className="suggestion-icon">
                  {item.type === 'recent' ? '🕒' : '🔍'}
                </span>
                <span className="suggestion-text">{item.text}</span>
                {item.type === 'recent' && (
                  <span className="suggestion-label">Recent</span>
                )}
              </button>
            ))}
          </div>

          {(filteredSuggestions.length > 8 || recentSearches.length > 5) && (
            <div className="suggestions-footer">
              <span className="suggestions-count">
                {filteredSuggestions.length > 0 && `${filteredSuggestions.length} suggestions`}
                {filteredSuggestions.length > 0 && recentSearches.length > 0 && ' • '}
                {recentSearches.length > 0 && `${recentSearches.length} recent`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
