import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

type UserRole = 'hunter' | 'owner' | 'mover' | 'admin';

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null;
  userEmail: string | null;
  username: string | null;
  userRole: UserRole | null;
  currentUser: {
    email: string | null;
    role: UserRole | null;
  } | null;
  setUserRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  checkUserPermission: (requiredRoles: UserRole[]) => boolean;
  refreshUserData: () => Promise<void>;
   getToken: (options?: { template?: string }) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded: clerkLoaded, userId, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const [userRole, setRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const { getToken, signOut } = useClerkAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get role-specific default routes
  const getRoleDefaultRoute = (role: UserRole): string => {
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

  // Check if current path is appropriate for user role
  const isOnAppropriateRoute = (role: UserRole, currentPath: string): boolean => {
    const publicRoutes = ['/', '/about', '/login', '/register', '/register/verify-email-address'];
    
    // Allow public routes
    if (publicRoutes.includes(currentPath)) {
      return false; // Should redirect to role-specific route
    }

    // Check role-specific routes
    switch (role) {
      case 'hunter':
        return currentPath.startsWith('/listings') || 
               currentPath.startsWith('/listing/') || 
               currentPath.startsWith('/wishlist');
      case 'owner':
        return currentPath.startsWith('/my-listings') || 
               currentPath.startsWith('/add-listing') ||
               currentPath.startsWith('/owner-analytics') || 
               currentPath.startsWith('/admin/listings');
      case 'mover':
        return currentPath.startsWith('/moving-services') || 
               currentPath.startsWith('/jobs') || 
               currentPath.startsWith('/mover-') ||
               currentPath.startsWith('/mover-dashboard');
      case 'admin':
        return currentPath.startsWith('/admin/')||
                currentPath.startsWith('/admin/dashboard');
      default:
        return false;
    }
  };

  // Fetch user role from Django backend using Clerk token
  const fetchUserRole = async () => {
    if (!isSignedIn || !userId) {
      setRole(null);
      setUsername(null);
      setIsLoaded(true);
      setHasRedirected(false);
      return;
    }

    try {
      // Get session token
      const token = await getToken({
        template: "micasa",
      });
      
      if (!token) {
        console.error("No token available");
        setIsLoaded(true);
        return;
      }
      
      // Try to get user info from backend
      const response = await fetch(`${API_URL}/api/users/clerk/info/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Auth-Provider': 'clerk' // Explicitly tell the backend to use Clerk auth
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        const backendRole = userData.role as UserRole;
        const backendUsername = userData.username;
        
        console.log("Fetched user role from backend:", backendRole);
        setRole(backendRole);
        setUsername(backendUsername);
        
        // Check if we need to redirect to appropriate route
        if (!hasRedirected && !isOnAppropriateRoute(backendRole, location.pathname)) {
          console.log("Redirecting user to appropriate route based on role:", backendRole);
          navigate(getRoleDefaultRoute(backendRole), { replace: true });
          setHasRedirected(true);
        }
      } else if (response.status === 404 || response.status === 401) {
        // User doesn't exist in backend yet
        console.log("User not found in backend");
        
        // Check if role is in Clerk metadata
        const publicMetadata = user?.publicMetadata as { role?: UserRole };
        const metadataRole = publicMetadata?.role;
        
        if (metadataRole) {
          console.log("Found role in Clerk metadata:", metadataRole);
          
          // Create user in backend with role from metadata
          await createUserInBackend(metadataRole);
          setRole(metadataRole);
          
          // Redirect to appropriate route
          if (!hasRedirected && !isOnAppropriateRoute(metadataRole, location.pathname)) {
            console.log("Redirecting user to appropriate route based on metadata role:", metadataRole);
            navigate(getRoleDefaultRoute(metadataRole), { replace: true });
            setHasRedirected(true);
          }
        } else {
          // Default to hunter if no role is found anywhere
          console.log("No role found, defaulting to hunter");
          setRole('hunter');
          
          // Save this default role to Clerk metadata
          try {
            await user?.update({
              unsafeMetadata: {
                ...user.publicMetadata,
                role: 'hunter'
              }
            });
            
            // Also create user in backend
            await createUserInBackend('hunter');
          } catch (error) {
            console.error("Error updating Clerk metadata:", error);
          }
          
          // Redirect to hunter default route
          if (!hasRedirected && !isOnAppropriateRoute('hunter', location.pathname)) {
            console.log("Redirecting new user to hunter route");
            navigate('/listings', { replace: true });
            setHasRedirected(true);
          }
        }
      } else {
        console.error('Error fetching user info:', response.status);
        setRole('hunter'); // Default fallback
        
        // Redirect to default route
        if (!hasRedirected && location.pathname === '/') {
          navigate('/listings', { replace: true });
          setHasRedirected(true);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setRole('hunter'); // Default to hunter on error
      
      // Redirect to default route on error
      if (!hasRedirected && location.pathname === '/') {
        navigate('/listings', { replace: true });
        setHasRedirected(true);
      }
    } finally {
      setIsLoaded(true);
    }
  };

  // Create user in backend with role
  const createUserInBackend = async (role: UserRole) => {
    try {
      // Get fresh token with audience
      const token = await getToken({
        template: "micasa",
      });

      if (!token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${API_URL}/api/users/clerk/create/`, {
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
      } else {
        // Get the created user data including username
        const userData = await response.json();
        setUsername(userData.username);
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
      const token = await getToken({
        template: 'micasa',
      });
      
      // Update role in backend
      const response = await fetch(`${API_URL}/api/users/clerk/role/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Auth-Provider': 'clerk'
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update role in backend');
      }
      
      // Update role in Clerk metadata directly using Clerk SDK
      await user.update({
        unsafeMetadata: {
          ...user.publicMetadata,
          role
        }
      });
      
      // Update local state
      setRole(role);
      
      console.log(`User role updated to ${role}`);
      
      // Navigate user to appropriate dashboard based on their new role
      redirectBasedOnRole(role);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error; // Rethrow to allow component to handle errors
    }
  };

  // Redirect user based on role
  const redirectBasedOnRole = (role: UserRole) => {
    const targetRoute = getRoleDefaultRoute(role);
    console.log(`Redirecting user with role ${role} to ${targetRoute}`);
    navigate(targetRoute, { replace: true });
  };

  // Function to manually refresh user data
  const refreshUserData = async () => {
    if (isSignedIn && userId) {
      await fetchUserRole();
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      setRole(null);
      setUsername(null);
      setHasRedirected(false);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };
  
  // Helper function to check if user has the required role
  const checkUserPermission = (requiredRoles: UserRole[]): boolean => {
    if (!isSignedIn || !userRole) return false;
    
    // Admin role has access to everything
    if (userRole === 'admin') return true;
    
    // Check if user's role is in the required roles array
    return requiredRoles.includes(userRole);
  };

  // Load user role when auth state changes
  useEffect(() => {
    if (clerkLoaded) {
      fetchUserRole();
    }
  }, [clerkLoaded, isSignedIn, userId, fetchUserRole]);

  // Reset redirect flag when location changes
  useEffect(() => {
    setHasRedirected(false);
  }, [location.pathname]);

  const value = {
    isLoaded,
    isSignedIn,
    userId: userId ?? null,
    userEmail: user?.primaryEmailAddress?.emailAddress || null,
    username,
    userRole,
    currentUser: isSignedIn ? {
    email: user?.primaryEmailAddress?.emailAddress || null,
    role: userRole
  } : null,
    setUserRole,
    logout,
    checkUserPermission,
    refreshUserData,
    getToken
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