import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  Firestore, 
  enableIndexedDbPersistence 
} from 'firebase/firestore';

// Default Firebase Configuration (can be overridden by environment variables or custom config)
export const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForGastFinAppDemo2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gastfin-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gastfin-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gastfin-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export const isFirebaseConfigured = (): boolean => {
  const customConfig = localStorage.getItem('gastfin_custom_firebase_config');
  if (customConfig) {
    try {
      const parsed = JSON.parse(customConfig);
      return Boolean(parsed.apiKey && !parsed.apiKey.includes('DummyKey'));
    } catch {
      return false;
    }
  }
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY && 
    !import.meta.env.VITE_FIREBASE_API_KEY.includes('DummyKey')
  );
};

export const getFirebaseServices = () => {
  if (!app && typeof window !== 'undefined') {
    try {
      const storedConfig = localStorage.getItem('gastfin_custom_firebase_config');
      const activeConfig = storedConfig ? JSON.parse(storedConfig) : defaultFirebaseConfig;
      
      if (!getApps().length) {
        app = initializeApp(activeConfig);
      } else {
        app = getApps()[0];
      }

      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    } catch (err) {
      console.warn('Firebase initialization in fallback mode:', err);
    }
  }
  return { app, auth, db, googleProvider };
};

export {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
};
export type { FirebaseUser };
