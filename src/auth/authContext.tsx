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
      
      // Send role to your backend to store it
      const response = await fetch('http://127.0.0.1:8000/api/user/role/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ role })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Force token refresh to get updated custom claims
      await user.getIdTokenResult(true);
      
      // Update local state
      setUserRole(role);
      return true;
    } catch (error) {
      console.error('Error setting role:', error);
      throw error;
    }
  };

  async function register(email: string, password: string, role: UserRole) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Set the role for the new user
      await setRoleForUser(result.user, role);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async function login(email: string, password: string, role: UserRole) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Update the user's role on login (in case it changed)
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
      // Set the role after social login
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
      const response = await fetch('http://127.0.0.1:8000/api/user/info/', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role as UserRole);
      } else {
        console.error('Failed to fetch user role');
        setUserRole(null);
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