import { initializeApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseConfig } from "../../firebase.config";

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
// This ensures auth state persists between app sessions
// Try initializeAuth first, fallback to getAuth if already initialized
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If already initialized, use getAuth
  console.log("Auth already initialized, using getAuth");
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);

// Storage is optional - only initialize if Storage is enabled in Firebase Console
// If Storage requires Blaze plan upgrade, this will be null and image upload features will be disabled
let storageInstance = null;
try {
  storageInstance = getStorage(app);
} catch (error) {
  console.warn("Firebase Storage not available. Image upload features will be disabled.");
  console.warn("To enable Storage, upgrade to Blaze plan in Firebase Console.");
}

export const storage = storageInstance;

