import React from 'react';
import DashboardHeader from '../components/DashboardHeader';
import '../styles/dashboard-header.css';

const DashboardDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      {/* Demo Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard Header Demo
          </h1>
          <p className="text-gray-600 text-lg">
            This page demonstrates the comprehensive dashboard header component with all its features.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* CSS Custom Properties */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">🎨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              CSS Custom Properties
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Easy theme switching with CSS variables for colors, spacing, and design tokens.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: 'var(--color-primary)'}}></div>
                <span className="text-gray-500">--color-primary</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{backgroundColor: 'var(--color-secondary)'}}></div>
                <span className="text-gray-500">--color-secondary</span>
              </div>
              <div className="text-gray-500">8px spacing grid system</div>
            </div>
          </div>

          {/* Responsive Design */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mobile-First Responsive
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Adaptive layout that works seamlessly across all device sizes.
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>• Mobile: Collapsed navigation</div>
              <div>• Tablet: Hidden search on small screens</div>
              <div>• Desktop: Full feature set</div>
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Interactive Features
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Rich interactions with smooth transitions and micro-animations.
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>• Expandable search bar</div>
              <div>• Notification badges</div>
              <div>• Profile dropdown menu</div>
            </div>
          </div>

          {/* Clean Typography */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Typography Hierarchy
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Consistent text sizing and spacing for optimal readability.
            </p>
            <div className="space-y-1">
              <div className="text-lg font-semibold">Heading Large</div>
              <div className="text-base font-medium">Body Medium</div>
              <div className="text-sm text-gray-600">Body Small</div>
              <div className="text-xs text-gray-500">Caption</div>
            </div>
          </div>

          {/* Smooth Transitions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">🌊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smooth Transitions
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Carefully crafted hover states and animations for better UX.
            </p>
            <div className="space-y-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                Hover me
              </button>
              <div className="text-xs text-gray-500">150ms-350ms timing</div>
            </div>
          </div>

          {/* Modular Components */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">🧩</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Modular Architecture
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Interchangeable sections for easy customization and maintenance.
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>• Logo section</div>
              <div>• Navigation menu</div>
              <div>• Search component</div>
              <div>• User profile area</div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Usage Example
          </h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`import DashboardHeader from './components/DashboardHeader';
import './styles/dashboard-header.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      {/* Your app content */}
    </div>
  );
}`}
            </pre>
          </div>
        </div>

        {/* Theme Customization */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Theme Customization
          </h3>
          <p className="text-gray-600 mb-4">
            Easily customize the header by modifying CSS custom properties:
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`:root {
  /* Brand Colors */
  --color-primary: #4f46e5;
  --color-secondary: #06b6d4;
  
  /* Spacing Grid */
  --space-1: 0.5rem;   /* 8px */
  --space-2: 1rem;     /* 16px */
  --space-3: 1.5rem;   /* 24px */
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
}`}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardDemo;
