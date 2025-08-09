import React, { useState } from 'react';
import { LinkFilters as FilterType } from '../pages/SavedLinks';
import './LinkFilters.css';

interface LinkFiltersProps {
  filters: FilterType;
  availableTags: string[];
  onFilterChange: (filters: Partial<FilterType>) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalLinks: number;
}

const LinkFilters: React.FC<LinkFiltersProps> = ({
  filters,
  availableTags,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalLinks
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Platform options
  const platformOptions = [
    { value: '', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'pinterest', label: 'Pinterest' },
    { value: 'website', label: 'Websites' },
    { value: 'other', label: 'Other' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'title', label: 'Title' },
    { value: 'visitCount', label: 'Visit Count' },
    { value: 'updatedAt', label: 'Last Updated' }
  ];

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  // Handle platform filter
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ platform: e.target.value });
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ sortBy: e.target.value as FilterType['sortBy'] });
  };

  // Handle sort order toggle
  const handleSortOrderToggle = () => {
    onFilterChange({ 
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
    });
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFilterChange({ tags: newTags });
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      platform: '',
      tags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.platform || filters.tags.length > 0;

  return (
    <div className="link-filters">
      {/* Main Filter Bar */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search links, tags, or notes..."
              value={filters.search}
              onChange={handleSearchChange}
              className="search-input"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="clear-search-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Platform Filter */}
        <div className="filter-group">
          <select
            value={filters.platform}
            onChange={handlePlatformChange}
            className="platform-select"
          >
            {platformOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Controls */}
        <div className="filter-group sort-controls">
          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            className="sort-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleSortOrderToggle}
            className="sort-order-btn"
            title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="filter-group view-mode-toggle">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            title="Grid view"
          >
            ⊞
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            title="List view"
          >
            ☰
          </button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="filter-group">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`advanced-toggle ${showAdvancedFilters ? 'active' : ''}`}
          >
            <span className="toggle-icon">⚙️</span>
            <span className="toggle-text">Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="advanced-filters-header">
            <h3>Filter by Tags</h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="clear-filters-btn"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Tag Filters */}
          {availableTags.length > 0 ? (
            <div className="tag-filters">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-filter ${filters.tags.includes(tag) ? 'active' : ''}`}
                >
                  <span className="tag-name">{tag}</span>
                  {filters.tags.includes(tag) && (
                    <span className="tag-remove">✕</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="no-tags">
              <p>No tags available. Add tags to your links to filter by them.</p>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {totalLinks} {totalLinks === 1 ? 'link' : 'links'}
          {hasActiveFilters && ' found'}
        </span>
        
        {hasActiveFilters && (
          <div className="active-filters">
            {filters.search && (
              <span className="active-filter">
                Search: "{filters.search}"
                <button onClick={() => onFilterChange({ search: '' })}>✕</button>
              </span>
            )}
            
            {filters.platform && (
              <span className="active-filter">
                Platform: {platformOptions.find(p => p.value === filters.platform)?.label}
                <button onClick={() => onFilterChange({ platform: '' })}>✕</button>
              </span>
            )}
            
            {filters.tags.map(tag => (
              <span key={tag} className="active-filter">
                Tag: {tag}
                <button onClick={() => handleTagToggle(tag)}>✕</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkFilters;
