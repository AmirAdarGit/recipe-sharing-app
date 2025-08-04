import React from 'react';

const Favorites = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">❤️ Favorites</h1>
          <p className="text-gray-300 mb-8">
            Your favorite recipes saved for quick access.
          </p>
          
          <div className="bg-zinc-800 p-8 rounded-xl shadow">
            <div className="text-6xl mb-4">💝</div>
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-gray-400">
              Start favoriting recipes to see them here!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
