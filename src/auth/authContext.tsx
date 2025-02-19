import { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebaseConfig';

type UserRole = 'hunter' | 'owner' | 'mover' | 'admin';

interface UserWithRole extends User {
  role?: UserRole;
}

interface AuthContextType {
  currentUser: UserWithRole | null;
  register: (email: string, password: string, role: string) => Promise<any>;
  login: (email: string, password: string, role: string) => Promise<any>;
  loginWithProvider: (provider: 'google' | 'facebook', role: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

// ... rest of your context implementation
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithProvider(providerName: 'google' | 'facebook') {
    const provider = providerName === 'google' ? googleProvider : facebookProvider;
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      console.error('Error signing in with provider:', error);
      throw error;
    }
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
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