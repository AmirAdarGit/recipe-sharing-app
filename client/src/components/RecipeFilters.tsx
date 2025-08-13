import React, { useState } from 'react';
import { RecipeFilters as FilterType } from '../pages/Recipes';
import './RecipeFilters.css';

interface RecipeFiltersProps {
  filters: FilterType;
  filterOptions: {
    categories: string[];
    cuisines: string[];
    difficulties: string[];
    cookingTimes: string[];
    dietaryRestrictions: string[];
    sortOptions: Array<{ value: string; label: string; }>;
  };
  onFilterChange: (filters: Partial<FilterType>) => void;
  onClearFilters: () => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Handle select change
  const handleSelectChange = (field: keyof FilterType, value: string) => {
    onFilterChange({ [field]: value });
  };

  // Handle multi-select change
  const handleMultiSelectChange = (field: keyof FilterType, value: string) => {
    const currentValues = filters[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFilterChange({ [field]: newValues });
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    onFilterChange({ sortBy: sortBy as FilterType['sortBy'] });
  };

  // Handle sort order toggle
  const handleSortOrderToggle = () => {
    onFilterChange({ 
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'sortBy' && value === 'relevance') return false;
    if (key === 'sortOrder' && value === 'desc') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value && value.trim() !== '';
  });

  // Format cooking time label
  const formatCookingTimeLabel = (value: string): string => {
    const labels: Record<string, string> = {
      'under-30': 'Under 30 min',
      '30-60': '30-60 min',
      '60-120': '1-2 hours',
      'over-120': 'Over 2 hours'
    };
    return labels[value] || value;
  };

  return (
    <div className="recipe-filters">
      <div className="filters-header">
        <h3>Filter Recipes</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="clear-all-btn"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Basic Filters */}
      <div className="filter-section">
        <button
          onClick={() => toggleSection('basic')}
          className={`section-header ${expandedSections.has('basic') ? 'expanded' : ''}`}
        >
          <span className="section-title">Basic Filters</span>
          <span className="section-toggle">{expandedSections.has('basic') ? '−' : '+'}</span>
        </button>

        {expandedSections.has('basic') && (
          <div className="section-content">
            {/* Category */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleSelectChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Cuisine */}
            <div className="filter-group">
              <label className="filter-label">Cuisine</label>
              <select
                value={filters.cuisine}
                onChange={(e) => handleSelectChange('cuisine', e.target.value)}
                className="filter-select"
              >
                <option value="">All Cuisines</option>
                {filterOptions.cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="filter-group">
              <label className="filter-label">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleSelectChange('difficulty', e.target.value)}
                className="filter-select"
              >
                <option value="">Any Difficulty</option>
                {filterOptions.difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Cooking Time */}
            <div className="filter-group">
              <label className="filter-label">Cooking Time</label>
              <select
                value={filters.cookingTime}
                onChange={(e) => handleSelectChange('cookingTime', e.target.value)}
                className="filter-select"
              >
                <option value="">Any Time</option>
                {filterOptions.cookingTimes.map(time => (
                  <option key={time} value={time}>
                    {formatCookingTimeLabel(time)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Dietary Restrictions */}
      <div className="filter-section">
        <button
          onClick={() => toggleSection('dietary')}
          className={`section-header ${expandedSections.has('dietary') ? 'expanded' : ''}`}
        >
          <span className="section-title">Dietary Restrictions</span>
          <span className="section-toggle">{expandedSections.has('dietary') ? '−' : '+'}</span>
        </button>

        {expandedSections.has('dietary') && (
          <div className="section-content">
            <div className="filter-group">
              <div className="checkbox-grid">
                {filterOptions.dietaryRestrictions.map(restriction => (
                  <label key={restriction} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.dietaryRestrictions.includes(restriction)}
                      onChange={() => handleMultiSelectChange('dietaryRestrictions', restriction)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-label">
                      {restriction.charAt(0).toUpperCase() + restriction.slice(1).replace('-', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div className="filter-section">
        <button
          onClick={() => toggleSection('sort')}
          className={`section-header ${expandedSections.has('sort') ? 'expanded' : ''}`}
        >
          <span className="section-title">Sort By</span>
          <span className="section-toggle">{expandedSections.has('sort') ? '−' : '+'}</span>
        </button>

        {expandedSections.has('sort') && (
          <div className="section-content">
            <div className="filter-group">
              <div className="sort-controls">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="filter-select"
                >
                  {filterOptions.sortOptions.map(option => (
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
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="active-filters-summary">
          <h4>Active Filters:</h4>
          <div className="active-filters-list">
            {filters.category && (
              <span className="active-filter">
                Category: {filters.category}
                <button onClick={() => handleSelectChange('category', '')}>×</button>
              </span>
            )}
            {filters.cuisine && (
              <span className="active-filter">
                Cuisine: {filters.cuisine}
                <button onClick={() => handleSelectChange('cuisine', '')}>×</button>
              </span>
            )}
            {filters.difficulty && (
              <span className="active-filter">
                Difficulty: {filters.difficulty}
                <button onClick={() => handleSelectChange('difficulty', '')}>×</button>
              </span>
            )}
            {filters.cookingTime && (
              <span className="active-filter">
                Time: {formatCookingTimeLabel(filters.cookingTime)}
                <button onClick={() => handleSelectChange('cookingTime', '')}>×</button>
              </span>
            )}
            {filters.dietaryRestrictions.map(restriction => (
              <span key={restriction} className="active-filter">
                {restriction.charAt(0).toUpperCase() + restriction.slice(1).replace('-', ' ')}
                <button onClick={() => handleMultiSelectChange('dietaryRestrictions', restriction)}>×</button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeFilters;
