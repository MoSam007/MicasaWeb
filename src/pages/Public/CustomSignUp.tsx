import React, { useState } from 'react';
import { SignUp, useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaTruck, FaSearch } from 'react-icons/fa';

const CustomSignUp: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [step, setStep] = useState<'role-selection' | 'sign-up'>('role-selection');
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setStep('sign-up');
  };

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

  // Handle successful sign-up
  const handleSignUpComplete = async () => {
    if (!selectedRole) return;
    
    try {
      // Set the user's role in public metadata
      await signUp.update({
        unsafeMetadata: { role: selectedRole }
      });
      
      // Activate the session
      const { createdSessionId } = await signUp.create({});
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        // Redirect based on role
        navigate(getRedirectPath(selectedRole));
      }
    } catch (err) {
      console.error('Error completing sign-up:', err);
    }
  };

  // Role selection screen
  if (step === 'role-selection') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join MiCasa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select how you want to use our platform
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
                onClick={() => handleRoleSelect('hunter')}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FaSearch className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">House Hunter</h3>
                    <p className="text-sm text-gray-500">I'm looking for a home to rent or buy</p>
                  </div>
                </div>
              </div>

              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
                onClick={() => handleRoleSelect('owner')}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FaHome className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Property Owner</h3>
                    <p className="text-sm text-gray-500">I want to list my property for rent or sale</p>
                  </div>
                </div>
              </div>

              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
                onClick={() => handleRoleSelect('mover')}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FaTruck className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Moving Service Provider</h3>
                    <p className="text-sm text-gray-500">I offer moving services to help people relocate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign-up screen with Clerk component
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {selectedRole === 'hunter' && 'Sign up as a House Hunter'}
          {selectedRole === 'owner' && 'Sign up as a Property Owner'}
          {selectedRole === 'mover' && 'Sign up as a Moving Service Provider'}
        </p>
        <button 
          onClick={() => setStep('role-selection')} 
          className="mt-2 mx-auto block text-sm text-yellow-600 hover:text-yellow-500"
        >
          ← Change role
        </button>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUp 
            routing="path" 
            path="/register" 
            signInUrl="/login" 
            afterSignUpUrl={getRedirectPath(selectedRole || 'hunter')}
            redirectUrl={getRedirectPath(selectedRole || 'hunter')}
          />
          
          {/* This button appears after sign-up is complete */}
          <div className="mt-4 text-center">
            <button
              onClick={handleSignUpComplete}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Complete Setup & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSignUp;