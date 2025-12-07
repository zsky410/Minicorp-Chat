import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import { db } from "../firebase";

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "public" | "department";
  members: string[];
  managerId?: string;
  managerName?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const getAllDepartments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "departments"));
    const departments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Department[];

    return { success: true, data: departments };
  } catch (error: any) {
    console.error("Error getting departments:", error);
    return { success: false, error: error.message };
  }
};

export const getDepartmentById = async (deptId: string) => {
  try {
    const deptRef = doc(db, "departments", deptId);
    const deptDoc = await getDoc(deptRef);

    if (deptDoc.exists()) {
      return { success: true, data: { id: deptDoc.id, ...deptDoc.data() } as Department };
    } else {
      return { success: false, error: "Department not found" };
    }
  } catch (error: any) {
    console.error("Error getting department:", error);
    return { success: false, error: error.message };
  }
};

export const createDepartment = async (deptData: {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "public" | "department";
  managerId?: string;
  managerName?: string;
}) => {
  try {
    const deptRef = doc(db, "departments", deptData.id);

    // Tạo object data, loại bỏ undefined fields
    const data: any = {
      id: deptData.id,
      name: deptData.name,
      description: deptData.description,
      icon: deptData.icon,
      type: deptData.type,
      members: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Chỉ thêm managerId và managerName nếu có giá trị (không phải undefined)
    if (deptData.managerId) {
      data.managerId = deptData.managerId;
    }
    if (deptData.managerName) {
      data.managerName = deptData.managerName;
    }

    await setDoc(deptRef, data);

    return { success: true, data: { ...deptData, id: deptData.id } as Department };
  } catch (error: any) {
    console.error("Error creating department:", error);
    return { success: false, error: error.message };
  }
};

export const updateDepartment = async (deptId: string, data: Partial<Department>) => {
  try {
    const deptRef = doc(db, "departments", deptId);

    // Loại bỏ undefined fields và chỉ giữ lại các fields có giá trị
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Chỉ thêm các fields không phải undefined
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (value !== undefined) {
        // Nếu value là null hoặc empty string và là managerId/managerName, thì xóa field (dùng deleteField)
        if ((key === "managerId" || key === "managerName") && (value === null || value === "")) {
          updateData[key] = deleteField();
        } else {
          updateData[key] = value;
        }
      }
    });

    await updateDoc(deptRef, updateData);

    return { success: true };
  } catch (error: any) {
    console.error("Error updating department:", error);
    return { success: false, error: error.message };
  }
};

export const deleteDepartment = async (deptId: string) => {
  try {
    await deleteDoc(doc(db, "departments", deptId));
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting department:", error);
    return { success: false, error: error.message };
  }
};

