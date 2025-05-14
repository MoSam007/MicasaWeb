import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, useSignIn } from '@clerk/clerk-react';

const ClerkSignIn: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, signIn, setActive } = useSignIn();
  // const [role, setRole] = useState<string>('hunter');
  const [error, setError] = useState<string | null>(null);

  // Handle sign-in completion
  const handleSignInComplete = async () => {
    if (!signIn || signIn.status !== 'complete') return;
    
    try {
      // Set this session as active
      const { createdSessionId } = signIn;
      if (!createdSessionId) throw new Error('No session created');
      await setActive({ session: createdSessionId });
      
      // Get the token for backend verification
      const token = await fetch('/api/clerk/getToken').then(res => res.text());
      
      // Get user role from backend or Clerk metadata
      const response = await fetch('http://127.0.0.1:8000/api/users/info/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user info');
      }
      
      const userData = await response.json();
      const userRole = userData.role || 'hunter';
      
      // Redirect based on the role
      redirectBasedOnRole(userRole);
    } catch (err: any) {
      console.error('Error during sign-in completion:', err);
      setError(err.message || 'Failed to complete sign-in process');
    }
  };

  // Redirect based on user role
  const redirectBasedOnRole = (userRole: string) => {
    switch (userRole) {
      case 'hunter':
        navigate('/listings');
        break;
      case 'owner':
        navigate('/my-listings');
        break;
      case 'mover':
        navigate('/moving-services');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  // Monitor sign-in status changes
  useEffect(() => {
    if (isLoaded && signIn?.status === 'complete') {
      handleSignInComplete();
    }
  }, [isLoaded, signIn?.status]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Clerk's SignIn component */}
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "p-0 border-0 shadow-none",
                socialButtonsBlockButton: "w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",
                formButtonPrimary: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClerkSignIn;