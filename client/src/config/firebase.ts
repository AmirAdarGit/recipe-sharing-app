// Firebase configuration and initialization
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, Storage } from 'firebase/storage';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Firebase configuration from environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const validateConfig = (): void => {
  const requiredFields: (keyof FirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
  }
};

// Initialize Firebase
validateConfig();
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Initialize Firebase Storage
export const storage: Storage = getStorage(app);

// Connect to emulators only if explicitly enabled
const USE_EMULATORS: boolean = import.meta.env.VITE_USE_EMULATORS === 'true';

if (import.meta.env.DEV && USE_EMULATORS) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Connected to Firebase emulators');
  } catch (err: unknown) {
    console.log('⚠️ Firebase emulators not available, using production');
  }
}

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('🔥 Firebase initialized:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    environment: import.meta.env.MODE,
    usingEmulators: false
  });
}

export default app;
