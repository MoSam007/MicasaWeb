import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/ClerkauthContext';

type UserRole = 'hunter' | 'owner' | 'mover' | 'admin';

const RoleSelection: React.FC = () => {
  const { isSignedIn, isRoleInitialized, setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('hunter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If not signed in, redirect to sign-in page
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // If role is already initialized, redirect to home
  if (isRoleInitialized) {
    return <Navigate to="/" replace />;
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await setUserRole(selectedRole);
      // Role set successfully, the context will handle redirection
    } catch (err) {
      setError("Failed to set role. Please try again.");
      console.error('Error setting role:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Select Your Role
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose the role that best describes how you'll use our platform
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {[
              { id: 'hunter', name: 'Hunter', description: 'Looking for properties' },
              { id: 'owner', name: 'Owner', description: 'Have properties to list' },
              { id: 'mover', name: 'Mover', description: 'Provide moving services' },
              // Typically we wouldn't expose admin role in UI, but including for completeness
              { id: 'admin', name: 'Admin', description: 'Site administrator' }
            ].map((role) => (
              <div 
                key={role.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRole === role.id 
                    ? 'border-yellow-600 bg-yellow-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleRoleSelect(role.id as UserRole)}
              >
                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      id={role.id}
                      name="role"
                      type="radio"
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                      checked={selectedRole === role.id}
                      onChange={() => handleRoleSelect(role.id as UserRole)}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={role.id} className="font-medium text-gray-900">{role.name}</label>
                    <p className="text-gray-500">{role.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Setting Role...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleSelection;