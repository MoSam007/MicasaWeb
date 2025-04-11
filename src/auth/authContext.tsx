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

    // Force token refresh to get updated custom claims
    await user.getIdTokenResult(true);
    
    // Update local state
    setUserRole(role);
    
    // Add the role to our user object
    (user as UserWithRole).role = role;
    
    console.log("Role set successfully to:", role);
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
    } else {
      console.error('Failed to create user in backend:', 
                   createResponse.status, await createResponse.text());
      
      // Try updating the role directly as a fallback
      console.log("Trying to set role directly...");
      const roleResponse = await fetch('http://127.0.0.1:8000/api/users/role/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ role })
      });
      
      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        setUserRole(roleData.role);
        console.log("Role set successfully:", roleData.role);
      } else {
        console.error('Failed to set role:', 
                     roleResponse.status, await roleResponse.text());
      }
    }
    
    // Force token refresh to get updated custom claims
    await user.getIdTokenResult(true);
    
    return result;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

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
        
        setUserRole(role);
        
        // Add the role to our user object
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