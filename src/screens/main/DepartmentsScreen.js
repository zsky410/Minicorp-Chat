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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("my"); // "my" | "all" (for Director)

  const canViewAll = canViewAllDepartments(user);

  useEffect(() => {
    if (!user?.uid) {
      setDepartments([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const unsubscribe = subscribeToDepartments((allDepts) => {
      if (!isMounted) return;

      // Filter based on role and view mode
      let filteredDepts = [];

      if (canViewAll && viewMode === "all") {
        // Director/Admin viewing all departments
        filteredDepts = allDepts;
      } else {
        // Employee/Manager or Director viewing "My Dept"
        const userDepartment = user?.department;
        filteredDepts = allDepts.filter(
          (dept) =>
            dept.id === "general" ||
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
  }, [user?.uid, user?.department, canViewAll, viewMode]);

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
    const isDirector = user?.role === "director" && viewMode === "all" && item.name !== user?.department;

    return (
      <DepartmentCard
        department={item}
        onPress={() => handleDepartmentPress(item)}
        isManager={isManager}
        isDirector={isDirector}
      />
    );
  };

  if (loading) {
    return <LoadingScreen message="Đang tải phòng ban..." />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Toggle for Director */}
      {canViewAll && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              viewMode === "my" && styles.filterButtonActive,
            ]}
            onPress={() => setViewMode("my")}
          >
            <Text
              style={[
                styles.filterText,
                viewMode === "my" && styles.filterTextActive,
              ]}
            >
              Phòng ban của tôi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              viewMode === "all" && styles.filterButtonActive,
            ]}
            onPress={() => setViewMode("all")}
          >
            <Text
              style={[
                styles.filterText,
                viewMode === "all" && styles.filterTextActive,
              ]}
            >
              Tất cả phòng ban
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
              viewMode === "all"
                ? "Không có phòng ban nào trong hệ thống"
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
  filterContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  emptyContainer: {
    flexGrow: 1,
  },
});


