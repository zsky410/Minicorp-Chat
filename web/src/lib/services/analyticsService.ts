import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  messagesToday: number;
  usersByDepartment: { department: string; count: number }[];
  usersByRole: { role: string; count: number }[];
}

export const getAnalytics = async () => {
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map((doc) => doc.data());

    // Get all departments
    const deptsSnapshot = await getDocs(collection(db, "departments"));
    const departments = deptsSnapshot.docs.map((doc) => doc.data());

    // Calculate stats
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "online").length;
    const totalDepartments = departments.length;

    // Count users by department
    const usersByDepartment: { [key: string]: number } = {};
    users.forEach((user) => {
      const dept = user.department || "Unknown";
      usersByDepartment[dept] = (usersByDepartment[dept] || 0) + 1;
    });

    // Count users by role
    const usersByRole: { [key: string]: number } = {};
    users.forEach((user) => {
      const role = user.role || "employee";
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });

    // Get messages today (approximate - count all messages)
    let messagesToday = 0;
    try {
      // Count messages from all departments
      for (const dept of departments) {
        const messagesRef = collection(db, "departments", dept.id || "", "messages");
        const messagesSnapshot = await getDocs(messagesRef);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        messagesSnapshot.docs.forEach((doc) => {
          const msg = doc.data();
          if (msg.createdAt) {
            const msgDate = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
            if (msgDate >= today) {
              messagesToday++;
            }
          }
        });
      }
    } catch (error) {
      console.error("Error counting messages:", error);
    }

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalDepartments,
        messagesToday,
        usersByDepartment: Object.entries(usersByDepartment).map(([department, count]) => ({
          department,
          count,
        })),
        usersByRole: Object.entries(usersByRole).map(([role, count]) => ({
          role,
          count,
        })),
      } as AnalyticsData,
    };
  } catch (error: any) {
    console.error("Error getting analytics:", error);
    return { success: false, error: error.message };
  }
};

