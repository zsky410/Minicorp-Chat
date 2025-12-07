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
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";

// Initialize default departments
export const initializeDefaultDepartments = async () => {
  try {
    const defaultDepartments = [
      {
        id: "general",
        name: "General",
        description: "Kênh chung cho toàn công ty",
        icon: "🏢",
        type: "public",
        members: [],
        managerId: null,
        managerName: null,
      },
      {
        id: "engineering",
        name: "Engineering",
        description: "Phòng Kỹ Thuật",
        icon: "💻",
        type: "department",
        members: [],
        managerId: null,
        managerName: null,
      },
      {
        id: "marketing",
        name: "Marketing",
        description: "Phòng Marketing",
        icon: "📢",
        type: "department",
        members: [],
        managerId: null,
        managerName: null,
      },
      {
        id: "sales",
        name: "Sales",
        description: "Phòng Kinh Doanh",
        icon: "💼",
        type: "department",
        members: [],
        managerId: null,
        managerName: null,
      },
      {
        id: "hr",
        name: "HR",
        description: "Phòng Nhân Sự",
        icon: "👥",
        type: "department",
        members: [],
        managerId: null,
        managerName: null,
      },
    ];

    for (const dept of defaultDepartments) {
      const deptRef = doc(db, "departments", dept.id);
      const deptDoc = await getDoc(deptRef);

      if (!deptDoc.exists()) {
        await setDoc(deptRef, {
          ...dept,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`Created department: ${dept.name}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error initializing departments:", error);
    return { success: false, error: error.message };
  }
};

// Get all departments
export const getAllDepartments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "departments"));
    const departments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: departments };
  } catch (error) {
    console.error("Error getting departments:", error);
    return { success: false, error: error.message };
  }
};

// Get department by ID
export const getDepartmentById = async (deptId) => {
  try {
    const deptRef = doc(db, "departments", deptId);
    const deptDoc = await getDoc(deptRef);

    if (deptDoc.exists()) {
      return { success: true, data: { id: deptDoc.id, ...deptDoc.data() } };
    } else {
      return { success: false, error: "Department not found" };
    }
  } catch (error) {
    console.error("Error getting department:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to departments (realtime)
export const subscribeToDepartments = (callback) => {
  const q = query(collection(db, "departments"), orderBy("name"));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const departments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(departments);
    },
    (error) => {
      console.error("Error subscribing to departments:", error);
    }
  );
};

// Send message in department
export const sendDepartmentMessage = async (
  deptId,
  senderId,
  senderData,
  messageText,
  imageBase64 = null
) => {
  try {
    const messagesRef = collection(db, "departments", deptId, "messages");

    const newMessage = {
      senderId,
      senderName: senderData.name,
      senderAvatar: senderData.avatar,
      senderDepartment: senderData.department,
      text: messageText,
      imageBase64: imageBase64 || null,
      type: imageBase64 ? "image" : "text",
      createdAt: serverTimestamp(),
    };

    const messageDoc = await addDoc(messagesRef, newMessage);

    // Update department's lastMessage
    const deptRef = doc(db, "departments", deptId);
    await updateDoc(deptRef, {
      lastMessage: {
        text: messageText || "📷 Hình ảnh",
        senderId,
        senderName: senderData.name,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: { id: messageDoc.id, ...newMessage } };
  } catch (error) {
    console.error("Error sending department message:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to department messages (realtime)
export const subscribeToDepartmentMessages = (deptId, callback) => {
  const q = query(
    collection(db, "departments", deptId, "messages"),
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
      console.error("Error subscribing to department messages:", error);
    }
  );
};

// Get user's departments based on role
export const getUserDepartments = async (user) => {
  try {
    const allDepts = await getAllDepartments();

    if (!allDepts.success) {
      return allDepts;
    }

    const role = user?.role || "employee";
    const userDepartment = user?.department;

    // Admin and Director can see all departments
    if (role === "admin" || role === "director") {
      return { success: true, data: allDepts.data };
    }

    // Employee and Manager see: General + their department
    const userDepts = allDepts.data.filter(
      (dept) =>
        dept.id === "general" ||
        dept.name.toLowerCase() === userDepartment?.toLowerCase()
    );

    return { success: true, data: userDepts };
  } catch (error) {
    console.error("Error getting user departments:", error);
    return { success: false, error: error.message };
  }
};

