// React Router and Authentication App
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProfessionalTopbar from './components/ProfessionalTopbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Recipes from './pages/Recipes';
import Categories from './pages/Categories';
import Favorites from './pages/Favorites';
import SavedLinks from './pages/SavedLinks';
import DashboardDemo from './pages/DashboardDemo';
import ToastDemo from './components/ToastDemo';
import './App.css';
import './styles/professional-topbar.css';
import './styles/toast.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes with ProfessionalTopbar */}
            <Route path="/login" element={
              <>
                <ProfessionalTopbar />
                <Login />
              </>
            } />
            <Route path="/signup" element={
              <>
                <ProfessionalTopbar />
                <SignUp />
              </>
            } />

            {/* Protected Routes with ProfessionalTopbar */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProfessionalTopbar />
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes"
              element={
                <ProtectedRoute>
                  <ProfessionalTopbar />
                  <Recipes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <ProfessionalTopbar />
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <ProfessionalTopbar />
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved-links"
              element={
                <ProtectedRoute>
                  <ProfessionalTopbar />
                  <SavedLinks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-demo"
              element={
                <ProtectedRoute>
                  <DashboardDemo />
                </ProtectedRoute>
              }
            />

            {/* Toast Demo - For testing notifications */}
            <Route
              path="/toast-demo"
              element={
                <ProtectedRoute>
                  <ProfessionalTopbar />
                  <ToastDemo />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast Notification Container */}
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
            toastClassName="custom-toast"
            bodyClassName="custom-toast-body"
            progressClassName="custom-toast-progress"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;