import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Avatar from "./Avatar";

export default function ConversationItem({
  conversation,
  currentUserId,
  onPress,
}) {
  // Get other user's info (for direct chats)
  const otherUserId = conversation.members?.find((id) => id !== currentUserId);
  const otherUser = conversation.memberDetails?.[otherUserId];

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

  const unreadCount = conversation.unreadCount?.[currentUserId] || 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Avatar
        uri={otherUser?.avatar}
        name={otherUser?.name}
        size={55}
        showOnline={true}
        isOnline={otherUser?.status === "online"}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {otherUser?.name || "Unknown"}
          </Text>
          <Text style={styles.time}>
            {formatTime(conversation.updatedAt)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage?.text || "Chưa có tin nhắn"}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
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
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  time: {
    fontSize: 13,
    color: "#999",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 15,
    color: "#666",
    flex: 1,
  },
  badge: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

