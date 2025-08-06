import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { API_BASE_URL } from '../config/api';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch recipe details
  const fetchRecipe = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Recipe not found');
          navigate('/recipes');
          return;
        }
        throw new Error('Failed to fetch recipe');
      }

      const data = await response.json();
      setRecipe(data.data);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast.error('Failed to load recipe');
      navigate('/recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  // Handle ingredient checkbox toggle
  const toggleIngredient = (index) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Handle step completion toggle
  const toggleStep = (stepNumber) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  };

  // Handle like toggle
  const handleLike = async () => {
    if (!user || !recipe) {
      toast.authError('login', 'Please log in to like recipes');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipe._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' })
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      setIsLiked(!isLiked);
      setRecipe(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          likes: prev.stats.likes + (isLiked ? -1 : 1)
        }
      } : null);

      toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
    } catch (error) {
      console.error('Error updating like status:', error);
      toast.error('Failed to update like status');
    }
  };

  // Handle save toggle
  const handleSave = async () => {
    if (!user || !recipe) {
      toast.authError('login', 'Please log in to save recipes');
      return;
    }

    try {
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Removed from saved recipes' : 'Saved to favorites');
    } catch (error) {
      console.error('Error updating save status:', error);
      toast.error('Failed to update save status');
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share && recipe) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: window.location.href
        });
      } catch (error) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Recipe link copied to clipboard');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Recipe link copied to clipboard');
    }
  };

  // Format time helper
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get difficulty color
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
      <div className="recipe-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-not-found">
        <h2>Recipe not found</h2>
        <p>The recipe you're looking for doesn't exist or has been removed.</p>
        <Link to="/recipes" className="btn-back">Back to Recipes</Link>
      </div>
    );
  }

  const isOwner = user && recipe.authorFirebaseUid === user.uid;
  const primaryImage = recipe.images?.find(img => img.isPrimary) || recipe.images?.[0];

  return (
    <div className="recipe-detail-container">
      {/* Header */}
      <div className="recipe-header">
        <div className="recipe-breadcrumb">
          <Link to="/recipes">Recipes</Link>
          <span>/</span>
          <span>{recipe.title}</span>
        </div>

        {isOwner && (
          <div className="owner-actions">
            <Link to={`/recipe/${recipe._id}/edit`} className="btn-edit">
              Edit Recipe
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="recipe-content">
        {/* Left Column - Images and Basic Info */}
        <div className="recipe-left">
          {/* Image Gallery */}
          <div className="recipe-images">
            {primaryImage && (
              <div className="main-image">
                <img
                  src={recipe.images?.[currentImageIndex]?.url || primaryImage.url}
                  alt={recipe.images?.[currentImageIndex]?.alt || recipe.title}
                />
              </div>
            )}
            
            {recipe.images?.length > 1 && (
              <div className="image-thumbnails">
                {recipe.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                  >
                    <img src={image.url} alt={image.alt || `${recipe.title} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div className="recipe-info">
            <h1 className="recipe-title">{recipe.title}</h1>
            <p className="recipe-description">{recipe.description}</p>

            {/* Author */}
            <div className="recipe-author">
              <div className="author-avatar">
                {recipe.author?.photoURL ? (
                  <img src={recipe.author.photoURL} alt={recipe.author.displayName} />
                ) : (
                  <div className="avatar-placeholder">
                    {recipe.author?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="author-info">
                <h3>{recipe.author?.displayName || 'Unknown Author'}</h3>
                {recipe.author?.profile?.bio && (
                  <p>{recipe.author.profile.bio}</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="recipe-stats">
              <div className="stat-item">
                <span className="stat-icon">⏱️</span>
                <div>
                  <span className="stat-value">{formatTime(recipe.cookingTime?.total || 0)}</span>
                  <span className="stat-label">Total Time</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <div>
                  <span className="stat-value">{recipe.servings}</span>
                  <span className="stat-label">Servings</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📊</span>
                <div>
                  <span 
                    className="stat-value difficulty"
                    style={{ color: getDifficultyColor(recipe.difficulty) }}
                  >
                    {recipe.difficulty}
                  </span>
                  <span className="stat-label">Difficulty</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="recipe-actions">
              <button 
                onClick={handleLike}
                className={`action-btn ${isLiked ? 'liked' : ''}`}
              >
                <span>❤️</span>
                <span>{recipe.stats?.likes || 0}</span>
              </button>
              <button 
                onClick={handleSave}
                className={`action-btn ${isSaved ? 'saved' : ''}`}
              >
                <span>⭐</span>
                <span>Save</span>
              </button>
              <button onClick={handleShare} className="action-btn">
                <span>📤</span>
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Ingredients and Instructions */}
        <div className="recipe-right">
          {/* Ingredients */}
          <section className="ingredients-section">
            <h2>Ingredients</h2>
            <div className="ingredients-list">
              {recipe.ingredients?.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  <label className="ingredient-checkbox">
                    <input
                      type="checkbox"
                      checked={checkedIngredients.has(index)}
                      onChange={() => toggleIngredient(index)}
                    />
                    <span className="checkmark"></span>
                    <span className={`ingredient-text ${checkedIngredients.has(index) ? 'checked' : ''}`}>
                      <span className="quantity">{ingredient.quantity} {ingredient.unit}</span>
                      <span className="name">{ingredient.name}</span>
                      {ingredient.notes && (
                        <span className="notes">({ingredient.notes})</span>
                      )}
                    </span>
                  </label>
                </div>
              )) || <p>No ingredients listed</p>}
            </div>
          </section>

          {/* Instructions */}
          <section className="instructions-section">
            <h2>Instructions</h2>
            <div className="instructions-list">
              {recipe.instructions?.map((instruction, index) => (
                <div key={instruction.stepNumber} className="instruction-step">
                  <div className="step-header">
                    <button
                      onClick={() => toggleStep(instruction.stepNumber)}
                      className={`step-number ${completedSteps.has(instruction.stepNumber) ? 'completed' : ''}`}
                    >
                      {completedSteps.has(instruction.stepNumber) ? '✓' : instruction.stepNumber}
                    </button>
                    {instruction.duration && (
                      <span className="step-duration">
                        ⏱️ {instruction.duration} min
                      </span>
                    )}
                  </div>
                  <div className={`step-content ${completedSteps.has(instruction.stepNumber) ? 'completed' : ''}`}>
                    <p>{instruction.instruction}</p>
                  </div>
                </div>
              )) || <p>No instructions provided</p>}
            </div>
          </section>

          {/* Notes */}
          {recipe.notes && (
            <section className="notes-section">
              <h2>Chef's Notes</h2>
              <div className="notes-content">
                <p>{recipe.notes}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
