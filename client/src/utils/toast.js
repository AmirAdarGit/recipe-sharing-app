import { toast } from 'react-toastify';

/**
 * Toast notification types and configurations
 */
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Default toast configuration
 */
const DEFAULT_CONFIG = {
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
const TOAST_CONFIGS = {
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
 * @param {string} message - The message to display
 * @param {object} options - Additional toast options
 */
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    ...TOAST_CONFIGS[TOAST_TYPES.SUCCESS],
    ...options
  });
};

/**
 * Error toast notification
 * @param {string} message - The error message to display
 * @param {object} options - Additional toast options
 */
export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    ...TOAST_CONFIGS[TOAST_TYPES.ERROR],
    ...options
  });
};

/**
 * Warning toast notification
 * @param {string} message - The warning message to display
 * @param {object} options - Additional toast options
 */
export const showWarningToast = (message, options = {}) => {
  return toast.warning(message, {
    ...TOAST_CONFIGS[TOAST_TYPES.WARNING],
    ...options
  });
};

/**
 * Info toast notification
 * @param {string} message - The info message to display
 * @param {object} options - Additional toast options
 */
export const showInfoToast = (message, options = {}) => {
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
};

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
};

/**
 * Profile-specific toast messages
 */
export const PROFILE_TOASTS = {
  UPDATE_SUCCESS: 'Profile updated successfully!',
  UPDATE_ERROR: 'Failed to update profile. Please try again.',
  PHOTO_UPLOAD_SUCCESS: 'Profile photo updated successfully!',
  PHOTO_UPLOAD_ERROR: 'Failed to upload photo. Please try again.',
  PREFERENCES_SAVED: 'Preferences saved successfully!'
};

/**
 * Form validation toast messages
 */
export const VALIDATION_TOASTS = {
  REQUIRED_FIELDS: 'Please fill in all required fields.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  WEAK_PASSWORD: 'Password must be at least 6 characters long.',
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?'
};

/**
 * Generic utility functions for common scenarios
 */

/**
 * Show authentication success toast
 * @param {string} action - The authentication action (login, register, logout)
 */
export const showAuthSuccessToast = (action) => {
  const messages = {
    login: AUTH_TOASTS.LOGIN_SUCCESS,
    register: AUTH_TOASTS.REGISTER_SUCCESS,
    logout: AUTH_TOASTS.LOGOUT_SUCCESS
  };
  
  showSuccessToast(messages[action] || 'Authentication successful!');
};

/**
 * Show authentication error toast
 * @param {string} action - The authentication action that failed
 * @param {string} customMessage - Custom error message (optional)
 */
export const showAuthErrorToast = (action, customMessage = null) => {
  const messages = {
    login: AUTH_TOASTS.LOGIN_ERROR,
    register: AUTH_TOASTS.REGISTER_ERROR,
    unauthorized: AUTH_TOASTS.UNAUTHORIZED,
    network: AUTH_TOASTS.NETWORK_ERROR
  };

  const message = customMessage || messages[action] || 'Authentication failed!';
  showErrorToast(message);
};

/**
 * Show API error toast with fallback message
 * @param {object} error - The error object from API call
 * @param {string} fallbackMessage - Fallback message if error parsing fails
 */
export const showApiErrorToast = (error, fallbackMessage = 'An error occurred') => {
  let message = fallbackMessage;
  
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  showErrorToast(message);
};

/**
 * Show loading toast (returns toast ID for updating)
 * @param {string} message - Loading message
 */
export const showLoadingToast = (message = 'Loading...') => {
  return toast.loading(message, {
    position: 'top-right',
    theme: 'light'
  });
};

/**
 * Update loading toast to success
 * @param {string|number} toastId - Toast ID from showLoadingToast
 * @param {string} message - Success message
 */
export const updateToastToSuccess = (toastId, message) => {
  toast.update(toastId, {
    render: message,
    type: 'success',
    isLoading: false,
    ...TOAST_CONFIGS[TOAST_TYPES.SUCCESS]
  });
};

/**
 * Update loading toast to error
 * @param {string|number} toastId - Toast ID from showLoadingToast
 * @param {string} message - Error message
 */
export const updateToastToError = (toastId, message) => {
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
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Dismiss specific toast
 * @param {string|number} toastId - Toast ID to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
