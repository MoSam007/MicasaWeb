import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'hunter' | 'owner' | 'mover' | 'admin'>;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show a loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  // Case 1: Route requires authentication but user is not logged in
  if (requireAuth && !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
// If authentication is NOT required and user IS logged in (login/register pages)
  if (!requireAuth && currentUser) {
    return <Navigate to="/listings" />;
  }

  // Case 2: Route has role restrictions and user doesn't have the required role
  if (requireAuth && allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on their actual role
    switch(userRole) {
      case 'hunter':
        return <Navigate to="/listings" replace />;
      case 'owner':
        return <Navigate to="/my-listings" replace />;
      case 'mover':
        return <Navigate to="/moving-services" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Case 3: User is trying to access auth pages (login/register) while already logged in
  if (!requireAuth && currentUser) {
    // Redirect to appropriate dashboard based on role
    switch(userRole) {
      case 'hunter':
        return <Navigate to="/listings" replace />;
      case 'owner':
        return <Navigate to="/my-listings" replace />;
      case 'mover':
        return <Navigate to="/moving-services" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;