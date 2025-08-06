import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfessionalTopbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Theme initialization and persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDarkMode(shouldUseDark);
    updateTheme(shouldUseDark);
  }, []);

  // Update theme in DOM
  const updateTheme = (dark: boolean): void => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  };

  // Theme toggle handler
  const toggleTheme = (): void => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    updateTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get time-based greeting
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar__container">
          
          {/* Left Section - Logo & Navigation */}
          <div className="topbar__left">
            {/* Logo */}
            <div className="topbar__logo">
              <div className="logo__icon">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="logo__text">Recipe Share</span>
            </div>

            {/* Desktop Navigation - Only show for authenticated users */}
            {user && (
              <nav className="topbar__nav">
                <a href="/recipes" className="nav__link">
                  <span className="nav__icon">🌍</span>
                  <span className="nav__text">Browse</span>
                </a>
                <a href="/my-recipes" className="nav__link">
                  <span className="nav__icon">📚</span>
                  <span className="nav__text">My Recipes</span>
                </a>
                <a href="/categories" className="nav__link">
                  <span className="nav__icon">📖</span>
                  <span className="nav__text">Categories</span>
                </a>
                <a href="/favorites" className="nav__link nav__link--badge">
                  <span className="nav__icon">❤️</span>
                  <span className="nav__text">Favorites</span>
                  <span className="nav__badge">3</span>
                </a>
              </nav>
            )}
          </div>

          {/* Center Section - Search - Only show for authenticated users */}
          {user && (
            <div className="topbar__search">
              <div className={`search__container ${isSearchFocused ? 'search__container--focused' : ''}`}>
                <div className="search__icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search recipes, ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="search__input"
                  aria-label="Search recipes and ingredients"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="search__clear"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Section - Actions */}
          <div className="topbar__actions">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="action__button action__button--theme"
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <div className="theme__toggle">
                <svg className={`theme__icon theme__icon--sun ${!isDarkMode ? 'theme__icon--active' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                <svg className={`theme__icon theme__icon--moon ${isDarkMode ? 'theme__icon--active' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              </div>
            </button>

            {/* Authenticated User Actions */}
            {user && (
              <>
                {/* Notifications */}
                <button className="action__button action__button--notification" aria-label="View notifications">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82l3.93 3.93-3.93 3.93M21 12H3" />
                  </svg>
                  <span className="notification__badge">2</span>
                </button>
              </>
            )}

            {/* Unauthenticated User Actions */}
            {!user && (
              <div className="auth__buttons">
                <a href="/login" className="auth__button auth__button--signin">
                  Sign In
                </a>
                <a href="/signup" className="auth__button auth__button--signup">
                  Sign Up
                </a>
              </div>
            )}

            {/* Profile Dropdown - Only show for authenticated users */}
            {user && (
              <div className="profile__dropdown" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="profile__trigger"
                aria-expanded={isProfileOpen}
                aria-label="Open user menu"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email}
                    className="profile__avatar"
                  />
                ) : (
                  <div className="profile__avatar profile__avatar--fallback">
                    {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="profile__info">
                  <span className="profile__name">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="profile__status">Online</span>
                </div>
                <svg className="profile__chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Menu */}
              {isProfileOpen && (
                <div className="profile__menu">
                  <div className="profile__header">
                    <p className="profile__greeting">{getGreeting()}</p>
                    <p className="profile__user-name">{user?.displayName || 'User'}</p>
                    <p className="profile__email">{user?.email}</p>
                  </div>
                  
                  <div className="profile__links">
                    <a href="/profile" className="profile__link">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile Settings</span>
                    </a>
                    <a href="/preferences" className="profile__link">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Preferences</span>
                    </a>
                    <a href="/help" className="profile__link">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Help & Support</span>
                    </a>
                  </div>
                  
                  <div className="profile__footer">
                    <button onClick={handleLogout} className="profile__logout">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile__toggle"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <div className="hamburger">
                <span className="hamburger__line"></span>
                <span className="hamburger__line"></span>
                <span className="hamburger__line"></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile__menu" ref={mobileMenuRef}>
          <div className="mobile__menu-content">
            <nav className="mobile__nav">
              <a href="/recipes" className="mobile__link">
                <span className="mobile__icon">🌍</span>
                <span>Browse</span>
              </a>
              <a href="/my-recipes" className="mobile__link">
                <span className="mobile__icon">📚</span>
                <span>My Recipes</span>
              </a>
              <a href="/categories" className="mobile__link">
                <span className="mobile__icon">📖</span>
                <span>Categories</span>
              </a>
              <a href="/favorites" className="mobile__link">
                <span className="mobile__icon">❤️</span>
                <span>Favorites</span>
                <span className="mobile__badge">3</span>
              </a>
            </nav>
            
            <div className="mobile__search">
              <input
                type="text"
                placeholder="Search..."
                className="mobile__search-input"
                aria-label="Search recipes"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfessionalTopbar;
