import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const ChatBubble = React.memo(({ message, isOwn, previousMessage, showSenderName = false }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Tính thời gian cách nhau giữa 2 tin nhắn (phút)
  const getTimeDiffMinutes = () => {
    if (!previousMessage || !message.createdAt) return null;

    const currentTime = message.createdAt?.toDate
      ? message.createdAt.toDate()
      : new Date(message.createdAt);
    const previousTime = previousMessage.createdAt?.toDate
      ? previousMessage.createdAt.toDate()
      : new Date(previousMessage.createdAt);

    return (currentTime - previousTime) / (1000 * 60);
  };

  // Kiểm tra xem có cần hiển thị tên không (cho group chat)
  // Hiển thị tên nếu:
  // 1. Không có tin nhắn trước đó (tin nhắn đầu tiên)
  // 2. Tin nhắn trước đó là của người khác (bị cắt ngang)
  // 3. Tin nhắn cách nhau >= 30 phút
  const shouldShowSenderName = () => {
    if (!showSenderName) return false; // Chat 1-1 không hiển thị tên

    if (!previousMessage) return true; // Tin nhắn đầu tiên

    // Nếu tin nhắn trước đó là của người khác, hiển thị tên
    if (previousMessage.senderId !== message.senderId) return true;

    // Nếu cùng người gửi, kiểm tra thời gian cách nhau
    const diffMinutes = getTimeDiffMinutes();
    return diffMinutes !== null && diffMinutes >= 30; // Hiển thị nếu cách nhau >= 30 phút
  };

  // Kiểm tra xem có cần hiển thị time không
  // Hiển thị time nếu:
  // 1. Không có tin nhắn trước đó
  // 2. Tin nhắn trước đó là của người khác (khác sender)
  // 3. Tin nhắn cách nhau >= 30 phút
  const shouldShowTime = () => {
    if (!previousMessage) return true; // Tin nhắn đầu tiên luôn hiển thị time

    // Nếu tin nhắn trước đó là của người khác, hiển thị time
    if (previousMessage.senderId !== message.senderId) return true;

    // Nếu cùng người gửi, kiểm tra thời gian cách nhau
    const diffMinutes = getTimeDiffMinutes();
    return diffMinutes !== null && diffMinutes >= 30; // Hiển thị nếu cách nhau >= 30 phút
  };

  const showTime = shouldShowTime();
  const showName = shouldShowSenderName();

  return (
    <View
      style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}
    >
      {showName && !isOwn && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}

      {message.imageBase64 && (
        <Image
          source={{
            uri: `data:image/jpeg;base64,${message.imageBase64}`,
          }}
          style={styles.image}
        />
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

      {showTime && (
        <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>
          {formatTime(message.createdAt)}
        </Text>
      )}
    </View>
  );
});

ChatBubble.displayName = "ChatBubble";

export default ChatBubble;

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
    fontWeight: "600",
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

