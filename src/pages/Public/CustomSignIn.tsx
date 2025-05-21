import React from 'react';
import { SignIn, useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/ClerkauthContext';

const CustomSignIn: React.FC = () => {
  const { signIn, isLoaded } = useSignIn();
  const { userRole } = useAuth();
  const navigate = useNavigate();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  // Define the redirection path based on role
  const getRedirectPath = (role: string) => {
    switch (role) {
      case 'hunter':
        return '/listings';
      case 'owner':
        return '/my-listings';
      case 'mover':
        return '/moving-services';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  // This function will be called by the Clerk SignIn component
  // when authentication is complete
  const handleRedirectAfterSignIn = () => {
    if (userRole) {
      navigate(getRedirectPath(userRole));
    } else {
      // Default if no role is found
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome back to MiCasa
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignIn 
            routing="path" 
            path="/login" 
            signUpUrl="/register"
            afterSignInUrl="/"
            redirectUrl="/"
          />
          
          {/* Add a custom button that handles redirection based on role */}
          <div className="mt-4 text-center">
            <button
              onClick={handleRedirectAfterSignIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSignIn;