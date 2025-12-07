import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Pin a message
export const pinMessage = async (departmentId, messageId, messageData) => {
  try {
    const pinnedRef = collection(db, "pinned_messages");

    // Check if message is already pinned
    const q = query(
      pinnedRef,
      where("departmentId", "==", departmentId),
      where("messageId", "==", messageId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { success: false, error: "Message đã được pin rồi" };
    }

    const newPin = {
      departmentId,
      messageId,
      messageText: messageData.text || "",
      senderName: messageData.senderName || "",
      senderId: messageData.senderId || "",
      pinnedBy: messageData.pinnedBy,
      pinnedAt: serverTimestamp(),
    };

    const docRef = await addDoc(pinnedRef, newPin);

    return { success: true, data: { id: docRef.id, ...newPin } };
  } catch (error) {
    console.error("Error pinning message:", error);
    return { success: false, error: error.message };
  }
};

// Unpin a message
export const unpinMessage = async (pinId) => {
  try {
    await deleteDoc(doc(db, "pinned_messages", pinId));
    return { success: true };
  } catch (error) {
    console.error("Error unpinning message:", error);
    return { success: false, error: error.message };
  }
};

// Get pinned messages for a department
export const getPinnedMessages = async (departmentId) => {
  try {
    const q = query(
      collection(db, "pinned_messages"),
      where("departmentId", "==", departmentId),
      orderBy("pinnedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const pinned = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: pinned };
  } catch (error) {
    console.error("Error getting pinned messages:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to pinned messages (realtime)
export const subscribeToPinnedMessages = (departmentId, callback) => {
  const q = query(
    collection(db, "pinned_messages"),
    where("departmentId", "==", departmentId),
    orderBy("pinnedAt", "desc")
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const pinned = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(pinned);
    },
    (error) => {
      console.error("Error subscribing to pinned messages:", error);
      callback([]);
    }
  );
};

