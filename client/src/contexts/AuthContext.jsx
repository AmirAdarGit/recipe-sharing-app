import React, { createContext, useContext, useEffect, useState, memo } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { API_BASE_URL } from '../config/api.js';
import axios from 'axios';
import {
  showAuthSuccessToast,
  showAuthErrorToast,
  showApiErrorToast,
  showLoadingToast,
  updateToastToSuccess,
  updateToastToError
} from '../utils/toast';

// Create Auth Context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add this function inside AuthContext component
const syncUserWithBackend = async (firebaseUser) => {
  try {
    const userData = {
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      providerData: firebaseUser.providerData
    };

    const response = await axios.post(`${API_BASE_URL}/api/users`, userData);
    console.log('✅ User synced with backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to sync user with backend:', error);
    // Don't show toast for backend sync errors as they're not critical for user experience
    // The user is still authenticated with Firebase
    throw error;
  }
};

// Auth Provider Component
const AuthProvider = memo(({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear error helper
  const clearError = () => setError(null);

  // Sign up with email and password
  const signUp = async (email, password, displayName) => {
    const toastId = showLoadingToast('Creating your account...');

    try {
      setLoading(true);
      setError(null);

      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // Send email verification
      await sendEmailVerification(result.user);

      updateToastToSuccess(toastId, 'Account created successfully! Please check your email for verification.');
      showAuthSuccessToast('register');

      return result;
    } catch (error) {
      setError(error.message);
      updateToastToError(toastId, 'Failed to create account. Please try again.');
      showAuthErrorToast('register', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    const toastId = showLoadingToast('Signing you in...');

    try {
      setLoading(true);
      setError(null);

      const result = await signInWithEmailAndPassword(auth, email, password);

      updateToastToSuccess(toastId, 'Welcome back!');
      showAuthSuccessToast('login');

      return result;
    } catch (error) {
      setError(error.message);
      updateToastToError(toastId, 'Login failed. Please check your credentials.');
      showAuthErrorToast('login', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const toastId = showLoadingToast('Signing in with Google...');

    try {
      setLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const result = await signInWithPopup(auth, provider);

      updateToastToSuccess(toastId, 'Successfully signed in with Google!');
      showAuthSuccessToast('login');

      return result;
    } catch (error) {
      setError(error.message);
      updateToastToError(toastId, 'Google sign-in failed. Please try again.');
      showAuthErrorToast('login', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await signOut(auth);
      showAuthSuccessToast('logout');
    } catch (error) {
      setError(error.message);
      showAuthErrorToast('logout', 'Failed to sign out. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Sync user with backend when signed in
        try {
          await syncUserWithBackend(user);
        } catch (error) {
          console.error('Backend sync failed:', error);
        }
      }
      
      if (import.meta.env.DEV) {
        console.log('🔐 Auth state changed:', user ? `Signed in as ${user.email}` : 'Signed out');
      }
    });

    return unsubscribe;
  }, []);

  // Auth context value
  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
});

export { AuthProvider };
