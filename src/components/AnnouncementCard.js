import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AnnouncementCard({ announcement, userId, onPress }) {
  const isRead = announcement.readBy?.includes(userId);
  const isUrgent = announcement.priority === "urgent";

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isUrgent && styles.urgentContainer,
        isRead && styles.readContainer,
      ]}
      onPress={onPress}
    >
      {/* Priority and Scope Badges */}
      <View style={styles.badgeRow}>
        {isUrgent && (
          <View style={styles.urgentBadge}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={styles.urgentText}>KHẨN CẤP</Text>
          </View>
        )}
        {announcement.scope === "company" && (
          <View style={styles.companyBadge}>
            <Ionicons name="business" size={14} color="#fff" />
            <Text style={styles.companyText}>TOÀN CÔNG TY</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text
        style={[styles.title, isRead && styles.readTitle]}
        numberOfLines={2}
      >
        {announcement.title}
      </Text>

      {/* Content Preview */}
      <Text style={styles.content} numberOfLines={2}>
        {announcement.content}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.authorContainer}>
          <Ionicons name="person-circle-outline" size={16} color="#999" />
          <Text style={styles.author}>{announcement.createdByName}</Text>
        </View>

        <View style={styles.rightFooter}>
          <Text style={styles.time}>{formatTime(announcement.createdAt)}</Text>
          {isRead && (
            <View style={styles.readBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#4CD964" />
              <Text style={styles.readText}>Đã đọc</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urgentContainer: {
    borderColor: "#FF3B30",
    borderWidth: 2,
    backgroundColor: "#FFF5F5",
  },
  readContainer: {
    opacity: 0.7,
    backgroundColor: "#f9f9f9",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgentText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  companyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5856D6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  companyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  readTitle: {
    color: "#666",
  },
  content: {
    fontSize: 15,
    color: "#666",
    marginBottom: 12,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  author: {
    fontSize: 13,
    color: "#999",
    marginLeft: 5,
  },
  rightFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  readBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  readText: {
    fontSize: 11,
    color: "#4CD964",
    marginLeft: 3,
  },
});

