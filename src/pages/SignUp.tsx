import React, { useState, useEffect } from 'react';
import { SignUp as ClerkSignUp, useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [role, setRole] = useState<string>('hunter');
  const [error, setError] = useState<string | null>(null);

  // Register user in your backend and set their role
  const registerUserInBackend = async (token: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/clerk/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        throw new Error('Failed to register user in backend');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error registering user in backend:', error);
      throw error;
    }
  };

  // Update user metadata in Clerk with role
  const updateClerkUserMetadata = async () => {
    try {
      if (!signUp || !signUp.createdUserId) return;
      
      // This would typically be done via webhook or backend
      // For now, we'll mock this as the actual method would depend on your Clerk setup
      console.log(`Would update Clerk user ${signUp.createdUserId} with role: ${role}`);
      
      // In a real implementation, you might use Clerk's SDK or a backend endpoint to set metadata
    } catch (error) {
      console.error('Error updating Clerk user metadata:', error);
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

  // Handle sign-up completion
  const handleSignUpComplete = async () => {
    if (!signUp?.status || signUp.status !== 'complete') return;
    
    try {
      // Set the created session as active
      const { createdSessionId } = signUp;
      if (!createdSessionId) throw new Error('No session created');
      
      await setActive({ session: createdSessionId });
      
      // Get the token for backend verification
      const token = await fetch('/api/clerk/getToken').then(res => res.text());
      
      // Register user in backend with role
      const userData = await registerUserInBackend(token);
      
      // Update Clerk user metadata
      await updateClerkUserMetadata();
      
      // Redirect based on role
      redirectBasedOnRole(userData.role || role);
    } catch (err) {
      console.error('Error during sign-up completion:', err);
      setError('Failed to complete sign-up process');
    }
  };

  // Monitor sign-up status
  useEffect(() => {
    if (isLoaded && signUp?.status === 'complete') {
      handleSignUpComplete();
    }
  }, [isLoaded, signUp?.status]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            I want to
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="hunter">Find a dream home</option>
            <option value="owner">List my property</option>
            <option value="mover">Offer moving services</option>
          </select>
        </div>

        {/* Clerk's SignUp component */}
        <ClerkSignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl={`/role-selection?role=${role}`}
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
  );
};

export default SignUp;