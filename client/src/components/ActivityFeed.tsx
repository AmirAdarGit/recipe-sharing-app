import React from 'react';
import { UserActivity } from '../pages/Recipes';
import './ActivityFeed.css';

interface ActivityFeedProps {
  activities: UserActivity[];
  loading: boolean;
  onRefresh: () => void;
  onViewProfile: (userId: string) => void;
  onViewRecipe: (recipeId: string) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading,
  onRefresh,
  onViewProfile,
  onViewRecipe
}) => {
  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.ceil(diffDays / 7)}w ago`;
  };

  // Get activity icon
  const getActivityIcon = (type: UserActivity['type']): string => {
    const icons = {
      recipe_published: '📝',
      recipe_liked: '❤️',
      user_followed: '👥',
      comment_added: '💬'
    };
    return icons[type] || '📌';
  };

  // Get activity text
  const getActivityText = (activity: UserActivity): string => {
    switch (activity.type) {
      case 'recipe_published':
        return 'published a new recipe';
      case 'recipe_liked':
        return 'liked a recipe';
      case 'user_followed':
        return 'started following';
      case 'comment_added':
        return 'commented on a recipe';
      default:
        return 'had some activity';
    }
  };

  // Render activity item
  const renderActivityItem = (activity: UserActivity) => {
    const primaryImage = activity.recipe?.images.find(img => img.isPrimary) || activity.recipe?.images[0];

    return (
      <div key={activity._id} className="activity-item">
        <div className="activity-icon">
          {getActivityIcon(activity.type)}
        </div>

        <div className="activity-content">
          <div className="activity-header">
            <button
              onClick={() => onViewProfile(activity.user._id)}
              className="activity-user"
            >
              {activity.user.photoURL ? (
                <img
                  src={activity.user.photoURL}
                  alt={activity.user.displayName}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {activity.user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="user-name">{activity.user.displayName}</span>
            </button>
            <span className="activity-time">{formatTimeAgo(activity.createdAt)}</span>
          </div>

          <div className="activity-description">
            <span className="activity-text">{getActivityText(activity)}</span>
            
            {activity.targetUser && (
              <button
                onClick={() => onViewProfile(activity.targetUser!._id)}
                className="target-user"
              >
                {activity.targetUser.displayName}
              </button>
            )}
          </div>

          {activity.recipe && (
            <button
              onClick={() => onViewRecipe(activity.recipe!._id)}
              className="activity-recipe"
            >
              {primaryImage && (
                <img
                  src={primaryImage.url}
                  alt={activity.recipe.title}
                  className="recipe-thumbnail"
                />
              )}
              <div className="recipe-info">
                <span className="recipe-title">{activity.recipe.title}</span>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="activity-feed">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity</h3>
        <button
          onClick={onRefresh}
          className="refresh-btn"
          disabled={loading}
          title="Refresh activity feed"
        >
          <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
        </button>
      </div>

      <div className="activity-list">
        {loading && activities.length === 0 ? (
          <div className="activity-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading activity...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="activity-empty">
            <div className="empty-icon">📭</div>
            <h4>No recent activity</h4>
            <p>Follow some users to see their activity here!</p>
          </div>
        ) : (
          activities.map(renderActivityItem)
        )}
      </div>

      {loading && activities.length > 0 && (
        <div className="activity-loading-more">
          <div className="loading-spinner small"></div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
