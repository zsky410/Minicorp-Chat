import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { uploadAvatar } from "../../services/userService";
import { getRoleDisplayName } from "../../services/permissionService";
import Avatar from "../../components/Avatar";

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert("Lỗi", result.error);
            }
          },
        },
      ]
    );
  };

  const MenuButton = ({ icon, title, onPress, color = "#000", showBadge = false }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.menuText, { color }]}>{title}</Text>
      </View>
      <View style={styles.menuRight}>
        {showBadge && <View style={styles.badge} />}
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const handleUploadAvatar = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền truy cập thư viện ảnh"
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square for avatar
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);

        // Upload avatar
        const uploadResult = await uploadAvatar(user.uid, result.assets[0].uri);

        if (uploadResult.success) {
          // Refresh user data to get new avatar
          if (refreshUser) {
            await refreshUser();
          }
          Alert.alert("Thành công", "Đã cập nhật ảnh đại diện");
        } else {
          Alert.alert("Lỗi", uploadResult.error || "Không thể cập nhật ảnh đại diện");
        }

        setUploading(false);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setUploading(false);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi chọn ảnh");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleUploadAvatar}
          disabled={uploading}
        >
          <Avatar
            uri={user?.avatar}
            name={user?.name}
            size={100}
            showOnline={true}
            isOnline={user?.status === "online"}
          />
          {uploading ? (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.badgeContainer}>
          {user?.role && user?.role !== "admin" && (
            <View
              style={[
                styles.infoBadge,
                user?.role === "director" && styles.directorBadge,
                user?.role === "manager" && styles.managerBadge,
              ]}
            >
              <Text style={styles.badgeText}>
                {getRoleDisplayName(user.role)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Chỉnh sửa profile</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin</Text>
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{user?.email || "Chưa cập nhật"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="business-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{user?.department || "Chưa cập nhật"}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{user?.phone || "Chưa cập nhật"}</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <MenuButton
          icon="notifications-outline"
          title="Thông báo"
          onPress={() => Alert.alert("Thông báo", "Tính năng đang phát triển")}
        />
        <MenuButton
          icon="lock-closed-outline"
          title="Đổi mật khẩu"
          onPress={() => Alert.alert("Đổi mật khẩu", "Tính năng đang phát triển")}
        />
        <MenuButton
          icon="moon-outline"
          title="Giao diện tối"
          onPress={() => Alert.alert("Dark Mode", "Tính năng đang phát triển")}
        />
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Về ứng dụng</Text>
        <MenuButton
          icon="information-circle-outline"
          title="Giới thiệu"
          onPress={() =>
            Alert.alert(
              "MiniCorp Chat",
              "Version 1.0.0\n\nApp chat nội bộ công ty"
            )
          }
        />
        <MenuButton
          icon="document-text-outline"
          title="Điều khoản sử dụng"
          onPress={() => Alert.alert("Điều khoản", "Tính năng đang phát triển")}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>MiniCorp Chat v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#000",
  },
  email: {
    fontSize: 15,
    color: "#666",
    marginTop: 5,
  },
  badgeContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  infoBadge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: "#FF3B30",
  },
  directorBadge: {
    backgroundColor: "#FF9500",
  },
  managerBadge: {
    backgroundColor: "#007AFF",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 15,
    paddingBottom: 10,
    textTransform: "uppercase",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  menuButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
    marginLeft: 10,
  },
  footer: {
    alignItems: "center",
    padding: 30,
  },
  footerText: {
    fontSize: 13,
    color: "#999",
  },
});

