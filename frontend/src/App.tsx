import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import './index.css';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersList from './pages/admin/AdminUsersList';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminStoresList from './pages/admin/AdminStoresList';
import AdminAddUser from './pages/admin/AdminAddUser';
import AdminAddStore from './pages/admin/AdminAddStore';

// Normal User
import StoresPage from './pages/user/StoresPage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';

// Store Owner
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerChangePassword from './pages/owner/OwnerChangePassword';

// Redirect logged-in users to their role's home
function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminUsersList /></ProtectedRoute>
          } />
          <Route path="/admin/users/new" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminAddUser /></ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminUserDetail /></ProtectedRoute>
          } />
          <Route path="/admin/stores" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminStoresList /></ProtectedRoute>
          } />
          <Route path="/admin/stores/new" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminAddStore /></ProtectedRoute>
          } />

          {/* Normal User */}
          <Route path="/stores" element={
            <ProtectedRoute allowedRoles={['user']}><StoresPage /></ProtectedRoute>
          } />
          <Route path="/change-password" element={
            <ProtectedRoute allowedRoles={['user']}><ChangePasswordPage /></ProtectedRoute>
          } />

          {/* Store Owner */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={['store_owner']}><OwnerDashboard /></ProtectedRoute>
          } />
          <Route path="/owner/change-password" element={
            <ProtectedRoute allowedRoles={['store_owner']}><OwnerChangePassword /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
