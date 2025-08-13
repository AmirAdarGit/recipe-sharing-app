import React, { useState } from 'react';
import { SocialRecipe } from '../pages/Recipes';
import { socialRecipesUtils } from '../services/socialRecipesAPI';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: SocialRecipe;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onView: () => void;
  onFollowAuthor: () => void;
  onViewProfile: () => void;
  viewMode: 'grid' | 'list';
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onLike,
  onSave,
  onShare,
  onView,
  onFollowAuthor,
  onViewProfile,
  viewMode
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get primary image
  const primaryImage = recipe.images.find(img => img.isPrimary) || recipe.images[0];

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  // Get dietary badges
  const getDietaryBadges = () => {
    const badges = [];
    if (recipe.dietaryInfo.isVegetarian) badges.push('Vegetarian');
    if (recipe.dietaryInfo.isVegan) badges.push('Vegan');
    if (recipe.dietaryInfo.isGlutenFree) badges.push('Gluten-Free');
    if (recipe.dietaryInfo.isKeto) badges.push('Keto');
    return badges.slice(0, 2); // Show max 2 badges
  };

  const dietaryBadges = getDietaryBadges();

  return (
    <article className={`recipe-card ${viewMode}`}>
      {/* Recipe Image */}
      <div className="recipe-image-container" onClick={onView}>
        {primaryImage && !imageError ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || recipe.title}
            className={`recipe-image ${imageLoaded ? 'loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="recipe-image-placeholder">
            <span className="placeholder-icon">🍽️</span>
          </div>
        )}
        
        {/* Overlay with quick actions */}
        <div className="image-overlay">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="view-recipe-btn"
          >
            View Recipe
          </button>
        </div>

        {/* Difficulty badge */}
        <div className="difficulty-badge" style={{ 
          backgroundColor: socialRecipesUtils.getDifficultyColor(recipe.difficulty) 
        }}>
          {socialRecipesUtils.formatDifficulty(recipe.difficulty)}
        </div>

        {/* Cooking time badge */}
        <div className="time-badge">
          ⏱️ {socialRecipesUtils.formatCookingTime(recipe.cookingTime.total)}
        </div>
      </div>

      {/* Recipe Content */}
      <div className="recipe-content">
        {/* Author Info */}
        <div className="author-info">
          <button onClick={onViewProfile} className="author-profile">
            {recipe.author.photoURL ? (
              <img
                src={recipe.author.photoURL}
                alt={recipe.author.displayName}
                className="author-avatar"
              />
            ) : (
              <div className="author-avatar-placeholder">
                {recipe.author.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="author-details">
              <span className="author-name">{recipe.author.displayName}</span>
              <span className="publish-time">{formatTimeAgo(recipe.publishedAt)}</span>
            </div>
          </button>

          {!recipe.socialInteractions.isFollowingAuthor && (
            <button
              onClick={onFollowAuthor}
              className="follow-btn"
            >
              Follow
            </button>
          )}
        </div>

        {/* Recipe Title and Description */}
        <div className="recipe-info">
          <h3 className="recipe-title" onClick={onView}>
            {recipe.title}
          </h3>
          <p className="recipe-description">
            {recipe.description}
          </p>
        </div>

        {/* Recipe Meta */}
        <div className="recipe-meta">
          <div className="meta-item">
            <span className="meta-icon">👥</span>
            <span className="meta-text">{recipe.servings} servings</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">🍳</span>
            <span className="meta-text">{recipe.category}</span>
          </div>
          {recipe.cuisine && (
            <div className="meta-item">
              <span className="meta-icon">🌍</span>
              <span className="meta-text">{recipe.cuisine}</span>
            </div>
          )}
        </div>

        {/* Dietary Badges */}
        {dietaryBadges.length > 0 && (
          <div className="dietary-badges">
            {dietaryBadges.map(badge => (
              <span key={badge} className="dietary-badge">
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="recipe-tags">
            {recipe.tags.slice(0, 3).map(tag => (
              <span key={tag} className="recipe-tag">
                #{tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="tag-more">+{recipe.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Recipe Stats and Actions */}
        <div className="recipe-actions">
          <div className="recipe-stats">
            <div className="stat-item">
              <span className="stat-icon">👁️</span>
              <span className="stat-count">{socialRecipesUtils.formatCount(recipe.stats.views)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💬</span>
              <span className="stat-count">{socialRecipesUtils.formatCount(recipe.stats.comments)}</span>
            </div>
            {recipe.stats.rating.count > 0 && (
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <span className="stat-count">{recipe.stats.rating.average.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button
              onClick={onLike}
              className={`action-btn like-btn ${recipe.socialInteractions.isLiked ? 'active' : ''}`}
              title={recipe.socialInteractions.isLiked ? 'Unlike recipe' : 'Like recipe'}
            >
              <span className="action-icon">
                {recipe.socialInteractions.isLiked ? '❤️' : '🤍'}
              </span>
              <span className="action-count">
                {socialRecipesUtils.formatCount(recipe.stats.likes)}
              </span>
            </button>

            <button
              onClick={onSave}
              className={`action-btn save-btn ${recipe.socialInteractions.isSaved ? 'active' : ''}`}
              title={recipe.socialInteractions.isSaved ? 'Remove from saved' : 'Save recipe'}
            >
              <span className="action-icon">
                {recipe.socialInteractions.isSaved ? '🔖' : '📌'}
              </span>
              <span className="action-count">
                {socialRecipesUtils.formatCount(recipe.stats.saves)}
              </span>
            </button>

            <button
              onClick={onShare}
              className="action-btn share-btn"
              title="Share recipe"
            >
              <span className="action-icon">📤</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default RecipeCard;
