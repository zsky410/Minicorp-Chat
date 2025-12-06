import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/Avatar";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar uri={user?.avatar} name={user?.name} size={100} />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.department}>{user?.department}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phòng ban:</Text>
          <Text style={styles.infoValue}>{user?.department}</Text>
        </View>
        {user?.position && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chức vụ:</Text>
            <Text style={styles.infoValue}>{user.position}</Text>
          </View>
        )}
        {user?.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileHeader: {
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#000",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  department: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 5,
  },
  infoSection: {
    padding: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

