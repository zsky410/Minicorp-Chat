import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function ChatBubble({ message, isOwn }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}
    >
      {!isOwn && <Text style={styles.senderName}>{message.senderName}</Text>}

      {message.imageUrl && (
        <Image source={{ uri: message.imageUrl }} style={styles.image} />
      )}

      {message.text && (
        <View
          style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}
        >
          <Text
            style={[styles.text, isOwn ? styles.ownText : styles.otherText]}
          >
            {message.text}
          </Text>
        </View>
      )}

      <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    maxWidth: "75%",
  },
  ownContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    marginLeft: 10,
  },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: "100%",
  },
  ownBubble: {
    backgroundColor: "#007AFF",
  },
  otherBubble: {
    backgroundColor: "#E9E9EB",
  },
  text: {
    fontSize: 16,
  },
  ownText: {
    color: "#fff",
  },
  otherText: {
    color: "#000",
  },
  time: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  ownTime: {
    marginRight: 10,
  },
  otherTime: {
    marginLeft: 10,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
});

