import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/ClerkauthContext';

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
  const { isLoaded, isSignedIn, userRole } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - User signed in:", isSignedIn);
  console.log("ProtectedRoute - User role:", userRole);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);
  console.log("ProtectedRoute - Require auth:", requireAuth);
  
  // If still loading auth state, show a loading indicator
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  // Case 1: Route requires authentication but user is not logged in
  if (requireAuth && !isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Case 2: If authentication is NOT required and user IS logged in (sign-in/sign-up pages)
  if (!requireAuth && isSignedIn) {
    // Redirect based on user role
    if (userRole) {
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
    return <Navigate to="/" replace />;
  }

  // Case 3: Route has role restrictions and user doesn't have the required role
  if (requireAuth && allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    console.log("User has role", userRole, "but needs one of", allowedRoles);
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

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;