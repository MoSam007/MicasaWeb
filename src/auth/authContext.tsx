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

  // Set user role in Firebase and backend
  const setRoleForUser = async (user: User, role: UserRole) => {
    try {
      // First get an ID token with the current claims
      const idToken = await user.getIdToken();
      
      console.log("Setting role for user:", user.email, "to:", role);
  
      // Send role to your backend to store it
      const response = await fetch('http://127.0.0.1:8000/api/users/role/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Failed to update role:', response.status, responseText);
        
        // If we got a 401, it might mean the user record doesn't exist yet
        // Let's try to create it by fetching user info first
        if (response.status === 401) {
          console.log("Trying to initialize user first...");
          await fetch('http://127.0.0.1:8000/api/users/info/', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          
          // Now try updating the role again
          const retryResponse = await fetch('http://127.0.0.1:8000/api/users/role/', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ role })
          });
          
          if (!retryResponse.ok) {
            console.error('Retry failed:', await retryResponse.text());
            throw new Error('Failed to update role');
          }
        } else {
          throw new Error('Failed to update role');
        }
      }
  
      // Check if we need to force refresh the token
      const responseData = await response.json(); 
      
      if (responseData.forceRefresh) {
        console.log("Forcing token refresh to get updated claims");
        // Force token refresh to get updated custom claims
        await auth.currentUser?.getIdToken(true);
        
        // Get the token result with claims
        const tokenResult = await user.getIdTokenResult(true);
        console.log("New token claims:", tokenResult.claims);
        
        // Extract role from claims
        const claimRole = tokenResult.claims.role as UserRole;
        
        if (claimRole) {
          // Update local state with role from claims
          setUserRole(claimRole);
          // Add the role to our user object
          (user as UserWithRole).role = claimRole;
          console.log("Role set successfully to:", claimRole);
        } else {
          // Default to the requested role if claims aren't updated yet
          setUserRole(role);
          (user as UserWithRole).role = role;
          console.log("Claims not updated yet, using provided role:", role);
        }
      } else {
        // Update local state
        setUserRole(role);
        // Add the role to our user object
        (user as UserWithRole).role = role;
        console.log("Role set successfully to:", role);
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
          // Force token refresh to get updated custom claims
          await user.getIdToken(true);
          
          // Double-check that claims are updated
          const tokenResult = await user.getIdTokenResult();
          console.log("Updated token claims:", tokenResult.claims);
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

  const checkTokenClaims = async (user: User): Promise<UserRole | null> => {
    try {
      // Get the token without forcing refresh first
      const tokenResult = await user.getIdTokenResult();
      console.log("Checking token claims:", tokenResult.claims);
      
      // Check different possible locations for role in claims
      let role: UserRole | null = null;
      
      if (tokenResult.claims && typeof tokenResult.claims === 'object') {
        // Check for role directly in claims
        if ('role' in tokenResult.claims) {
          role = tokenResult.claims.role as UserRole;
        }
        // Check for role in a nested 'claims' object (some Firebase versions)
        else if ('claims' in tokenResult.claims && 
                typeof tokenResult.claims.claims === 'object' &&
                tokenResult.claims.claims !== null &&
                'role' in tokenResult.claims.claims) {
          role = tokenResult.claims.claims.role as UserRole;
        }
      }
      
      if (role) {
        console.log("Found role in token claims:", role);
        return role;
      }
      
      console.log("No role found in token claims");
      return null;
    } catch (error) {
      console.error("Error checking token claims:", error);
      return null;
    }
  };
  
  // Enhanced version of token refresh logic
  const forceTokenRefreshWithRetry = async (user: User): Promise<UserRole | null> => {
    console.log("Forcing token refresh to get latest claims");
    
    // Try up to 3 times with increasing delays
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Force refresh the token
        await user.getIdToken(true);
        
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
  
  async function login(email: string, password: string, role: UserRole) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Update the user's role on login and wait for it to complete
      await setRoleForUser(result.user, role);
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
      // Set the role after social login and wait for it to complete
      await setRoleForUser(result.user, role);
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
      // First force a token refresh to get the latest claims
      await user.getIdToken(true);
      
      // Get token with claims
      const tokenResult = await user.getIdTokenResult();
      console.log("Token claims:", tokenResult.claims);
      
      // Check if role is in claims
      const claimRole = tokenResult.claims.role as UserRole;
      
      if (claimRole) {
        console.log("Found role in claims:", claimRole);
        setUserRole(claimRole);
        (user as UserWithRole).role = claimRole;
        setLoading(false);
        return;
      }
      
      // If no role in claims, try to get from backend
      const idToken = await user.getIdToken();
      
      console.log("Fetching user role from backend...");
      
      const response = await fetch('http://127.0.0.1:8000/api/users/info/', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        const role = userData.role as UserRole;
        
        console.log("Fetched user role from backend:", role);
        
        // Set role in Firebase claims
        const roleResponse = await fetch('http://127.0.0.1:8000/api/users/role/', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ role })
        });
        
        if (roleResponse.ok) {
          // Force refresh to get new token with claims
          await user.getIdToken(true);
        }
        
        setUserRole(role);
        (user as UserWithRole).role = role;
      } else {
        console.error('Failed to fetch user role:', response.status, await response.text());
        
        // If we got a 401, the user might not exist in the backend yet
        if (response.status === 401) {
          console.log("User not found in backend, creating...");
          
          // Try to create the user with default role
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
            
            // Force refresh token to get new claims
            await user.getIdToken(true);
          } else {
            console.error('Failed to create user:', await createResponse.text());
            setUserRole(null);
          }
        } else {
          setUserRole(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed, user:", user?.email);
      setCurrentUser(user);
      
      if (user) {
        fetchUserRole(user);
      } else {
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