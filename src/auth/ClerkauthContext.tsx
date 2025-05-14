import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

type UserRole = 'hunter' | 'owner' | 'mover' | 'admin';

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null;
  userEmail: string | null;
  userRole: UserRole | null;
  setUserRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  isRoleInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: clerkLoaded, userId, isSignedIn, getToken: clerkGetToken } = useClerkAuth();
  const { user } = useUser();
  const [userRole, setRole] = useState<UserRole | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRoleInitialized, setIsRoleInitialized] = useState(false);

  // Get token function
  const getToken = async (): Promise<string | null> => {
    if (!isSignedIn) return null;
    try {
      return await clerkGetToken();
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Fetch user role from Django backend using Clerk token
  const fetchUserRole = async () => {
    if (!isSignedIn || !userId) {
      setRole(null);
      setIsLoaded(true);
      setIsRoleInitialized(true);
      return;
    }

    try {
      // Get session token
      const token = await getToken();
      
      if (!token) {
        console.error("No token available");
        setIsLoaded(true);
        setIsRoleInitialized(false);
        return;
      }
      
      // Try to get user info from backend
      const response = await fetch(`${API_BASE_URL}/api/users/info/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Auth-Provider': 'clerk'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        const backendRole = userData.role as UserRole;
        
        console.log("Fetched user role from backend:", backendRole);
        setRole(backendRole);
        setIsRoleInitialized(true);
      } else if (response.status === 404 || response.status === 401) {
        // User doesn't exist in backend yet
        console.log("User not found in backend");
        
        // Check if role is in Clerk metadata
        const publicMetadata = user?.publicMetadata;
        const metadataRole = publicMetadata?.role as UserRole | undefined;
        
        if (metadataRole) {
          console.log("Found role in Clerk metadata:", metadataRole);
          
          // Create user in backend with role from metadata
          await createUserInBackend(token, metadataRole);
          setRole(metadataRole);
          setIsRoleInitialized(true);
        } else {
          // We don't have a role yet, so we need to let the user choose
          console.log("No role found, role needs to be initialized");
          setRole(null);
          setIsRoleInitialized(false);
        }
      } else {
        console.error('Error fetching user info:', response.status);
        setRole(null);
        setIsRoleInitialized(false);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setRole(null);
      setIsRoleInitialized(false);
    } finally {
      setIsLoaded(true);
    }
  };

  // Create user in backend with role
  const createUserInBackend = async (token: string, role: UserRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/clerk/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Auth-Provider': 'clerk'
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        console.error('Failed to create user in backend:', await response.text());
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating user in backend:', error);
      return false;
    }
  };

  // Update user role in both backend and Clerk
  const setUserRole = async (role: UserRole) => {
    if (!isSignedIn || !user) return;
    
    try {
      // Get token for backend authentication
      const token = await getToken();
      
      if (!token) {
        console.error("No token available to set role");
        return;
      }
      
      // Update role in backend
      const response = await fetch(`${API_BASE_URL}/api/users/clerk/role/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Auth-Provider': 'clerk'
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update role in backend:', errorText);
        throw new Error('Failed to update role in backend');
      }
      
      // Update role in Clerk metadata
      await user.update({
        unsafeMetadata: { role }
      });
      
      // Update local state
      setRole(role);
      setIsRoleInitialized(true);
      
      return;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    // Clerk's signOut is handled by ClerkProvider
    // Just clear our local state
    setRole(null);
    setIsRoleInitialized(false);
  };

  // Load user role when auth state changes
  useEffect(() => {
    if (clerkLoaded) {
      fetchUserRole();
    }
  }, [clerkLoaded, isSignedIn, userId]);

  const value = {
    isLoaded,
    isSignedIn,
    userId: userId ?? null,
    userEmail: user?.primaryEmailAddress?.emailAddress || null,
    userRole,
    setUserRole,
    logout,
    getToken,
    isRoleInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoaded ? children : (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};