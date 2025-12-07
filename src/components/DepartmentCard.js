import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DepartmentCard({
  department,
  memberCount = 0,
  unreadCount = 0,
  onPress,
  isManager = false,
  isDirectorReadOnly = false
}) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins}p`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{department.icon || "📁"}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>#{department.name}</Text>
            {isManager && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>⭐ Quản lý</Text>
              </View>
            )}
            {isDirectorReadOnly && !isManager && (
              <View style={[styles.badge, styles.directorBadge]}>
                <Text style={styles.badgeText}>👁️ Chỉ xem</Text>
              </View>
            )}
          </View>
          {department.lastMessage && (
            <Text style={styles.time}>
              {formatTime(department.lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <Text style={styles.description} numberOfLines={1}>
          {department.description || "Không có mô tả"}
        </Text>

        {department.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {department.lastMessage.senderName}: {department.lastMessage.text}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.memberCount}>
            {memberCount} thành viên
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 30,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  directorBadge: {
    backgroundColor: "#FF9500",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  time: {
    fontSize: 13,
    color: "#999",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberCount: {
    fontSize: 12,
    color: "#999",
  },
  unreadBadge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

