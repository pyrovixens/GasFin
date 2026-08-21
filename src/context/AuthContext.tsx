import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthState } from '../types';
import { 
  getFirebaseServices, 
  isFirebaseConfigured, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  FirebaseUser 
} from '../services/firebase';

interface AuthContextType extends AuthState {
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginAsGuest: (alias: string) => void;
  logout: () => Promise<void>;
  switchAccount: (uid: string) => void;
  savedAccounts: UserProfile[];
  deleteAccountLocal: (uid: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'gastfin_auth_current_user_v5',
  SAVED_ACCOUNTS: 'gastfin_auth_saved_accounts_v5',
  USERS_DB: 'gastfin_local_users_db_v5',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [savedAccounts, setSavedAccounts] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.SAVED_ACCOUNTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync saved accounts list
  const persistUserSession = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    
    setSavedAccounts(prev => {
      const filtered = prev.filter(u => u.uid !== user.uid);
      const updated = [user, ...filtered];
      localStorage.setItem(AUTH_STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(updated));
      return updated;
    });
  };

  // Listen to Firebase auth state if configured
  useEffect(() => {
    const { auth } = getFirebaseServices();
    if (auth && isFirebaseConfigured()) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || `${fbUser.uid}@gastfin.app`,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario',
            photoURL: fbUser.photoURL || undefined,
            provider: fbUser.providerData[0]?.providerId.includes('google') ? 'google' : 'password',
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          persistUserSession(profile);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Google Login
  const loginWithGoogle = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const { auth, googleProvider } = getFirebaseServices();
      if (auth && googleProvider && isFirebaseConfigured()) {
        const res = await signInWithPopup(auth, googleProvider);
        const fbUser = res.user;
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Usuario Google',
          photoURL: fbUser.photoURL || undefined,
          provider: 'google',
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        persistUserSession(profile);
        setIsAuthModalOpen(false);
      } else {
        // Fallback / Simulated Google Sign-In with popup dialog for zero-setup demo
        const simulatedName = prompt('Ingresa tu nombre o alias para acceder con Google:', 'Gustavo') || 'Usuario Google';
        const simulatedEmail = `${simulatedName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
        const profile: UserProfile = {
          uid: `google-${Date.now()}`,
          email: simulatedEmail,
          displayName: simulatedName,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${simulatedName}`,
          provider: 'google',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        persistUserSession(profile);
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email Login
  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const { auth } = getFirebaseServices();
      if (auth && isFirebaseConfigured()) {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        const fbUser = res.user;
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || email,
          displayName: fbUser.displayName || email.split('@')[0],
          provider: 'password',
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        persistUserSession(profile);
        setIsAuthModalOpen(false);
      } else {
        // Local Multi-user database check
        const usersDbStr = localStorage.getItem(AUTH_STORAGE_KEYS.USERS_DB);
        const usersDb = usersDbStr ? JSON.parse(usersDbStr) : [];
        const existing = usersDb.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (!existing) {
          throw new Error('Usuario no encontrado. Por favor regístrate primero.');
        }
        if (existing.password !== pass) {
          throw new Error('Contraseña incorrecta.');
        }

        const profile: UserProfile = {
          uid: existing.uid,
          email: existing.email,
          displayName: existing.displayName,
          photoURL: existing.photoURL,
          provider: 'password',
          createdAt: existing.createdAt,
          lastLoginAt: new Date().toISOString(),
        };
        persistUserSession(profile);
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Credenciales inválidas.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email Register
  const registerWithEmail = async (name: string, email: string, pass: string) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const { auth } = getFirebaseServices();
      if (auth && isFirebaseConfigured()) {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        const fbUser = res.user;
        await updateProfile(fbUser, { displayName: name });
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || email,
          displayName: name,
          provider: 'password',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        persistUserSession(profile);
        setIsAuthModalOpen(false);
      } else {
        // Local Multi-user registration
        const usersDbStr = localStorage.getItem(AUTH_STORAGE_KEYS.USERS_DB);
        const usersDb = usersDbStr ? JSON.parse(usersDbStr) : [];
        const existing = usersDb.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (existing) {
          throw new Error('Ya existe una cuenta con este correo electrónico.');
        }

        const newUid = `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newUserRecord = {
          uid: newUid,
          email: email.trim(),
          password: pass,
          displayName: name.trim() || email.split('@')[0],
          photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
          createdAt: new Date().toISOString(),
        };

        usersDb.push(newUserRecord);
        localStorage.setItem(AUTH_STORAGE_KEYS.USERS_DB, JSON.stringify(usersDb));

        const profile: UserProfile = {
          uid: newUid,
          email: email.trim(),
          displayName: newUserRecord.displayName,
          photoURL: newUserRecord.photoURL,
          provider: 'password',
          createdAt: newUserRecord.createdAt,
          lastLoginAt: new Date().toISOString(),
        };
        persistUserSession(profile);
        setIsAuthModalOpen(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  // Guest / Alias Login
  const loginAsGuest = (alias: string) => {
    const cleanAlias = alias.trim() || 'Invitado';
    const guestUid = `guest-${cleanAlias.toLowerCase().replace(/\s+/g, '_')}-${Date.now().toString().slice(-4)}`;
    const profile: UserProfile = {
      uid: guestUid,
      email: `${cleanAlias.toLowerCase()}@gastfin.local`,
      displayName: cleanAlias,
      provider: 'guest',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    persistUserSession(profile);
    setIsAuthModalOpen(false);
  };

  // Logout
  const logout = async () => {
    try {
      const { auth } = getFirebaseServices();
      if (auth && isFirebaseConfigured()) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Signout note:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  };

  // Switch Account
  const switchAccount = (uid: string) => {
    const target = savedAccounts.find(u => u.uid === uid);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(target));
      setIsAuthModalOpen(false);
    }
  };

  // Delete Account Locally
  const deleteAccountLocal = (uid: string) => {
    const updated = savedAccounts.filter(u => u.uid !== uid);
    setSavedAccounts(updated);
    localStorage.setItem(AUTH_STORAGE_KEYS.SAVED_ACCOUNTS, JSON.stringify(updated));
    if (currentUser?.uid === uid) {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        authError,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsGuest,
        logout,
        switchAccount,
        savedAccounts,
        deleteAccountLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
