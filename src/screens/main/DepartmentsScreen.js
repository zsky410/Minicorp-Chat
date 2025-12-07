import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToDepartments,
  getUserDepartments,
} from "../../services/departmentService";
import { getAllUsers } from "../../services/userService";
import {
  canViewAllDepartments,
  isManagerOfDepartment,
  getRoleDisplayName,
} from "../../services/permissionService";
import DepartmentCard from "../../components/DepartmentCard";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";

export default function DepartmentsScreen({ navigation }) {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [departmentMemberCounts, setDepartmentMemberCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canViewAll = canViewAllDepartments(user);

  // Load users để tính số thành viên
  useEffect(() => {
    const loadUsers = async () => {
      const result = await getAllUsers();
      if (result.success && result.data) {
        // Tính số thành viên cho mỗi department
        const counts = {};
        result.data.forEach((u) => {
          if (u.department) {
            const deptKey = u.department.toLowerCase();
            if (!counts[deptKey]) {
              counts[deptKey] = 0;
            }
            counts[deptKey]++;
          }
        });
        setDepartmentMemberCounts(counts);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setDepartments([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const unsubscribe = subscribeToDepartments((allDepts) => {
      if (!isMounted) return;

      // Filter based on role
      let filteredDepts = [];

      if (canViewAll) {
        // Director: xem tất cả phòng ban (read-only)
        filteredDepts = allDepts;
      } else {
        // Employee/Manager: chỉ thấy phòng ban mình
        const userDepartment = user?.department;
        filteredDepts = allDepts.filter(
          (dept) =>
            dept.id === "general" ||
            dept.id === userDepartment?.toLowerCase() ||
            dept.name.toLowerCase() === userDepartment?.toLowerCase()
        );
      }

      setDepartments(filteredDepts);
      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.uid, user?.department, canViewAll]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Realtime listener will handle refresh automatically
  };

  const handleDepartmentPress = (department) => {
    navigation.navigate("DepartmentChat", {
      departmentId: department.id,
      deptName: department.name,
      deptIcon: department.icon,
    });
  };

  const renderDepartment = ({ item }) => {
    const isManager = isManagerOfDepartment(user, item.id);
    // Director xem tất cả phòng ban ở chế độ read-only
    const isDirectorReadOnly = user?.role === "director" && !isManager;

    // Tính số thành viên từ users collection
    const memberCount = departmentMemberCounts[item.id?.toLowerCase()] ||
                       departmentMemberCounts[item.name?.toLowerCase()] || 0;

    return (
      <DepartmentCard
        department={item}
        memberCount={memberCount}
        unreadCount={item.unreadCount?.[user?.uid] || 0}
        onPress={() => handleDepartmentPress(item)}
        isManager={isManager}
        isDirectorReadOnly={isDirectorReadOnly}
      />
    );
  };

  if (loading) {
    return <LoadingScreen message="Đang tải phòng ban..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={departments}
        renderItem={renderDepartment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          departments.length === 0 && styles.emptyContainer
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="business-outline"
            title="Chưa có phòng ban"
            subtitle={
              canViewAll
                ? "Không có phòng ban nào"
                : "Bạn chưa được thêm vào phòng ban nào"
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    flexGrow: 1,
  },
});


