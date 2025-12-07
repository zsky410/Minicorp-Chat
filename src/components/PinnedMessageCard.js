import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PinnedMessageCard({ pinnedMessage, onPress, onUnpin, canUnpin = false }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="pin" size={16} color="#FF9500" />
      </View>
      <View style={styles.content}>
        <Text style={styles.senderName}>{pinnedMessage.senderName}</Text>
        <Text style={styles.messageText} numberOfLines={2}>
          {pinnedMessage.messageText}
        </Text>
      </View>
      {canUnpin && (
        <TouchableOpacity style={styles.unpinButton} onPress={onUnpin}>
          <Ionicons name="close" size={18} color="#999" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFF9E6",
    padding: 12,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9500",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  senderName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: "#666",
  },
  unpinButton: {
    padding: 4,
  },
});

