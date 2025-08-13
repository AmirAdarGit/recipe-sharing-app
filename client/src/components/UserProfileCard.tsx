import React from 'react';
import './UserProfileCard.css';

interface UserProfile {
  _id: string;
  displayName: string;
  photoURL?: string;
  profile?: {
    bio?: string;
    followerCount?: number;
    followingCount?: number;
    recipeCount?: number;
  };
}

interface UserProfileCardProps {
  user: UserProfile;
  isFollowing?: boolean;
  onFollow?: () => void;
  onViewProfile?: () => void;
  compact?: boolean;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  isFollowing = false,
  onFollow,
  onViewProfile,
  compact = false
}) => {
  // Format count for display
  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  if (compact) {
    return (
      <div className="user-profile-card compact">
        <button onClick={onViewProfile} className="profile-link">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="profile-info">
            <span className="profile-name">{user.displayName}</span>
            {user.profile?.recipeCount !== undefined && (
              <span className="profile-stats">
                {formatCount(user.profile.recipeCount)} recipes
              </span>
            )}
          </div>
        </button>
        
        {onFollow && (
          <button
            onClick={onFollow}
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="user-profile-card">
      <div className="profile-header">
        <button onClick={onViewProfile} className="profile-link">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="profile-avatar large"
            />
          ) : (
            <div className="profile-avatar-placeholder large">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </button>
        
        <div className="profile-details">
          <button onClick={onViewProfile} className="profile-name-link">
            <h3 className="profile-name">{user.displayName}</h3>
          </button>
          
          {user.profile?.bio && (
            <p className="profile-bio">{user.profile.bio}</p>
          )}
          
          <div className="profile-stats">
            {user.profile?.recipeCount !== undefined && (
              <div className="stat-item">
                <span className="stat-value">{formatCount(user.profile.recipeCount)}</span>
                <span className="stat-label">Recipes</span>
              </div>
            )}
            {user.profile?.followerCount !== undefined && (
              <div className="stat-item">
                <span className="stat-value">{formatCount(user.profile.followerCount)}</span>
                <span className="stat-label">Followers</span>
              </div>
            )}
            {user.profile?.followingCount !== undefined && (
              <div className="stat-item">
                <span className="stat-value">{formatCount(user.profile.followingCount)}</span>
                <span className="stat-label">Following</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {onFollow && (
        <div className="profile-actions">
          <button
            onClick={onFollow}
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;
