import React, { createContext, useContext, useEffect, useState, memo, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { API_BASE_URL } from '../config/api';
import axios from 'axios';
import {
  showAuthSuccessToast,
  showAuthErrorToast,
  showApiErrorToast,
  showLoadingToast,
  updateToastToSuccess,
  updateToastToError
} from '../utils/toast';

// Type definitions
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<UserCredential>;
  loginWithFacebook: () => Promise<UserCredential>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface BackendUserData {
  firebaseUid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerData: any[];
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add this function inside AuthContext component
const syncUserWithBackend = async (firebaseUser: FirebaseUser): Promise<void> => {
  try {
    const userData: BackendUserData = {
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
const AuthProvider = memo(({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error helper
  const clearError = (): void => setError(null);

  // Sign up with email and password
  const register = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
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
    } catch (error: any) {
      setError(error.message);
      updateToastToError(toastId, 'Failed to create account. Please try again.');
      showAuthErrorToast('register', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const login = async (email: string, password: string): Promise<UserCredential> => {
    const toastId = showLoadingToast('Signing you in...');

    try {
      setLoading(true);
      setError(null);

      const result = await signInWithEmailAndPassword(auth, email, password);

      updateToastToSuccess(toastId, 'Welcome back!');
      showAuthSuccessToast('login');

      return result;
    } catch (error: any) {
      setError(error.message);
      updateToastToError(toastId, 'Login failed. Please check your credentials.');
      showAuthErrorToast('login', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const loginWithGoogle = async (): Promise<UserCredential> => {
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
    } catch (error: any) {
      setError(error.message);
      updateToastToError(toastId, 'Google sign-in failed. Please try again.');
      showAuthErrorToast('login', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Facebook
  const loginWithFacebook = async (): Promise<UserCredential> => {
    try {
      setLoading(true);
      setError(null);

      const provider = new FacebookAuthProvider();
      provider.addScope('email');

      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await signOut(auth);
      showAuthSuccessToast('logout');
    } catch (error: any) {
      setError(error.message);
      showAuthErrorToast('logout', 'Failed to sign out. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      await updateProfile(user, updates);
    } catch (error: any) {
      throw error;
    }
  };

  // Send verification email
  const sendVerificationEmail = async (): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      await sendEmailVerification(user);
    } catch (error: any) {
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
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
  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    updateUserProfile,
    sendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
});

export { AuthProvider };
