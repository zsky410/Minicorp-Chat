import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";

// Create announcement (Admin only)
export const createAnnouncement = async (creatorId, creatorName, data) => {
  try {
    const announcementRef = collection(db, "announcements");

    const newAnnouncement = {
      title: data.title,
      content: data.content,
      priority: data.priority || "normal", // normal | urgent
      scope: data.scope || "department", // department | company
      createdBy: creatorId,
      createdByName: creatorName,
      targetDepartments: data.targetDepartments || [], // Empty = all (company-wide)
      readBy: [],
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(announcementRef, newAnnouncement);

    return { success: true, data: { id: docRef.id, ...newAnnouncement } };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { success: false, error: error.message };
  }
};

// Get all announcements
export const getAllAnnouncements = async () => {
  try {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const announcements = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: announcements };
  } catch (error) {
    console.error("Error getting announcements:", error);
    return { success: false, error: error.message };
  }
};

// Get announcement by ID
export const getAnnouncementById = async (announcementId) => {
  try {
    const docRef = doc(db, "announcements", announcementId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Announcement not found" };
    }
  } catch (error) {
    console.error("Error getting announcement:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to announcements (realtime)
export const subscribeToAnnouncements = (callback) => {
  const q = query(
    collection(db, "announcements"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const announcements = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(announcements);
    },
    (error) => {
      console.error("Error subscribing to announcements:", error);
    }
  );
};

// Mark announcement as read
export const markAnnouncementAsRead = async (announcementId, userId) => {
  try {
    const docRef = doc(db, "announcements", announcementId);
    await updateDoc(docRef, {
      readBy: arrayUnion(userId),
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    return { success: false, error: error.message };
  }
};

// Delete announcement (Admin only)
export const deleteAnnouncement = async (announcementId) => {
  try {
    const docRef = doc(db, "announcements", announcementId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: error.message };
  }
};

// Get unread count for user
export const getUnreadCount = (announcements, userId, userDepartment) => {
  return announcements.filter((announcement) => {
    // Check if user has read it
    if (announcement.readBy?.includes(userId)) {
      return false;
    }

    // Check if announcement is for user's department
    const targets = announcement.targetDepartments || [];
    if (targets.length === 0) {
      // No target = for everyone
      return true;
    }

    // Check if user's department is in targets
    return targets.includes(userDepartment);
  }).length;
};

// Get announcements for user's department
export const getUserAnnouncements = (announcements, userDepartment) => {
  return announcements.filter((announcement) => {
    // Company-wide announcements (scope = "company" or empty targetDepartments)
    if (announcement.scope === "company" || (announcement.targetDepartments || []).length === 0) {
      return true;
    }

    // Department-specific announcements
    const targets = announcement.targetDepartments || [];
    return targets.includes(userDepartment);
  });
};

