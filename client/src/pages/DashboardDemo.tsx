import React from 'react';
import DashboardHeader from '../components/DashboardHeader';
import ProfessionalTopbar from '../components/ProfessionalTopbar';
import '../styles/dashboard-header.css';
import '../styles/professional-topbar.css';

const DashboardDemo: React.FC = () => {
  return (
    <div className="min-h-screen theme-bg-page">
      <ProfessionalTopbar />

      {/* Demo Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold theme-text-primary mb-4">
            Professional Topbar Demo
          </h1>
          <p className="theme-text-secondary text-lg">
            This page demonstrates the professional topbar component with sophisticated theme system and premium design standards.
          </p>
        </div>

        {/* Professional Topbar Features */}
        <div className="mb-12 theme-card p-6 rounded-lg">
          <h2 className="text-2xl font-semibold theme-text-primary mb-4">
            🎨 Professional Topbar Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium theme-text-primary mb-2">Theme System</h3>
              <ul className="text-sm theme-text-secondary space-y-1">
                <li>• Sophisticated dark/light mode toggle</li>
                <li>• CSS custom properties for easy theming</li>
                <li>• Smooth theme transitions (300ms)</li>
                <li>• Theme persistence with localStorage</li>
                <li>• System preference detection</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium theme-text-primary mb-2">Design Standards</h3>
              <ul className="text-sm theme-text-secondary space-y-1">
                <li>• Glass-morphism backdrop blur effect</li>
                <li>• Professional color schemes</li>
                <li>• Perfect contrast ratios (WCAG AA)</li>
                <li>• Premium micro-interactions</li>
                <li>• Top-tier application patterns</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium theme-text-primary mb-2">Interactive Features</h3>
              <ul className="text-sm theme-text-secondary space-y-1">
                <li>• Smooth hover effects on all elements</li>
                <li>• Animated theme toggle (sun/moon)</li>
                <li>• Proper focus states for a11y</li>
                <li>• Mobile-responsive hamburger menu</li>
                <li>• Expandable search with focus animations</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium theme-text-primary mb-2">Technical Excellence</h3>
              <ul className="text-sm theme-text-secondary space-y-1">
                <li>• Semantic HTML structure</li>
                <li>• ARIA labels for accessibility</li>
                <li>• Fixed positioning (z-index: 1000)</li>
                <li>• No horizontal scrolling issues</li>
                <li>• Organized CSS class structure</li>
              </ul>
            </div>
          </div>
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
