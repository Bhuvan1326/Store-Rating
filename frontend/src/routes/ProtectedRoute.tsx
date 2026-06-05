import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard for their role rather than a dead end
    const roleHome: Record<string, string> = {
      admin: '/admin/dashboard',
      user: '/stores',
      store_owner: '/owner/dashboard',
    };
    return <Navigate to={roleHome[user.role] || '/login'} replace />;
  }

  return children;
}
