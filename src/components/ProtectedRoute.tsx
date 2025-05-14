import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/ClerkauthContext';

type ProtectedRouteProps = {
  allowedRoles?: Array<'hunter' | 'owner' | 'mover' | 'admin'>;
  redirectPath?: string;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles = [],
  redirectPath = '/sign-in',
}) => {
  const { isSignedIn, userRole, isLoaded, isRoleInitialized } = useAuth();

  // Wait until auth is loaded before making decisions
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  // If not signed in, redirect to login
  if (!isSignedIn) {
    return <Navigate to={redirectPath} replace />;
  }

  // If signed in but role is not initialized, redirect to role selection
  if (isSignedIn && !isRoleInitialized) {
    return <Navigate to="/select-role" replace />;
  }

  // If roles are specified and user's role is not in the allowed list, redirect to home
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;