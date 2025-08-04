import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ActionTile from '../components/ActionTile';

const Home = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen theme-bg-page">
        {/* Hero / Welcome Section */}
        <div className="theme-bg-primary theme-text-primary p-6 rounded-xl theme-shadow mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {user?.displayName || user?.email?.split('@')[0] || 'Guest'}! 👋
          </h1>
          <p className="theme-text-secondary mb-2">{user?.email}</p>

          {!user?.emailVerified && (
            <div className="mt-4 bg-yellow-900 border border-yellow-700 rounded-md p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-200">
                    Email verification pending
                  </h3>
                  <p className="mt-1 text-sm text-yellow-300">
                    Please check your email and verify your account to access all features.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Quick Action Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <ActionTile
            icon="🔨"
            title="Create Recipe"
            description="Share your favorite recipe with the community"
            isComingSoon={true}
          />

          <ActionTile
            icon="🔍"
            title="Browse Recipes"
            description="Discover recipes from others"
            isComingSoon={true}
          />

          <ActionTile
            icon="👤"
            title="My Profile"
            description="Manage your preferences"
            isComingSoon={true}
          />

          <ActionTile
            icon="🔗"
            title="Saved Links"
            description="Access your saved recipe links"
            to="/saved-links"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
