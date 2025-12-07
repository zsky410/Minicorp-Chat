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
import { db } from "./firebase";

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

    // If name, avatar, or department changed, update conversations
    if (data.name || data.avatar || data.department) {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const { updateUserInConversations } = require("./chatService");
        await updateUserInConversations(userId, {
          name: userData.name,
          avatar: userData.avatar || "",
          department: userData.department || "",
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return { success: false, error: error.message };
  }
};

export const uploadAvatar = async (userId, imageUri) => {
  try {
    // Use storageService to convert to base64
    const { uploadAvatarImage } = require("./storageService");
    const result = await uploadAvatarImage(userId, imageUri);

    if (!result.success) {
      return result;
    }

    // Update user document with base64 data URI
    const base64DataUri = `data:image/jpeg;base64,${result.data}`;
    await updateUserProfile(userId, { avatar: base64DataUri });

    // Get updated user data to update conversations
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("Updating conversations with new avatar for user:", userId);
      // Update memberDetails in all conversations
      const { updateUserInConversations } = require("./chatService");
      const updateResult = await updateUserInConversations(userId, {
        name: userData.name,
        avatar: base64DataUri,
        department: userData.department || "",
      });

      if (!updateResult.success) {
        console.error("Failed to update conversations:", updateResult.error);
        // Don't fail the whole operation, just log the error
      }
    }

    return { success: true, data: base64DataUri };
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

