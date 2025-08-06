import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { API_BASE_URL } from '../config/api';
import './MyRecipes.css';

// TypeScript interfaces
interface Recipe {
  _id: string;
  title: string;
  description: string;
  images: Array<{
    url: string;
    isPrimary: boolean;
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
  isPublic: boolean;
  stats: {
    views: number;
    likes: number;
    saves: number;
  };
  createdAt: string;
  updatedAt: string;
}

type SortOption = 'name' | 'createdAt' | 'cookingTime' | 'popularity';
type FilterOption = 'all' | 'public' | 'private' | 'recent';

const MyRecipes: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch user's recipes
  const fetchRecipes = async () => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/recipes/user/${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      setRecipes(data.data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  // Filter and sort recipes
  useEffect(() => {
    let filtered = [...recipes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'public':
        filtered = filtered.filter(recipe => recipe.isPublic);
        break;
      case 'private':
        filtered = filtered.filter(recipe => !recipe.isPublic);
        break;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(recipe => new Date(recipe.createdAt) > oneWeekAgo);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'cookingTime':
          comparison = a.cookingTime.total - b.cookingTime.total;
          break;
        case 'popularity':
          comparison = (a.stats.likes + a.stats.views) - (b.stats.likes + b.stats.views);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredRecipes(filtered);
  }, [recipes, searchTerm, sortBy, filterBy, sortOrder]);

  const handleDeleteRecipe = async (recipeId) => {
    if (!user || !window.confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authorFirebaseUid: user.uid })
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      setRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
      toast.recipe.deleteSuccess();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast.recipe.deleteError();
    }
  };

  const togglePrivacy = async (recipeId, currentPrivacy) => {
    if (!user) return;

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublic: !currentPrivacy })
      });

      if (!response.ok) {
        throw new Error('Failed to update recipe privacy');
      }

      setRecipes(prev => prev.map(recipe =>
        recipe._id === recipeId ? { ...recipe, isPublic: !currentPrivacy } : recipe
      ));

      toast.success(`Recipe is now ${!currentPrivacy ? 'public' : 'private'}`);
    } catch (error) {
      console.error('Error updating recipe privacy:', error);
      toast.error('Failed to update recipe privacy');
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#48bb78';
      case 'medium': return '#ed8936';
      case 'hard': return '#f56565';
      default: return '#718096';
    }
  };

  if (loading) {
    return (
      <div className="my-recipes-loading">
        <div className="loading-spinner"></div>
        <p>Loading your recipes...</p>
      </div>
    );
  }

  return (
    <div className="my-recipes-container">
      <div className="my-recipes-header">
        <div className="header-content">
          <h1>My Recipes</h1>
          <p>Manage and organize your culinary creations</p>
        </div>
        <Link to="/create-recipe" className="btn-create-recipe">
          + Create Recipe
        </Link>
      </div>

      {/* Controls */}
      <div className="recipes-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search your recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Recipes</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="recent">Recent (7 days)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="cookingTime">Cooking Time</option>
            <option value="popularity">Popularity</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Recipe Stats */}
      <div className="recipes-stats">
        <div className="stat">
          <span className="stat-number">{recipes.length}</span>
          <span className="stat-label">Total Recipes</span>
        </div>
        <div className="stat">
          <span className="stat-number">{recipes.filter(r => r.isPublic).length}</span>
          <span className="stat-label">Public</span>
        </div>
        <div className="stat">
          <span className="stat-number">{recipes.filter(r => !r.isPublic).length}</span>
          <span className="stat-label">Private</span>
        </div>
        <div className="stat">
          <span className="stat-number">{filteredRecipes.length}</span>
          <span className="stat-label">Showing</span>
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="no-recipes">
          {searchTerm || filterBy !== 'all' ? (
            <div>
              <h3>No recipes found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button onClick={() => { setSearchTerm(''); setFilterBy('all'); }} className="btn-clear-filters">
                Clear Filters
              </button>
            </div>
          ) : (
            <div>
              <h3>No recipes yet</h3>
              <p>Start creating your first recipe!</p>
              <Link to="/create-recipe" className="btn-create-first">
                Create Your First Recipe
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.map(recipe => (
            <div key={recipe._id} className="recipe-card">
              <div className="recipe-image">
                {recipe.images.length > 0 ? (
                  <img
                    src={recipe.images.find(img => img.isPrimary)?.url || recipe.images[0].url}
                    alt={recipe.title}
                  />
                ) : (
                  <div className="recipe-placeholder">
                    <span>📸</span>
                  </div>
                )}
                <div className="recipe-privacy">
                  <button
                    onClick={() => togglePrivacy(recipe._id, recipe.isPublic)}
                    className={`privacy-toggle ${recipe.isPublic ? 'public' : 'private'}`}
                    title={`Make ${recipe.isPublic ? 'private' : 'public'}`}
                  >
                    {recipe.isPublic ? '🌍' : '🔒'}
                  </button>
                </div>
              </div>

              <div className="recipe-content">
                <h3 className="recipe-title">
                  <Link to={`/recipe/${recipe._id}`}>{recipe.title}</Link>
                </h3>
                <p className="recipe-description">{recipe.description}</p>

                <div className="recipe-meta">
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>{formatTime(recipe.cookingTime.total)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="meta-item">
                    <span
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
                    >
                      {recipe.difficulty}
                    </span>
                  </div>
                </div>

                <div className="recipe-stats">
                  <span>👁️ {recipe.stats.views}</span>
                  <span>❤️ {recipe.stats.likes}</span>
                  <span>⭐ {recipe.stats.saves}</span>
                </div>

                <div className="recipe-actions">
                  <Link to={`/recipe/${recipe._id}`} className="btn-view">
                    View
                  </Link>
                  <Link to={`/recipe/${recipe._id}/edit`} className="btn-edit">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteRecipe(recipe._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
