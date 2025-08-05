# Toast Notification System Documentation

## Overview

The Recipe Sharing App includes a comprehensive toast notification system built with React Toastify. This system provides consistent, accessible, and visually appealing notifications throughout the application.

## Features

- ✅ **4 Toast Types**: Success, Error, Warning, Info
- ✅ **Loading States**: Loading toasts that can be updated to success/error
- ✅ **Custom Styling**: Matches application design with gradients and animations
- ✅ **Mobile Responsive**: Optimized for all screen sizes
- ✅ **Accessibility**: Supports screen readers and keyboard navigation
- ✅ **Auto-dismiss**: Configurable auto-close timers
- ✅ **Manual Control**: Dismiss individual or all toasts
- ✅ **Position Control**: Top-right positioning with mobile optimization
- ✅ **Limit Control**: Maximum 3 toasts visible at once

## Installation

The toast system is already installed and configured. Dependencies include:

```bash
npm install react-toastify
```

## Basic Usage

### Using the useToast Hook

```jsx
import { useToast } from '../hooks/useToast';

const MyComponent = () => {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  const handleWarning = () => {
    toast.warning('Please check your input!');
  };

  const handleInfo = () => {
    toast.info('Here\'s some helpful information.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleWarning}>Warning</button>
      <button onClick={handleInfo}>Info</button>
    </div>
  );
};
```

### Direct Import Usage

```jsx
import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast 
} from '../utils/toast';

// Basic usage
showSuccessToast('Success message!');
showErrorToast('Error message!');
showWarningToast('Warning message!');
showInfoToast('Info message!');
```

## Advanced Features

### Loading Toasts

```jsx
const toast = useToast();

// Show loading toast
const toastId = toast.loading('Processing...');

// Update to success
setTimeout(() => {
  toast.updateToSuccess(toastId, 'Process completed!');
}, 3000);

// Or update to error
setTimeout(() => {
  toast.updateToError(toastId, 'Process failed!');
}, 3000);
```

### Async Operations

```jsx
const toast = useToast();

const handleAsyncOperation = async () => {
  try {
    await toast.asyncOperation(
      () => fetch('/api/data').then(res => res.json()),
      {
        loadingMessage: 'Fetching data...',
        successMessage: 'Data loaded successfully!',
        errorMessage: 'Failed to load data!'
      }
    );
  } catch (error) {
    console.error('Operation failed:', error);
  }
};
```

### Promise-based Toasts

```jsx
const toast = useToast();

const apiCall = fetch('/api/endpoint');

toast.promise(apiCall, {
  loading: 'Making API call...',
  success: 'API call successful!',
  error: 'API call failed!'
});
```

## Specialized Toast Functions

### Authentication Toasts

```jsx
const toast = useToast();

// Success toasts
toast.authSuccess('login');    // "Welcome back! You have successfully logged in."
toast.authSuccess('register'); // "Account created successfully! Welcome to Recipe Sharing!"
toast.authSuccess('logout');   // "You have been successfully logged out."

// Error toasts
toast.authError('login', 'Custom error message');
toast.authError('token');      // "Your session has expired. Please log in again."
toast.authError('unauthorized'); // "You are not authorized to access this resource."
```

### Recipe Toasts

```jsx
const toast = useToast();

toast.recipe.createSuccess();  // "Recipe created successfully!"
toast.recipe.updateError();   // "Failed to update recipe. Please try again."
toast.recipe.deleteSuccess(); // "Recipe deleted successfully!"
toast.recipe.saveSuccess();   // "Recipe saved to favorites!"
```

### Profile Toasts

```jsx
const toast = useToast();

toast.profile.updateSuccess();      // "Profile updated successfully!"
toast.profile.photoUploadError();   // "Failed to upload photo. Please try again."
toast.profile.preferencesSaved();   // "Preferences saved successfully!"
```

### Validation Toasts

```jsx
const toast = useToast();

toast.validation.requiredFields();   // "Please fill in all required fields."
toast.validation.invalidEmail();     // "Please enter a valid email address."
toast.validation.passwordMismatch(); // "Passwords do not match."
toast.validation.weakPassword();     // "Password must be at least 6 characters long."
```

## Configuration

### Toast Container Settings

The ToastContainer is configured in `App.jsx` with the following settings:

```jsx
<ToastContainer
  position="top-right"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="light"
  limit={3}
/>
```

### Custom Styling

Toast styles are defined in `src/styles/toast.css`:

- **Success**: Green gradient with white text
- **Error**: Red gradient with white text  
- **Warning**: Orange gradient with white text
- **Info**: Blue gradient with white text
- **Loading**: Gray gradient with white text

### Auto-close Timers

- **Success**: 4 seconds
- **Error**: 8 seconds
- **Warning**: 6 seconds
- **Info**: 5 seconds

## API Integration

The toast system is integrated with the API service (`src/services/api.js`) to automatically handle:

- **401 Unauthorized**: Shows token expired message and redirects to login
- **403 Forbidden**: Shows unauthorized access message
- **404 Not Found**: Shows resource not found message
- **422 Validation Error**: Shows validation error message
- **429 Too Many Requests**: Shows rate limit message
- **500 Server Error**: Shows server error message
- **Network Errors**: Shows network connectivity message

## Testing

Visit `/toast-demo` (requires authentication) to test all toast types and features:

```
http://localhost:5174/toast-demo
```

The demo includes:
- Basic toast types
- Authentication toasts
- Recipe toasts
- Profile toasts
- Validation toasts
- Loading toasts
- Async operations
- Promise-based toasts
- Conditional toasts

## Best Practices

1. **Use appropriate toast types** for different scenarios
2. **Keep messages concise** and actionable
3. **Use loading toasts** for operations that take time
4. **Don't overuse toasts** - they can become annoying
5. **Test on mobile devices** to ensure proper display
6. **Consider accessibility** - toasts should be screen reader friendly

## Accessibility Features

- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus management** when toasts appear
- **High contrast mode** support
- **Reduced motion** support for users with motion sensitivity

## Browser Support

The toast system supports all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

1. **Toasts not appearing**: Check if ToastContainer is included in App.jsx
2. **Styling issues**: Ensure toast.css is imported
3. **Multiple toasts**: Check the limit setting in ToastContainer
4. **Mobile display**: Verify responsive CSS is working

### Debug Mode

Enable debug mode by adding to your component:

```jsx
import { toast } from 'react-toastify';

// Log all toast events
toast.onChange((payload) => {
  console.log('Toast event:', payload);
});
```

## Future Enhancements

Potential improvements for the toast system:

- [ ] Custom icons for each toast type
- [ ] Sound notifications (optional)
- [ ] Toast history/log
- [ ] Undo functionality for certain actions
- [ ] Rich content support (HTML, components)
- [ ] Toast queuing system
- [ ] Analytics integration
