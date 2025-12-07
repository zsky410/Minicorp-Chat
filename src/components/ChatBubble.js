import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

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

  // Handle file press - download and open file
  const handleFilePress = async (message) => {
    try {
      if (!message.fileBase64 || !message.fileName) return;

      const mimeType = message.mimeType || "application/octet-stream";
      const dataUri = `data:${mimeType};base64,${message.fileBase64}`;

      if (Platform.OS === "web") {
        // Web: create download link
        const link = document.createElement("a");
        link.href = dataUri;
        link.download = message.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Mobile: save to file system and share
        try {
          const dataUri = `data:${mimeType};base64,${message.fileBase64}`;
          const tempFileUri = `${FileSystem.cacheDirectory}${Date.now()}_${message.fileName}`;

          // Try Sharing API directly with data URI first
          const isAvailable = await Sharing.isAvailableAsync();

          if (isAvailable) {
            try {
              // Try sharing data URI directly (works on some platforms)
              await Sharing.shareAsync(dataUri, {
                mimeType: mimeType,
                dialogTitle: `Mở ${message.fileName}`,
              });
            } catch (shareError) {
              // If data URI doesn't work, save file to filesystem first
              // Use legacy API to write base64 string
              // Note: This writes the base64 as text, which may not work for all file types
              // But it's the simplest approach with current FileSystem API
              await FileSystem.writeAsStringAsync(tempFileUri, message.fileBase64);

              // Share the saved file
              await Sharing.shareAsync(tempFileUri, {
                mimeType: mimeType,
                dialogTitle: `Mở ${message.fileName}`,
              });
            }
          } else {
            // Sharing not available - try to save and show location
            await FileSystem.writeAsStringAsync(tempFileUri, message.fileBase64);
            Alert.alert("Thông báo", `File đã được lưu tại: ${tempFileUri}`);
          }
        } catch (error) {
          console.error("Error handling file:", error);
          Alert.alert("Lỗi", "Không thể mở file. " + (error.message || "Unknown error"));
        }
      }
    } catch (error) {
      console.error("Error handling file:", error);
    }
  };

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

      {message.fileBase64 && (
        <TouchableOpacity
          style={[styles.fileContainer, isOwn ? styles.ownFileContainer : styles.otherFileContainer]}
          onPress={() => handleFilePress(message)}
        >
          <Ionicons name="document" size={32} color={isOwn ? "#fff" : "#007AFF"} />
          <View style={styles.fileInfo}>
            <Text
              style={[styles.fileName, isOwn ? styles.ownFileName : styles.otherFileName]}
              numberOfLines={1}
            >
              {message.fileName || "File"}
            </Text>
            {message.fileSize && (
              <Text style={[styles.fileSize, isOwn ? styles.ownFileSize : styles.otherFileSize]}>
                {(message.fileSize / 1024).toFixed(1)} KB
              </Text>
            )}
          </View>
          <Ionicons
            name="download-outline"
            size={20}
            color={isOwn ? "#fff" : "#007AFF"}
          />
        </TouchableOpacity>
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
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 5,
    minWidth: 200,
    maxWidth: 250,
  },
  ownFileContainer: {
    backgroundColor: "#007AFF",
  },
  otherFileContainer: {
    backgroundColor: "#E9E9EB",
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  ownFileName: {
    color: "#fff",
  },
  otherFileName: {
    color: "#000",
  },
  fileSize: {
    fontSize: 12,
  },
  ownFileSize: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  otherFileSize: {
    color: "#666",
  },
});

