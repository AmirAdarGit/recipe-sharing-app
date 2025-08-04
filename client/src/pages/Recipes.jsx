import React from 'react';

const Recipes = () => {
  return (
    <div className="min-h-screen theme-bg-page theme-text-primary">
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">📚 Recipes</h1>
          <p className="theme-text-secondary mb-8">
            Browse and discover amazing recipes from our community.
          </p>

          <div className="theme-card p-8 rounded-xl">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="theme-text-tertiary">
              Recipe browsing and discovery features are under development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipes;
