import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: users };
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return { success: false, error: error.message };
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error in getUserById:", error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return { success: false, error: error.message };
  }
};

export const uploadAvatar = async (userId, imageUri) => {
  try {
    if (!storage) {
      return {
        success: false,
        error: "Storage chưa được enable. Vui lòng upgrade Firebase plan.",
      };
    }

    // Convert image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Storage
    const storageRef = ref(storage, `avatars/${userId}.jpg`);
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Update user document
    await updateUserProfile(userId, { avatar: downloadURL });

    return { success: true, data: downloadURL };
  } catch (error) {
    console.error("Error in uploadAvatar:", error);
    return { success: false, error: error.message };
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status,
      lastSeen: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error in updateUserStatus:", error);
    return { success: false, error: error.message };
  }
};

export const getUsersByDepartment = async (department) => {
  try {
    const q = query(
      collection(db, "users"),
      where("department", "==", department)
    );

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: users };
  } catch (error) {
    console.error("Error in getUsersByDepartment:", error);
    return { success: false, error: error.message };
  }
};

