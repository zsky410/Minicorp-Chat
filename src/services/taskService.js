import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Create task
export const createTask = async (departmentId, taskData) => {
  try {
    const tasksRef = collection(db, "tasks");

    const newTask = {
      departmentId,
      title: taskData.title,
      description: taskData.description || "",
      assignedTo: taskData.assignedTo,
      assignedByName: taskData.assignedByName,
      assignedBy: taskData.assignedBy,
      dueDate: taskData.dueDate,
      priority: taskData.priority || "medium", // low | medium | high
      status: "pending", // pending | in-progress | completed
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(tasksRef, newTask);

    return { success: true, data: { id: docRef.id, ...newTask } };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: error.message };
  }
};

// Get tasks for a department
export const getTasks = async (departmentId, filters = {}) => {
  try {
    let q = query(
      collection(db, "tasks"),
      where("departmentId", "==", departmentId)
    );

    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }

    q = query(q, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error getting tasks:", error);
    return { success: false, error: error.message };
  }
};

// Get my tasks (assigned to user)
export const getMyTasks = async (userId, filters = {}) => {
  try {
    let q = query(
      collection(db, "tasks"),
      where("assignedTo", "==", userId)
    );

    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }

    q = query(q, orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error getting my tasks:", error);
    return { success: false, error: error.message };
  }
};

// Update task status
export const updateTaskStatus = async (taskId, status) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating task status:", error);
    return { success: false, error: error.message };
  }
};

// Update task
export const updateTask = async (taskId, data) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: error.message };
  }
};

// Delete task
export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to tasks (realtime)
export const subscribeToTasks = (departmentId, callback) => {
  const q = query(
    collection(db, "tasks"),
    where("departmentId", "==", departmentId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const tasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(tasks);
    },
    (error) => {
      console.error("Error subscribing to tasks:", error);
      callback([]);
    }
  );
};

// Subscribe to my tasks (realtime)
export const subscribeToMyTasks = (userId, callback) => {
  const q = query(
    collection(db, "tasks"),
    where("assignedTo", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const tasks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(tasks);
    },
    (error) => {
      console.error("Error subscribing to my tasks:", error);
      callback([]);
    }
  );
};

