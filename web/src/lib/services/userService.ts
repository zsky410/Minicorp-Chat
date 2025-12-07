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

export const deleteUser = async (userId: string) => {
  try {
    // Xóa user document trong Firestore
    await deleteDoc(doc(db, "users", userId));

    // Xóa user trong Firebase Auth (cần admin privileges)
    // Vì client-side không thể xóa user trong Auth trực tiếp,
    // chúng ta sẽ gọi một Cloud Function hoặc sử dụng Admin SDK
    // Tạm thời, user sẽ được xóa khỏi Firestore, nhưng vẫn tồn tại trong Auth
    // Để xóa hoàn toàn, cần setup Cloud Function hoặc sử dụng Admin SDK

    // TODO: Implement Cloud Function để xóa user trong Auth
    // Hoặc sử dụng Admin SDK từ server-side

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

