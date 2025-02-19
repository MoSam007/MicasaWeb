import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}