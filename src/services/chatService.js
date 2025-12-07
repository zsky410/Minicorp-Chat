import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db, auth } from "./firebase";

// Get or create 1-1 conversation
export const getOrCreateConversation = async (
  currentUserId,
  otherUserId,
  otherUserData,
  currentUserData = null
) => {
  try {
    // Check auth state
    const currentUser = auth.currentUser;
    console.log("Auth state check:", {
      currentUser: currentUser ? currentUser.uid : null,
      currentUserId,
      match: currentUser?.uid === currentUserId,
    });

    if (!currentUser) {
      return {
        success: false,
        error: "User not authenticated. Please login again.",
      };
    }

    if (currentUser.uid !== currentUserId) {
      return {
        success: false,
        error: "User ID mismatch. Please refresh and try again.",
      };
    }

    // Sort IDs to ensure consistent conversation ID
    const members = [currentUserId, otherUserId].sort();
    const conversationId = `${members[0]}_${members[1]}`;

    const conversationRef = doc(db, "conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      return {
        success: true,
        data: { id: conversationId, ...conversationDoc.data() },
      };
    }

    // Create new conversation
    // Ensure members array contains both users
    const newConversation = {
      id: conversationId,
      type: "direct",
      members: [currentUserId, otherUserId], // Explicit array with both users
      memberDetails: {
        [otherUserId]: {
          name: otherUserData.name,
          avatar: otherUserData.avatar || "",
          department: otherUserData.department || "",
        },
      },
      lastMessage: null,
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add current user details if provided
    if (currentUserData) {
      newConversation.memberDetails[currentUserId] = {
        name: currentUserData.name,
        avatar: currentUserData.avatar || "",
        department: currentUserData.department || "",
      };
    }

    console.log("Creating conversation with data:", {
      conversationId,
      members: newConversation.members,
      currentUserId,
      authUser: currentUser.uid,
    });

    await setDoc(conversationRef, newConversation);
    return { success: true, data: newConversation };
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      currentUserId,
      otherUserId,
      authUser: auth.currentUser?.uid,
    });
    return { success: false, error: error.message };
  }
};

// Get all conversations for a user
// NOTE: This query requires a composite index in Firestore
// If you get an error, Firebase will provide a link to create the index
export const getConversations = async (userId) => {
  try {
    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: conversations };
  } catch (error) {
    console.error("Error in getConversations:", error);
    // If error is about missing index, provide helpful message
    if (error.message.includes("index")) {
      return {
        success: false,
        error:
          "Firestore index required! Check console for link to create index.",
      };
    }
    return { success: false, error: error.message };
  }
};

// Subscribe to conversations (realtime)
// NOTE: This query requires a composite index in Firestore
// If you get an error, Firebase will provide a link to create the index
export const subscribeToConversations = (userId, callback) => {
  const q = query(
    collection(db, "conversations"),
    where("members", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const conversations = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(conversations);
    },
    (error) => {
      console.error("Error in subscribeToConversations:", error);
      // If error is about missing index, show helpful message
      if (error.message.includes("index")) {
        console.warn(
          "Firestore index required! Check console for link to create index."
        );
      }
    }
  );
};

// Send message
export const sendMessage = async (
  conversationId,
  senderId,
  senderData,
  messageText,
  imageBase64 = null // Changed from imageUrl to imageBase64
) => {
  try {
    const messagesRef = collection(
      db,
      "conversations",
      conversationId,
      "messages"
    );

    const newMessage = {
      senderId,
      senderName: senderData.name,
      senderAvatar: senderData.avatar,
      text: messageText,
      imageBase64: imageBase64 || null, // Store base64 string in Firestore
      type: imageBase64 ? "image" : "text",
      status: "sent",
      createdAt: serverTimestamp(),
    };

    const messageDoc = await addDoc(messagesRef, newMessage);

    // Update conversation's last message
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const otherUserId = conversationData.members.find(
        (id) => id !== senderId
      );

      await updateDoc(conversationRef, {
        lastMessage: {
          text: messageText || "📷 Hình ảnh",
          senderId,
          senderName: senderData.name,
          timestamp: serverTimestamp(),
        },
        [`unreadCount.${otherUserId}`]: increment(1),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true, data: { id: messageDoc.id, ...newMessage } };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return { success: false, error: error.message };
  }
};

// Get messages
export const getMessages = async (conversationId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .reverse(); // Reverse to show oldest first

    return { success: true, data: messages };
  } catch (error) {
    console.error("Error in getMessages:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to messages (realtime)
export const subscribeToMessages = (conversationId, callback) => {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const messages = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse();
      callback(messages);
    },
    (error) => {
      console.error("Error in subscribeToMessages:", error);
    }
  );
};

// Mark conversation as read
export const markAsRead = async (conversationId, userId) => {
  try {
    if (!conversationId || !userId) {
      console.warn("markAsRead: Missing conversationId or userId");
      return { success: false, error: "Missing parameters" };
    }

    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0,
    });
    return { success: true };
  } catch (error) {
    console.error("Error in markAsRead:", error);
    // Don't throw error, just log it - this is not critical
    return { success: false, error: error.message };
  }
};

// Update memberDetails in all conversations for a user
// This is called when user updates their profile (avatar, name, etc.)
export const updateUserInConversations = async (userId, userData) => {
  try {
    console.log("Updating user in conversations:", userId, userData);

    // Get all conversations where user is a member
    const q = query(
      collection(db, "conversations"),
      where("members", "array-contains", userId)
    );

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} conversations to update`);

    const updatePromises = [];

    querySnapshot.forEach((docSnapshot) => {
      const conversationRef = doc(db, "conversations", docSnapshot.id);
      console.log(`Updating conversation ${docSnapshot.id} with new avatar`);
      updatePromises.push(
        updateDoc(conversationRef, {
          [`memberDetails.${userId}`]: {
            name: userData.name,
            avatar: userData.avatar || "",
            department: userData.department || "",
          },
        })
      );
    });

    await Promise.all(updatePromises);
    console.log("Successfully updated all conversations");
    return { success: true };
  } catch (error) {
    console.error("Error updating user in conversations:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      userId,
    });
    return { success: false, error: error.message };
  }
};

// Search users (for starting new chat)
export const searchUsers = async (searchTerm, currentUserId) => {
  try {
    // Note: This is a simple implementation. For production, consider using Algolia or similar
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const users = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (user) =>
          user.id !== currentUserId &&
          (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    return { success: true, data: users };
  } catch (error) {
    console.error("Error in searchUsers:", error);
    return { success: false, error: error.message };
  }
};

// Update typing status
export const updateTypingStatus = async (
  conversationId,
  userId,
  isTyping
) => {
  try {
    if (!conversationId || !userId) return { success: false };

    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      [`typing.${userId}`]: isTyping ? serverTimestamp() : null,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating typing status:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to typing status
export const subscribeToTyping = (conversationId, callback) => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);

    return onSnapshot(
      conversationRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const typing = docSnapshot.data().typing || {};
          // Check if typing is recent (within last 3 seconds)
          const now = Date.now();
          const typingStatus = {};
          Object.keys(typing).forEach((userId) => {
            const typingTime = typing[userId];
            if (typingTime) {
              const timestamp = typingTime.toMillis
                ? typingTime.toMillis()
                : typingTime;
              const isRecent = now - timestamp < 3000; // 3 seconds
              typingStatus[userId] = isRecent;
            }
          });
          callback(typingStatus);
        }
      },
      (error) => {
        console.error("Error subscribing to typing:", error);
      }
    );
  } catch (error) {
    console.error("Error in subscribeToTyping:", error);
    return () => {}; // Return empty unsubscribe function
  }
};

