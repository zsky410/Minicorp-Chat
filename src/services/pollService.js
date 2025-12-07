import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Create poll
export const createPoll = async (departmentId, pollData) => {
  try {
    const pollsRef = collection(db, "polls");

    const newPoll = {
      departmentId,
      question: pollData.question,
      options: pollData.options.map((opt, index) => ({
        id: index + 1,
        text: opt,
        votes: [],
      })),
      createdBy: pollData.createdBy,
      createdByName: pollData.createdByName,
      createdAt: serverTimestamp(),
      expiresAt: pollData.expiresAt || null,
    };

    const docRef = await addDoc(pollsRef, newPoll);

    return { success: true, data: { id: docRef.id, ...newPoll } };
  } catch (error) {
    console.error("Error creating poll:", error);
    return { success: false, error: error.message };
  }
};

// Vote on poll
export const votePoll = async (pollId, optionId, userId) => {
  try {
    const pollRef = doc(db, "polls", pollId);
    const pollDoc = await getDoc(pollRef);

    if (!pollDoc.exists()) {
      return { success: false, error: "Poll not found" };
    }

    const pollData = pollDoc.data();
    const options = pollData.options || [];

    // Remove user's vote from all options first
    const updatedOptions = options.map((opt) => ({
      ...opt,
      votes: opt.votes.filter((vote) => vote !== userId),
    }));

    // Add vote to selected option (không dùng arrayUnion vì nó không hoạt động trong nested arrays)
    const optionIndex = updatedOptions.findIndex((opt) => opt.id === optionId);
    if (optionIndex >= 0) {
      // Kiểm tra xem user đã vote chưa để tránh duplicate
      if (!updatedOptions[optionIndex].votes.includes(userId)) {
        updatedOptions[optionIndex].votes.push(userId);
      }
    }

    await updateDoc(pollRef, {
      options: updatedOptions,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error voting on poll:", error);
    return { success: false, error: error.message };
  }
};

// Get polls for a department
export const getPolls = async (departmentId) => {
  try {
    const q = query(
      collection(db, "polls"),
      where("departmentId", "==", departmentId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const polls = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: polls };
  } catch (error) {
    console.error("Error getting polls:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to polls (realtime)
export const subscribeToPolls = (departmentId, callback) => {
  const q = query(
    collection(db, "polls"),
    where("departmentId", "==", departmentId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const polls = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(polls);
    },
    (error) => {
      // Chỉ log lỗi nếu không phải do permission (user đã logout)
      if (error.code !== "permission-denied") {
        console.error("Error subscribing to polls:", error);
      }
      // Trả về empty array khi có lỗi (bao gồm cả permission denied)
      callback([]);
    }
  );
};

