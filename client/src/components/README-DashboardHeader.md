# Dashboard Header Component

A comprehensive, modern dashboard header component built with React and Tailwind CSS, featuring CSS custom properties for easy theming and mobile-first responsive design.

## ✨ Features

### 🎨 **Design System**
- **CSS Custom Properties** for brand colors and spacing
- **8px spacing grid** system for consistent layouts
- **Mobile-first responsive** design approach
- **Clean utility class** organization

### 🧩 **Modular Architecture**
- **Interchangeable sections**: Logo, Navigation, Search, Profile
- **Reusable components** with consistent styling
- **Easy customization** through CSS variables
- **Scalable structure** for future enhancements

### ⚡ **Interactive Elements**
- **Expandable search bar** with focus animations
- **Notification badges** with counters
- **Profile dropdown menu** with user info
- **Smooth hover transitions** and micro-animations

### 📱 **Responsive Features**
- **Mobile navigation** with hamburger menu
- **Adaptive search bar** (hidden on small screens)
- **Flexible profile section** (condensed on mobile)
- **Touch-friendly** button sizes

## 🚀 Quick Start

### Installation

```bash
# The component uses existing dependencies
npm install react react-router-dom
```

### Basic Usage

```jsx
import DashboardHeader from './components/DashboardHeader';
import './styles/dashboard-header.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      {/* Your app content */}
    </div>
  );
}
```

### With Authentication Context

```jsx
import { AuthProvider } from './contexts/AuthContext';
import DashboardHeader from './components/DashboardHeader';

function App() {
  return (
    <AuthProvider>
      <DashboardHeader />
    </AuthProvider>
  );
}
```

## 🎨 Customization

### Theme Colors

Modify the CSS custom properties in your stylesheet:

```css
:root {
  /* Primary Brand Colors */
  --color-primary: #4f46e5;        /* Indigo-600 */
  --color-primary-hover: #4338ca;  /* Indigo-700 */
  --color-primary-light: #e0e7ff;  /* Indigo-100 */
  
  /* Secondary Colors */
  --color-secondary: #06b6d4;      /* Cyan-500 */
  --color-secondary-hover: #0891b2; /* Cyan-600 */
  --color-secondary-light: #cffafe; /* Cyan-100 */
}
```

### Spacing System

The component uses an 8px grid system:

```css
:root {
  --space-1: 0.5rem;   /* 8px */
  --space-2: 1rem;     /* 16px */
  --space-3: 1.5rem;   /* 24px */
  --space-4: 2rem;     /* 32px */
  --space-5: 2.5rem;   /* 40px */
  --space-6: 3rem;     /* 48px */
}
```

### Dark Theme Support

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #6366f1;
    --color-primary-hover: #5b21b6;
    --color-primary-light: #312e81;
  }
  
  .dashboard-header {
    @apply bg-gray-900 border-gray-700;
  }
}
```

## 🔧 Component Structure

```
DashboardHeader/
├── Logo Section
│   ├── Icon/Image
│   └── Brand Text
├── Navigation Menu (Center)
│   ├── Recipes Link
│   ├── Categories Link
│   └── Favorites Link (with badge)
├── Search Bar
│   ├── Search Icon
│   ├── Input Field
│   └── Clear Button
└── Actions Section
    ├── Notifications (with badge)
    └── Profile Dropdown
        ├── User Avatar
        ├── User Info
        └── Dropdown Menu
```

## 📋 Props & Configuration

### DashboardHeader Props

The component automatically integrates with your authentication context:

```jsx
// Uses AuthContext automatically
const { user, logout } = useAuth();
```

### Customizable Elements

1. **Logo Section**
   - Replace emoji with custom logo
   - Modify brand text
   - Adjust link destination

2. **Navigation Links**
   - Add/remove navigation items
   - Customize icons and labels
   - Modify badge counters

3. **Search Functionality**
   - Connect to search API
   - Customize placeholder text
   - Add search suggestions

4. **Profile Menu**
   - Add custom menu items
   - Modify user information display
   - Customize logout behavior

## 🎯 Best Practices

### Performance
- Use `React.memo()` for static sections
- Implement lazy loading for dropdown content
- Optimize image assets (avatars, logos)

### Accessibility
- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly structure

### Responsive Design
- Test on multiple device sizes
- Ensure touch targets are 44px minimum
- Optimize for both portrait and landscape

## 🔍 Advanced Usage

### Custom Navigation Items

```jsx
const customNavItems = [
  { icon: '📊', text: 'Analytics', path: '/analytics' },
  { icon: '⚙️', text: 'Settings', path: '/settings' },
  { icon: '👥', text: 'Team', path: '/team', badge: 2 }
];
```

### Search Integration

```jsx
const handleSearch = async (query) => {
  const results = await searchAPI(query);
  setSearchResults(results);
};
```

### Notification System

```jsx
const [notifications, setNotifications] = useState([
  { id: 1, type: 'info', message: 'New recipe added' },
  { id: 2, type: 'warning', message: 'Profile incomplete' }
]);
```

## 🐛 Troubleshooting

### Common Issues

1. **Dropdown not closing**
   - Ensure click-outside handler is properly implemented
   - Check z-index conflicts

2. **Search bar not expanding**
   - Verify CSS transitions are loaded
   - Check for conflicting styles

3. **Mobile menu not working**
   - Ensure responsive breakpoints are correct
   - Test touch event handlers

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This component is part of the Recipe Sharing App project and follows the same license terms.

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Test on multiple devices

---

**Demo**: Visit `/dashboard-demo` to see the component in action with all features demonstrated.
