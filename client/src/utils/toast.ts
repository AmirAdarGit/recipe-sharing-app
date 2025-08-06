import { toast, ToastOptions, Id } from 'react-toastify';

/**
 * Toast notification types and configurations
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

type ToastType = typeof TOAST_TYPES[keyof typeof TOAST_TYPES];

/**
 * Default toast configuration
 */
const DEFAULT_CONFIG: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light'
};

/**
 * Extended configuration for different toast types
 */
const TOAST_CONFIGS: Record<ToastType, ToastOptions> = {
  [TOAST_TYPES.SUCCESS]: {
    ...DEFAULT_CONFIG,
    autoClose: 4000,
    className: 'toast-success'
  },
  [TOAST_TYPES.ERROR]: {
    ...DEFAULT_CONFIG,
    autoClose: 8000,
    className: 'toast-error'
  },
  [TOAST_TYPES.WARNING]: {
    ...DEFAULT_CONFIG,
    autoClose: 6000,
    className: 'toast-warning'
  },
  [TOAST_TYPES.INFO]: {
    ...DEFAULT_CONFIG,
    autoClose: 5000,
    className: 'toast-info'
  }
};

/**
 * Success toast notification
 */
export const showSuccessToast = (message: string, options: Partial<ToastOptions> = {}): Id => {
  return toast.success(message, {
    ...TOAST_CONFIGS[TOAST_TYPES.SUCCESS],
    ...options
  });
};

/**
 * Error toast notification
 */
export const showErrorToast = (message: string, options: Partial<ToastOptions> = {}): Id => {
  return toast.error(message, {
    ...TOAST_CONFIGS[TOAST_TYPES.ERROR],
    ...options
  });
};

/**
 * Warning toast notification
 */
export const showWarningToast = (message: string, options: Partial<ToastOptions> = {}): Id => {
  return toast.warning(message, {
    ...TOAST_CONFIGS[TOAST_TYPES.WARNING],
    ...options
  });
};

/**
 * Info toast notification
 */
export const showInfoToast = (message: string, options: Partial<ToastOptions> = {}): Id => {
  return toast.info(message, {
    ...TOAST_CONFIGS[TOAST_TYPES.INFO],
    ...options
  });
};

/**
 * Authentication-specific toast messages
 */
export const AUTH_TOASTS = {
  LOGIN_SUCCESS: 'Welcome back! You have successfully logged in.',
  LOGIN_ERROR: 'Login failed. Please check your credentials and try again.',
  LOGOUT_SUCCESS: 'You have been successfully logged out.',
  REGISTER_SUCCESS: 'Account created successfully! Welcome to Recipe Sharing!',
  REGISTER_ERROR: 'Registration failed. Please try again.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.'
} as const;

/**
 * Recipe-specific toast messages
 */
export const RECIPE_TOASTS = {
  CREATE_SUCCESS: 'Recipe created successfully!',
  CREATE_ERROR: 'Failed to create recipe. Please try again.',
  UPDATE_SUCCESS: 'Recipe updated successfully!',
  UPDATE_ERROR: 'Failed to update recipe. Please try again.',
  DELETE_SUCCESS: 'Recipe deleted successfully!',
  DELETE_ERROR: 'Failed to delete recipe. Please try again.',
  SAVE_SUCCESS: 'Recipe saved to favorites!',
  UNSAVE_SUCCESS: 'Recipe removed from favorites!',
  LOAD_ERROR: 'Failed to load recipes. Please refresh the page.'
} as const;

/**
 * Profile-specific toast messages
 */
export const PROFILE_TOASTS = {
  UPDATE_SUCCESS: 'Profile updated successfully!',
  UPDATE_ERROR: 'Failed to update profile. Please try again.',
  PHOTO_UPLOAD_SUCCESS: 'Profile photo updated successfully!',
  PHOTO_UPLOAD_ERROR: 'Failed to upload photo. Please try again.',
  PREFERENCES_SAVED: 'Preferences saved successfully!'
} as const;

/**
 * Form validation toast messages
 */
export const VALIDATION_TOASTS = {
  REQUIRED_FIELDS: 'Please fill in all required fields.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  WEAK_PASSWORD: 'Password must be at least 6 characters long.',
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?'
} as const;

/**
 * Generic utility functions for common scenarios
 */

type AuthAction = 'login' | 'register' | 'logout';
type AuthErrorAction = 'login' | 'register' | 'unauthorized' | 'network';

/**
 * Show authentication success toast
 */
export const showAuthSuccessToast = (action: AuthAction): Id => {
  const messages: Record<AuthAction, string> = {
    login: AUTH_TOASTS.LOGIN_SUCCESS,
    register: AUTH_TOASTS.REGISTER_SUCCESS,
    logout: AUTH_TOASTS.LOGOUT_SUCCESS
  };

  return showSuccessToast(messages[action] || 'Authentication successful!');
};

/**
 * Show authentication error toast
 */
export const showAuthErrorToast = (action: AuthErrorAction, customMessage: string | null = null): Id => {
  const messages: Record<AuthErrorAction, string> = {
    login: AUTH_TOASTS.LOGIN_ERROR,
    register: AUTH_TOASTS.REGISTER_ERROR,
    unauthorized: AUTH_TOASTS.UNAUTHORIZED,
    network: AUTH_TOASTS.NETWORK_ERROR
  };

  const message = customMessage || messages[action] || 'Authentication failed!';
  return showErrorToast(message);
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * Show API error toast with fallback message
 */
export const showApiErrorToast = (error: ApiError | string | unknown, fallbackMessage: string = 'An error occurred'): Id => {
  let message = fallbackMessage;

  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as ApiError;
    if (apiError.response?.data?.message) {
      message = apiError.response.data.message;
    } else if (apiError.message) {
      message = apiError.message;
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  return showErrorToast(message);
};

/**
 * Show loading toast (returns toast ID for updating)
 */
export const showLoadingToast = (message: string = 'Loading...'): Id => {
  return toast.loading(message, {
    position: 'top-right',
    theme: 'light'
  });
};

/**
 * Update loading toast to success
 */
export const updateToastToSuccess = (toastId: Id, message: string): void => {
  toast.update(toastId, {
    render: message,
    type: 'success',
    isLoading: false,
    ...TOAST_CONFIGS[TOAST_TYPES.SUCCESS]
  });
};

/**
 * Update loading toast to error
 */
export const updateToastToError = (toastId: Id, message: string): void => {
  toast.update(toastId, {
    render: message,
    type: 'error',
    isLoading: false,
    ...TOAST_CONFIGS[TOAST_TYPES.ERROR]
  });
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = (): void => {
  toast.dismiss();
};

/**
 * Dismiss specific toast
 */
export const dismissToast = (toastId: Id): void => {
  toast.dismiss(toastId);
};
