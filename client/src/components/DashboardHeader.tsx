import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notificationCount] = useState<number>(3); // Mock notification count

  const searchRef = useRef<HTMLInputElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__container">
        
        {/* Logo Section */}
        <div className="dashboard-header__logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              🍳
            </div>
            <span className="logo-text">Recipe Share</span>
          </Link>
        </div>

        {/* Navigation Menu - Center */}
        <nav className="dashboard-header__nav">
          <div className="nav-menu">
            <Link to="/recipes" className="nav-link">
              <span className="nav-icon">📚</span>
              <span className="nav-text">Recipes</span>
            </Link>
            <Link to="/categories" className="nav-link">
              <span className="nav-icon">📖</span>
              <span className="nav-text">Categories</span>
            </Link>
            <Link to="/favorites" className="nav-link nav-link--with-badge">
              <span className="nav-icon">❤️</span>
              <span className="nav-text">Favorites</span>
              <span className="nav-badge">5</span>
            </Link>
          </div>
        </nav>

        {/* Search Bar */}
        <div className="dashboard-header__search">
          <div className={`search-container ${isSearchFocused ? 'search-container--focused' : ''}`}>
            <div className="search-icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="search-clear"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="dashboard-header__actions">
          
          {/* Notifications */}
          <button className="action-button action-button--notification">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.93 3.93-3.93 3.93M21 12H3" />
            </svg>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="profile-dropdown" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="profile-button"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar profile-avatar--fallback">
                  {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="profile-info">
                <span className="profile-name">
                  {user?.displayName || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className="profile-role">Admin</span>
              </div>
              <svg className="profile-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="profile-menu">
                <div className="profile-menu__header">
                  <p className="greeting">{getGreeting()}</p>
                  <p className="user-name">{user?.displayName || 'User'}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
                
                <div className="profile-menu__links">
                  <Link to="/profile" className="menu-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span className="menu-icon">👤</span>
                    <span>Profile Settings</span>
                  </Link>
                  <Link to="/preferences" className="menu-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span className="menu-icon">⚙️</span>
                    <span>Preferences</span>
                  </Link>
                  <Link to="/help" className="menu-link" onClick={() => setIsProfileDropdownOpen(false)}>
                    <span className="menu-icon">❓</span>
                    <span>Help & Support</span>
                  </Link>
                </div>
                
                <div className="profile-menu__footer">
                  <button onClick={handleLogout} className="logout-button">
                    <span className="menu-icon">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
