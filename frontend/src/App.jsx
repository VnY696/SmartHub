import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import NotificationDrawer from './components/notifications/NotificationDrawer';
import ChatbotWidget from './components/ai/ChatbotWidget';

// Public Pages
import Home from './pages/public/Home';
import ServiceCatalog from './pages/public/ServiceCatalog';
import ServiceDetail from './pages/public/ServiceDetail';
import ServiceCompare from './pages/public/ServiceCompare';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Customer Pages
import MyBookings from './pages/customer/MyBookings';
import CustomerProfile from './pages/customer/CustomerProfile';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderServices from './pages/provider/ProviderServices';
import ProviderProfile from './pages/provider/ProviderProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVerifications from './pages/admin/AdminVerifications';
import AdminServices from './pages/admin/AdminServices';
import AdminCategories from './pages/admin/AdminCategories';

// Protected Route Component
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Checking authentication...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <NotificationDrawer />
            
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<ServiceCatalog />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/services/compare" element={<ServiceCompare />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Routes */}
                <Route
                  path="/customer/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer/profile"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Provider Routes */}
                <Route
                  path="/provider/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/services"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/profile"
                  element={
                    <ProtectedRoute allowedRoles={['provider']}>
                      <ProviderProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verifications"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminVerifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <ChatbotWidget />
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
