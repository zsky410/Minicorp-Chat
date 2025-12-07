import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToMessages,
  sendMessage,
  markAsRead,
  subscribeToTyping,
  updateTypingStatus,
} from "../../services/chatService";
import { getUserById } from "../../services/userService";
import { uploadChatImage } from "../../services/storageService";
import { auth } from "../../services/firebase";
import ChatBubble from "../../components/ChatBubble";
import MessageInput from "../../components/MessageInput";
import Avatar from "../../components/Avatar";
import TypingIndicator from "../../components/TypingIndicator";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import * as ImagePicker from "expo-image-picker";

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUserId, userName, userAvatar } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const flatListRef = useRef(null);

  // Fetch other user info
  useEffect(() => {
    if (otherUserId) {
      getUserById(otherUserId).then((result) => {
        if (result.success) {
          setOtherUser(result.data);
        } else {
          // Fallback to route params
          setOtherUser({
            id: otherUserId,
            name: userName || "Unknown",
            avatar: userAvatar || "",
            status: "offline",
          });
        }
      });
    }
  }, [otherUserId, userName, userAvatar]);

  // Setup header
  useEffect(() => {
    if (otherUser) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={styles.headerContainer}>
            <Avatar
              uri={otherUser.avatar}
              name={otherUser.name}
              size={35}
              showOnline={true}
              isOnline={otherUser.status === "online"}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerName}>{otherUser.name}</Text>
              <Text style={styles.headerStatus}>
                {otherUser.status === "online" ? "Đang hoạt động" : "Offline"}
              </Text>
            </View>
          </View>
        ),
        headerStyle: {
          backgroundColor: "#fff",
        },
      });
    }
  }, [otherUser, navigation]);

  useEffect(() => {
    if (!conversationId || !user?.uid) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Mark as read when entering chat
    markAsRead(conversationId, user.uid);

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(conversationId, (data) => {
      // Check if component is still mounted and user is still authenticated
      if (!isMounted || !auth.currentUser) return;

      setMessages(data);
      setLoading(false);

      // Scroll to bottom when new message arrives
      setTimeout(() => {
        if (flatListRef.current && isMounted) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }, 100);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [conversationId, user?.uid]);

  // Subscribe to typing status
  useEffect(() => {
    if (!conversationId || !otherUserId) return;

    const unsubscribe = subscribeToTyping(conversationId, (typingStatus) => {
      const otherUserTyping = typingStatus[otherUserId] || false;
      setIsOtherUserTyping(otherUserTyping);
    });

    return () => unsubscribe();
  }, [conversationId, otherUserId]);

  const handleSend = async (text) => {
    if (!text.trim() || !user?.uid) return;

    const senderData = {
      name: user.name,
      avatar: user.avatar,
    };

    await sendMessage(conversationId, user.uid, senderData, text);

    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTyping = (isTyping) => {
    if (conversationId && user?.uid) {
      updateTypingStatus(conversationId, user.uid, isTyping);
    }
  };

  const handleImagePick = async () => {
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
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);

        // Upload image
        const uploadResult = await uploadChatImage(result.assets[0].uri);

        if (uploadResult.success) {
          // Send message with image (base64)
          const senderData = {
            name: user.name,
            avatar: user.avatar,
          };
          await sendMessage(
            conversationId,
            user.uid,
            senderData,
            "",
            uploadResult.data // This is now base64 string
          );
        } else {
          Alert.alert("Lỗi", uploadResult.error || "Không thể xử lý ảnh");
        }

        setUploading(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setUploading(false);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi chọn ảnh");
    }
  };

  // Render date separator
  const renderDateSeparator = (currentMsg, previousMsg) => {
    if (!currentMsg?.createdAt) return null;

    const currentDate = currentMsg.createdAt.toDate
      ? currentMsg.createdAt.toDate()
      : new Date(currentMsg.createdAt);
    const previousDate = previousMsg?.createdAt
      ? previousMsg.createdAt.toDate
        ? previousMsg.createdAt.toDate()
        : new Date(previousMsg.createdAt)
      : null;

    const isSameDay =
      previousDate &&
      currentDate.toDateString() === previousDate.toDateString();

    if (!previousMsg || !isSameDay) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateText;
      if (currentDate.toDateString() === today.toDateString()) {
        dateText = "Hôm nay";
      } else if (currentDate.toDateString() === yesterday.toDateString()) {
        dateText = "Hôm qua";
      } else {
        dateText = currentDate.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      return (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>{dateText}</Text>
        </View>
      );
    }
    return null;
  };

  const renderMessage = ({ item, index }) => {
    const isOwn = item.senderId === user?.uid;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    return (
      <View>
        {renderDateSeparator(item, previousMessage)}
        <ChatBubble message={item} isOwn={isOwn} previousMessage={previousMessage} />
      </View>
    );
  };

  if (loading || !user?.uid) {
    return <LoadingScreen message="Đang tải tin nhắn..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        initialNumToRender={20}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        onLayout={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.uploadingText}>Đang tải ảnh...</Text>
        </View>
      )}

      {isOtherUserTyping && (
        <TypingIndicator userName={otherUser?.name || userName || "Ai đó"} />
      )}

      <MessageInput
        onSend={handleSend}
        onImagePick={handleImagePick}
        onTyping={handleTyping}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    padding: 15,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerText: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  headerStatus: {
    fontSize: 12,
    color: "#666",
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 10,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  uploadingText: {
    marginLeft: 10,
    color: "#666",
    fontSize: 14,
  },
});

