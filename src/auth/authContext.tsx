import { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebaseConfig';

type UserRole = 'hunter' | 'owner' | 'mover' | 'admin';

interface UserWithRole extends User {
  role?: UserRole;
}

interface AuthContextType {
  currentUser: UserWithRole | null;
  userRole: UserRole | null;
  register: (email: string, password: string, role: UserRole) => Promise<any>;
  login: (email: string, password: string, role: UserRole) => Promise<any>;
  loginWithProvider: (provider: 'google' | 'facebook', role: UserRole) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Enhanced version to check for role in Firebase token claims
  const checkTokenClaims = async (user: User): Promise<UserRole | null> => {
    try {
      // Get the token without forcing refresh first
      const tokenResult = await user.getIdTokenResult();
      console.log("Checking token claims:", tokenResult.claims);
      
      // Check different possible locations for role in claims
      let role: UserRole | null = null;
      
      // Direct role claim
      if (tokenResult.claims && typeof tokenResult.claims === 'object') {
        if ('role' in tokenResult.claims) {
          role = tokenResult.claims.role as UserRole;
          console.log("Found role directly in claims:", role);
        }
        // Nested in claims object
        else if ('claims' in tokenResult.claims && 
                typeof tokenResult.claims.claims === 'object' &&
                tokenResult.claims.claims !== null &&
                'role' in tokenResult.claims.claims) {
          role = tokenResult.claims.claims.role as UserRole;
          console.log("Found role in nested claims:", role);
        }
      }
      
      return role;
    } catch (error) {
      console.error("Error checking token claims:", error);
      return null;
    }
  };
  
  // Force token refresh with retry logic
  const forceTokenRefreshWithRetry = async (user: User): Promise<UserRole | null> => {
    console.log("Forcing token refresh to get latest claims");
    
    // Try up to 3 times with increasing delays
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Force refresh the token
        await user.getIdToken(true);
        console.log(`Token refreshed on attempt ${attempt}`);
        
        // Check if we have role claims now
        const role = await checkTokenClaims(user);
        if (role) {
          console.log(`Successfully got role from claims after attempt ${attempt}: ${role}`);
          return role;
        }
        
        console.log(`No role in claims after attempt ${attempt}, waiting before retry...`);
        
        // Wait before next attempt (500ms, 1000ms, etc.)
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
      } catch (error) {
        console.error(`Token refresh attempt ${attempt} failed:`, error);
        
        // Wait before retry
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
      }
    }
    
    console.log("Failed to get role from claims after multiple attempts");
    return null;
  };

  // Set user role in Firebase and backend
  const setRoleForUser = async (user: User, role: UserRole) => {
    try {
      // First get an ID token
      const idToken = await user.getIdToken();
      
      console.log("Setting role for user:", user.email, "to:", role);
  
      // Send role to backend to store it and update Firebase claims
      const response = await fetch('http://127.0.0.1:8000/api/users/role/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        // Handle 403 Forbidden specifically - likely an admin permission issue
        if (response.status === 403) {
          console.log("Permission denied when updating role. Creating user first...");
          
          // Try creating the user with the role instead
          const createResponse = await fetch('http://127.0.0.1:8000/api/users/create/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ role })
          });
          
          if (!createResponse.ok) {
            console.error('Failed to create user:', await createResponse.text());
            throw new Error('Failed to create user and set role');
          }
          
          const userData = await createResponse.json();
          console.log("User created with role:", userData.role);
          
          // If forceRefresh flag is present, we need to refresh the token
          if (userData.forceRefresh) {
            await forceTokenRefreshWithRetry(user);
          }
        } else {
          const responseText = await response.text();
          console.error('Failed to update role:', response.status, responseText);
          throw new Error('Failed to update role');
        }
      } else {
        // Process successful response
        const responseData = await response.json();
        
        // Check if we need to force refresh the token
        if (responseData.forceRefresh) {
          console.log("Backend indicated token refresh needed");
          // Force refresh and get role from claims
          const claimRole = await forceTokenRefreshWithRetry(user);
          
          if (claimRole) {
            // Use role from refreshed claims
            setUserRole(claimRole);
            (user as UserWithRole).role = claimRole;
            console.log("Role updated from refreshed claims:", claimRole);
          } else {
            // Fall back to the role we requested
            setUserRole(role);
            (user as UserWithRole).role = role;
            console.log("Using requested role as fallback:", role);
          }
        } else {
          // Update local state with requested role
          setUserRole(role);
          (user as UserWithRole).role = role;
          console.log("Role set successfully to:", role);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error setting role:', error);
      throw error;
    }
  };

  async function register(email: string, password: string, role: UserRole) {
    try {
      // First register with Firebase
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      console.log("User registered with Firebase:", user.email);
      
      // Get ID token
      const idToken = await user.getIdToken(true);
      
      // Create user in backend with role
      console.log("Creating user in backend with role:", role);
      const createResponse = await fetch('http://127.0.0.1:8000/api/users/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ role })
      });
      
      if (createResponse.ok) {
        const userData = await createResponse.json();
        setUserRole(userData.role);
        console.log("User created in backend with role:", userData.role);
        
        // If forceRefresh flag is returned, force token refresh
        if (userData.forceRefresh) {
          console.log("Forcing token refresh as instructed by backend");
          await forceTokenRefreshWithRetry(user);
        }
      } else {
        console.error('Failed to create user in backend:', 
                     createResponse.status, await createResponse.text());
        
        // Try updating the role directly as a fallback
        console.log("Trying to set role directly...");
        await setRoleForUser(user, role);
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  async function login(email: string, password: string, role: UserRole) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in with Firebase:", result.user.email);
      
      // First check if user has a role in claims already
      const existingRole = await checkTokenClaims(result.user);
      
      if (existingRole) {
        console.log("User already has role in claims:", existingRole);
        setUserRole(existingRole);
        (result.user as UserWithRole).role = existingRole;
        
        // If user selected a different role than what's in claims,
        // update the role (this allows role switching on login)
        if (existingRole !== role) {
          console.log("Updating role from", existingRole, "to", role);
          await setRoleForUser(result.user, role);
        }
      } else {
        // No role in claims, set the selected role
        console.log("No role in claims, setting selected role:", role);
        await setRoleForUser(result.user, role);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function loginWithProvider(providerName: 'google' | 'facebook', role: UserRole) {
    const provider = providerName === 'google' ? googleProvider : facebookProvider;
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User logged in with provider:", result.user.email);
      
      // First check if user has a role in claims already
      const existingRole = await checkTokenClaims(result.user);
      
      if (existingRole) {
        console.log("User already has role in claims:", existingRole);
        setUserRole(existingRole);
        (result.user as UserWithRole).role = existingRole;
        
        // If user selected a different role than what's in claims,
        // update the role (this allows role switching on login)
        if (existingRole !== role) {
          console.log("Updating role from", existingRole, "to", role);
          await setRoleForUser(result.user, role);
        }
      } else {
        // No role in claims, set the selected role
        console.log("No role in claims, setting selected role:", role);
        await setRoleForUser(result.user, role);
      }
      
      return result;
    } catch (error) {
      console.error('Error signing in with provider:', error);
      throw error;
    }
  }

  function logout() {
    setUserRole(null);
    return signOut(auth);
  }

  // Fetch user role from backend when user changes
  const fetchUserRole = async (user: User) => {
    try {
      console.log("Fetching user role for:", user.email);
      
      // First check if role is already in claims
      const claimRole = await checkTokenClaims(user);
      
      if (claimRole) {
        console.log("Found role in Firebase claims:", claimRole);
        setUserRole(claimRole);
        (user as UserWithRole).role = claimRole;
        setLoading(false);
        return;
      }
      
      // No role in claims, try to force refresh token
      console.log("No role in claims, forcing token refresh");
      const refreshedRole = await forceTokenRefreshWithRetry(user);
      
      if (refreshedRole) {
        console.log("Got role after token refresh:", refreshedRole);
        setUserRole(refreshedRole);
        (user as UserWithRole).role = refreshedRole;
        setLoading(false);
        return;
      }
      
      // If still no role, try to get from backend
      console.log("No role in claims even after refresh, checking backend");
      const idToken = await user.getIdToken();
      
      // Try fetching user info
      const response = await fetch('http://127.0.0.1:8000/api/users/info/', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        const backendRole = userData.role as UserRole;
        
        console.log("Fetched user role from backend:", backendRole);
        
        // Update role in Firebase claims to match backend
        if (backendRole) {
          console.log("Updating Firebase claims with backend role:", backendRole);
          
          const roleResponse = await fetch('http://127.0.0.1:8000/api/users/role/', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ role: backendRole })
          });
          
          if (roleResponse.ok) {
            // Force token refresh to get updated claims
            await forceTokenRefreshWithRetry(user);
          } else {
            console.error("Failed to update Firebase claims:", await roleResponse.text());
          }
          
          setUserRole(backendRole);
          (user as UserWithRole).role = backendRole;
        } else {
          console.log("No role found in backend data, defaulting to hunter");
          setUserRole('hunter');
          (user as UserWithRole).role = 'hunter';
        }
      } else {
        // If user doesn't exist in backend, create with default role
        if (response.status === 401) {
          console.log("User not found in backend, creating with default role");
          
          const createResponse = await fetch('http://127.0.0.1:8000/api/users/create/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ role: 'hunter' }) // Default role
          });
          
          if (createResponse.ok) {
            const userData = await createResponse.json();
            setUserRole(userData.role as UserRole);
            (user as UserWithRole).role = userData.role;
            
            // Force refresh token
            await forceTokenRefreshWithRetry(user);
          } else {
            console.error('Failed to create user:', await createResponse.text());
            setUserRole('hunter'); // Default fallback
            (user as UserWithRole).role = 'hunter';
          }
        } else {
          console.error('Error fetching user info:', response.status);
          setUserRole('hunter'); // Default fallback
          (user as UserWithRole).role = 'hunter';
        }
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      // Default to hunter role as fallback
      setUserRole('hunter');
      (user as UserWithRole).role = 'hunter';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed, user:", user?.email);
      
      if (user) {
        const userWithRole = user as UserWithRole;
        setCurrentUser(userWithRole);
        fetchUserRole(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    register,
    login,
    loginWithProvider,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}