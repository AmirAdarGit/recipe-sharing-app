import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      setIsLoggingOut(true);
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setIsLoggingOut(false);
        setIsDropdownOpen(false);
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement actual theme switching logic
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <nav className="bg-zinc-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors">
            🍳 Recipe Share
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/recipes" className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
              <span>📚</span>
              <span>Recipes</span>
            </Link>
            <Link to="/categories" className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
              <span>📖</span>
              <span>Categories</span>
            </Link>
            <Link to="/favorites" className="flex items-center space-x-1 hover:text-gray-300 transition-colors">
              <span>❤️</span>
              <span>Favorites</span>
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">0</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search recipes..."
                className="w-full bg-zinc-800 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Right side - Theme toggle and User menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? '☀️' : '🌓'}
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 hover:bg-zinc-800 rounded-lg p-2 transition-colors"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hidden md:block text-sm">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm text-gray-600">{getGreeting()}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    👤 Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                  >
                    {isLoggingOut ? '🔄 Signing out...' : '🚪 Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-zinc-800 px-4 py-2">
        <div className="flex justify-around">
          <Link to="/recipes" className="flex flex-col items-center text-xs">
            <span className="text-lg">📚</span>
            <span>Recipes</span>
          </Link>
          <Link to="/categories" className="flex flex-col items-center text-xs">
            <span className="text-lg">📖</span>
            <span>Categories</span>
          </Link>
          <Link to="/favorites" className="flex flex-col items-center text-xs relative">
            <span className="text-lg">❤️</span>
            <span>Favorites</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
          </Link>
        </div>
        <div className="mt-2">
          <input
            type="text"
            placeholder="🔍 Search recipes..."
            className="w-full bg-zinc-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
