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
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: clerkLoaded, userId, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const [userRole, setRole] = useState<UserRole | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { getToken } = useClerkAuth(); 

  // Fetch user role from Django backend using Clerk token
  const fetchUserRole = async () => {
    if (!isSignedIn || !userId) {
      setRole(null);
      setIsLoaded(true);
      return;
    }

    try {
      // Get session token
      const token = await getToken();
      
      if (!token) {
        console.error("No token available");
        setIsLoaded(true);
        return;
      }
      
      // Try to get user info from backend
      const response = await fetch('http://127.0.0.1:8000/api/users/info/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        const backendRole = userData.role as UserRole;
        
        console.log("Fetched user role from backend:", backendRole);
        setRole(backendRole);
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
        } else {
          // Default to hunter if no role is found anywhere
          console.log("No role found, defaulting to hunter");
          setRole('hunter');
        }
      } else {
        console.error('Error fetching user info:', response.status);
        setRole('hunter'); // Default fallback
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setRole('hunter'); // Default to hunter on error
    } finally {
      setIsLoaded(true);
    }
  };

  // Create user in backend with role
  const createUserInBackend = async (token: string, role: UserRole) => {
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
        console.error('Failed to create user in backend:', await response.text());
      }
    } catch (error) {
      console.error('Error creating user in backend:', error);
    }
  };

  // Update user role in both backend and Clerk
  const setUserRole = async (role: UserRole) => {
    if (!isSignedIn || !user) return;
    
    try {
      // Get token for backend authentication
      const token = await getToken();
      
      // Update role in backend
      const response = await fetch('http://127.0.0.1:8000/api/users/clerk/role/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update role in backend');
      }
      
      // Update role in Clerk metadata
      await fetch('/api/clerk/updateUserMetadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          metadata: { role }
        })
      });
      
      // Update local state
      setRole(role);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  // Logout function
  const logout = async () => {
    // Clerk's signOut is handled by ClerkProvider
    // Just clear our local state
    setRole(null);
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
    logout
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