import React from 'react';

const SavedLinks = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">🔗 Saved Links</h1>
          <p className="text-gray-300 mb-8">
            Your saved recipe links will appear here.
          </p>
          
          <div className="bg-zinc-800 p-8 rounded-xl shadow">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">No saved links yet</h2>
            <p className="text-gray-400">
              Start saving your favorite recipe links to access them quickly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedLinks;
