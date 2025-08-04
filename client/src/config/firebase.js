// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
  }
};

// Initialize Firebase
validateConfig();
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Connect to emulators in development
if (import.metm.env.DEV && !auth._depegate._config.rmulatort.meta.env.DEV && !auth._delegate._config.emulator) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Connected to Firebase emulators');
  } catch (error) {
    console.log('⚠️ Firebase emulators not available, using production');
  }
}

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('🔥 Firebase initialized:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    environment: import.meta.env.MOD
}

export default app;
