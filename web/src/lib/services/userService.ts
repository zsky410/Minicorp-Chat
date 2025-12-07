import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
  deleteField,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

export interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  department: string;
  role: "employee" | "manager" | "director" | "admin";
  avatar?: string;
  phone?: string;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    return { success: true, data: users };
  } catch (error: any) {
    console.error("Error in getAllUsers:", error);
    return { success: false, error: error.message };
  }
};

export const getUserById = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { success: true, data: { id: userDoc.id, ...userDoc.data() } as User };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error: any) {
    console.error("Error in getUserById:", error);
    return { success: false, error: error.message };
  }
};

export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  department: string;
  role: "employee" | "manager" | "director" | "admin";
  phone?: string;
}) => {
  try {
    // Create user in Firebase Auth
    const { createUserWithEmailAndPassword, getAuth } = await import("firebase/auth");
    const { auth } = await import("../firebase");

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
    } catch (authError: any) {
      // Nếu email đã tồn tại trong Auth nhưng không có trong Firestore
      // (trường hợp user đã bị xóa khỏi Firestore nhưng vẫn còn trong Auth)
      if (authError.code === "auth/email-already-in-use") {
        // Kiểm tra xem user có trong Firestore không
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userData.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // User không có trong Firestore, nhưng có trong Auth
          // Cần xóa user trong Auth trước (cần admin privileges)
          // Tạm thời trả về lỗi với message rõ ràng hơn
          return {
            success: false,
            error: "Email này đã được sử dụng trong hệ thống xác thực. Vui lòng xóa user cũ trong Firebase Console (Authentication) trước khi tạo lại, hoặc sử dụng email khác.",
          };
        } else {
          // User có trong Firestore
          return {
            success: false,
            error: "Email này đã được sử dụng. Vui lòng chọn email khác.",
          };
        }
      }
      throw authError;
    }

    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: userData.email,
      name: userData.name,
      department: userData.department,
      role: userData.role,
      phone: userData.phone || "",
      avatar: "",
      status: "offline",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: { id: user.uid, ...userData } };
  } catch (error: any) {
    console.error("Error in createUser:", error);
    // Xử lý lỗi cụ thể
    let errorMessage = error.message;
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email này đã được sử dụng. Vui lòng chọn email khác.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Email không hợp lệ.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (ít nhất 6 ký tự).";
    }
    return { success: false, error: errorMessage };
  }
};

export const updateUser = async (userId: string, data: Partial<User>) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateUser:", error);
    return { success: false, error: error.message };
  }
};

// Helper function để xóa collection (batch delete)
async function deleteCollection(collectionRef: any, batchSize = 100) {
  let deletedCount = 0;
  let hasMore = true;

  while (hasMore) {
    const snapshot = await getDocs(query(collectionRef, limit(batchSize)));

    if (snapshot.empty) {
      hasMore = false;
      break;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    deletedCount += snapshot.docs.length;

    // Nếu số documents ít hơn batchSize, đã xóa hết
    if (snapshot.docs.length < batchSize) {
      hasMore = false;
    }
  }

  return deletedCount;
}

export const deleteUser = async (userId: string) => {
  try {
    console.log(`Starting cleanup for user: ${userId}`);

    // 1. Xóa conversations và messages
    const conversationsQuery = query(
      collection(db, "conversations"),
      where("members", "array-contains", userId)
    );
    const conversationsSnapshot = await getDocs(conversationsQuery);

    const conversationPromises: Promise<any>[] = [];
    conversationsSnapshot.forEach((conversationDoc) => {
      const conversationId = conversationDoc.id;
      // Xóa messages trong conversation
      const messagesRef = collection(db, "conversations", conversationId, "messages");
      conversationPromises.push(deleteCollection(messagesRef));
      // Xóa conversation
      conversationPromises.push(deleteDoc(doc(db, "conversations", conversationId)));
    });
    await Promise.all(conversationPromises);
    console.log(`✓ Deleted ${conversationsSnapshot.size} conversations`);

    // 2. Xóa department messages
    const departmentsSnapshot = await getDocs(collection(db, "departments"));
    const departmentMessagePromises: Promise<any>[] = [];

    departmentsSnapshot.forEach((deptDoc) => {
      const messagesRef = collection(db, "departments", deptDoc.id, "messages");
      const userMessagesQuery = query(messagesRef, where("senderId", "==", userId));
      departmentMessagePromises.push(
        getDocs(userMessagesQuery).then((messagesSnapshot) => {
          if (messagesSnapshot.empty) return 0;
          const batch = writeBatch(db);
          messagesSnapshot.forEach((msgDoc) => {
            batch.delete(msgDoc.ref);
          });
          return batch.commit().then(() => messagesSnapshot.size);
        })
      );
    });
    await Promise.all(departmentMessagePromises);
    console.log(`✓ Deleted department messages`);

    // 3. Xóa announcements created by user
    const announcementsQuery = query(
      collection(db, "announcements"),
      where("createdBy", "==", userId)
    );
    const announcementsSnapshot = await getDocs(announcementsQuery);
    const announcementPromises: Promise<any>[] = [];
    announcementsSnapshot.forEach((announcementDoc) => {
      announcementPromises.push(deleteDoc(announcementDoc.ref));
    });
    await Promise.all(announcementPromises);
    console.log(`✓ Deleted ${announcementsSnapshot.size} announcements`);

    // 4. Xóa polls created by user
    const pollsQuery = query(
      collection(db, "polls"),
      where("createdBy", "==", userId)
    );
    const pollsSnapshot = await getDocs(pollsQuery);
    const pollPromises: Promise<any>[] = [];
    pollsSnapshot.forEach((pollDoc) => {
      pollPromises.push(deleteDoc(pollDoc.ref));
    });
    await Promise.all(pollPromises);
    console.log(`✓ Deleted ${pollsSnapshot.size} polls`);

    // 5. Xóa pinned messages pinned by user
    const pinnedQuery = query(
      collection(db, "pinned_messages"),
      where("pinnedBy", "==", userId)
    );
    const pinnedSnapshot = await getDocs(pinnedQuery);
    const pinnedPromises: Promise<any>[] = [];
    pinnedSnapshot.forEach((pinnedDoc) => {
      pinnedPromises.push(deleteDoc(pinnedDoc.ref));
    });
    await Promise.all(pinnedPromises);
    console.log(`✓ Deleted ${pinnedSnapshot.size} pinned messages`);

    // 6. Xóa tasks assigned to user
    const tasksQuery = query(
      collection(db, "tasks"),
      where("assignedTo", "==", userId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const taskPromises: Promise<any>[] = [];
    tasksSnapshot.forEach((taskDoc) => {
      taskPromises.push(deleteDoc(taskDoc.ref));
    });
    await Promise.all(taskPromises);
    console.log(`✓ Deleted ${tasksSnapshot.size} tasks`);

    // 7. Remove user from departments
    const allDepartmentsSnapshot = await getDocs(collection(db, "departments"));
    const departmentUpdatePromises: Promise<any>[] = [];

    allDepartmentsSnapshot.forEach((deptDoc) => {
      const deptData = deptDoc.data();
      if (deptData.members && deptData.members.includes(userId)) {
        const updatedMembers = deptData.members.filter((memberId: string) => memberId !== userId);
        const updateData: any = { members: updatedMembers };

        // Nếu user là manager, xóa manager info
        if (deptData.managerId === userId) {
          updateData.managerId = deleteField();
          updateData.managerName = deleteField();
        }

        departmentUpdatePromises.push(updateDoc(deptDoc.ref, updateData));
      }
    });
    await Promise.all(departmentUpdatePromises);
    console.log(`✓ Removed user from departments`);

    // 8. Remove user votes from polls
    const allPollsSnapshot = await getDocs(collection(db, "polls"));
    const pollUpdatePromises: Promise<any>[] = [];

    allPollsSnapshot.forEach((pollDoc) => {
      const pollData = pollDoc.data();
      let needsUpdate = false;
      const updatedOptions = pollData.options.map((option: any) => {
        if (option.votes && option.votes.includes(userId)) {
          needsUpdate = true;
          return {
            ...option,
            votes: option.votes.filter((voteId: string) => voteId !== userId),
          };
        }
        return option;
      });

      if (needsUpdate) {
        pollUpdatePromises.push(updateDoc(pollDoc.ref, { options: updatedOptions }));
      }
    });
    await Promise.all(pollUpdatePromises);
    console.log(`✓ Removed user votes from polls`);

    // 9. Remove user from announcement readBy arrays
    const allAnnouncementsSnapshot = await getDocs(collection(db, "announcements"));
    const announcementUpdatePromises: Promise<any>[] = [];

    allAnnouncementsSnapshot.forEach((announcementDoc) => {
      const announcementData = announcementDoc.data();
      if (announcementData.readBy && announcementData.readBy.includes(userId)) {
        const updatedReadBy = announcementData.readBy.filter((readId: string) => readId !== userId);
        announcementUpdatePromises.push(
          updateDoc(announcementDoc.ref, { readBy: updatedReadBy })
        );
      }
    });
    await Promise.all(announcementUpdatePromises);
    console.log(`✓ Removed user from announcement readBy arrays`);

    // 10. Cuối cùng, xóa user document
    await deleteDoc(doc(db, "users", userId));
    console.log(`✓ Deleted user document`);

    // Lưu ý: Xóa user trong Firebase Auth cần Admin SDK
    // Có thể dùng script cleanupAuthUsers.js để xóa user trong Auth sau

    console.log(`✅ Successfully deleted user ${userId} and all related data`);
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteUser:", error);
    return { success: false, error: error.message };
  }
};

export const getUsersByDepartment = async (department: string) => {
  try {
    const q = query(collection(db, "users"), where("department", "==", department));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    return { success: true, data: users };
  } catch (error: any) {
    console.error("Error in getUsersByDepartment:", error);
    return { success: false, error: error.message };
  }
};

