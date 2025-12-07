import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export const signUp = async (email, password, name, department, phone) => {
  try {
    // Validate email domain (optional)
    if (!email.endsWith("@minicorp.com")) {
      throw new Error("Chỉ email @minicorp.com mới được đăng ký");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      name,
      department,
      phone,
      avatar: "",
      role: "employee", // Default role: employee | manager | director | admin
      managedDepartments: [], // For managers: list of department IDs they manage
      status: "online",
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    if (!userDoc.exists()) {
      // User doesn't exist in Firestore, sign out immediately
      await firebaseSignOut(auth);
      return {
        success: false,
        error: "Tài khoản không tồn tại trong hệ thống. Vui lòng liên hệ admin."
      };
    }

    // Update status to online
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      status: "online",
      lastSeen: serverTimestamp(),
    });

    return { success: true, data: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    const user = auth.currentUser;
    if (user && user.uid) {
      try {
        // Update status to offline before signing out
        await updateDoc(doc(db, "users", user.uid), {
          status: "offline",
          lastSeen: serverTimestamp(),
        });
      } catch (updateError) {
        // Don't fail logout if update fails
        console.warn("Failed to update user status on logout:", updateError);
      }
    }
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error in signOut:", error);
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

