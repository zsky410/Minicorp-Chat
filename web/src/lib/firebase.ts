// Firebase initialization for web
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config - can be moved to env variables later
const firebaseConfig = {
  apiKey: "AIzaSyD6ZzoRyo-xTq3mSFzq7UjJWlIAviZ0Aec",
  authDomain: "minicorpchat.firebaseapp.com",
  projectId: "minicorpchat",
  storageBucket: "minicorpchat.firebasestorage.app",
  messagingSenderId: "408383910548",
  appId: "1:408383910548:web:58a5e76600136cd42c7a81"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

