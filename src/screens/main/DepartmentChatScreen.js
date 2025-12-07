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
  ActionSheetIOS,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../services/firebase";
import {
  subscribeToDepartmentMessages,
  sendDepartmentMessage,
  markDepartmentAsRead,
} from "../../services/departmentService";
import {
  subscribeToPinnedMessages,
  pinMessage,
  unpinMessage,
} from "../../services/pinnedMessageService";
import {
  canPinMessage,
  canChatInDepartment,
  canCreatePoll,
} from "../../services/permissionService";
import { uploadChatImage } from "../../services/storageService";
import ChatBubble from "../../components/ChatBubble";
import MessageInput from "../../components/MessageInput";
import PinnedMessageCard from "../../components/PinnedMessageCard";
import CreatePollModal from "../../components/CreatePollModal";
import PollCard from "../../components/PollCard";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { createPoll, votePoll, subscribeToPolls } from "../../services/pollService";
import * as ImagePicker from "expo-image-picker";

export default function DepartmentChatScreen({ route, navigation }) {
  const { departmentId, deptName, deptIcon } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const flatListRef = useRef(null);

  const canPin = canPinMessage(user, departmentId);
  const canCreatePollPerm = canCreatePoll(user, departmentId);
  const canChat = canChatInDepartment(user, departmentId);
  // Director không thể chat trong bất kỳ phòng ban nào (chỉ xem read-only)
  const isDirectorReadOnly = user?.role === "director";

  // Setup header
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerContainer}>
          <Text style={styles.headerIcon}>{deptIcon || "📁"}</Text>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerName}>#{deptName}</Text>
            {isDirectorReadOnly && (
              <View style={styles.directorBadge}>
                <Ionicons name="eye-outline" size={14} color="#5856D6" />
                <Text style={styles.directorBadgeText}>Xem</Text>
              </View>
            )}
          </View>
        </View>
      ),
      headerStyle: {
        backgroundColor: "#fff",
      },
    });
  }, [deptName, deptIcon, isDirectorReadOnly, navigation]);

  // Subscribe to messages and mark as read
  useEffect(() => {
    if (!departmentId || !user?.uid) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Mark as read when entering department chat
    markDepartmentAsRead(departmentId, user.uid);

    const unsubscribe = subscribeToDepartmentMessages(departmentId, (data) => {
      if (!isMounted) return;
      setMessages(data);
      setLoading(false);

      // Mark as read when new messages arrive (user is viewing)
      if (data.length > 0) {
        markDepartmentAsRead(departmentId, user.uid);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [departmentId, user?.uid]);

  // Subscribe to pinned messages
  useEffect(() => {
    if (!departmentId) return;

    // Kiểm tra user đã authenticated trước khi subscribe
    if (!auth.currentUser) {
      setPinnedMessages([]);
      return;
    }

    const unsubscribe = subscribeToPinnedMessages(departmentId, (data) => {
      // Kiểm tra lại user vẫn authenticated khi nhận data
      if (!auth.currentUser) {
        setPinnedMessages([]);
        return;
      }
      setPinnedMessages(data.slice(0, 5)); // Show max 5 pinned
    });

    return () => unsubscribe();
  }, [departmentId]);

  // Subscribe to polls
  useEffect(() => {
    if (!departmentId) return;

    // Kiểm tra user đã authenticated trước khi subscribe
    if (!auth.currentUser) {
      setPolls([]);
      return;
    }

    const unsubscribe = subscribeToPolls(departmentId, (data) => {
      // Kiểm tra lại user vẫn authenticated khi nhận data
      if (!auth.currentUser) {
        setPolls([]);
        return;
      }
      setPolls(data);
    });

    return () => unsubscribe();
  }, [departmentId]);

  // Scroll to bottom when new message
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (text) => {
    // Director không thể chat (read-only mode)
    if (!canChat || isDirectorReadOnly) {
      return;
    }

    if (!text.trim() || !user?.uid) return;

    const result = await sendDepartmentMessage(
      departmentId,
      user.uid,
      {
        name: user.name,
        avatar: user.avatar,
        department: user.department,
      },
      text
    );

    if (!result.success) {
      Alert.alert("Lỗi", "Không thể gửi tin nhắn");
    }
  };

  const handleImagePick = async () => {
    // Director không thể gửi ảnh (read-only mode)
    if (!canChat || isDirectorReadOnly) {
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Cần quyền", "Vui lòng cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);
        const uploadResult = await uploadChatImage(result.assets[0].uri);

        if (uploadResult.success) {
          await sendDepartmentMessage(
            departmentId,
            user.uid,
            {
              name: user.name,
              avatar: user.avatar,
              department: user.department,
            },
            "",
            uploadResult.data
          );
        } else {
          Alert.alert("Lỗi", uploadResult.error);
        }
        setUploading(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setUploading(false);
    }
  };

  const handleLongPressMessage = (message) => {
    if (!canPin) return;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Pin"],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handlePinMessage(message);
          }
        }
      );
    } else {
      Alert.alert("Pin message", "Bạn muốn pin tin nhắn này?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Pin",
          onPress: () => handlePinMessage(message),
        },
      ]);
    }
  };

  const handlePinMessage = async (message) => {
    const result = await pinMessage(departmentId, message.id, {
      text: message.text || "",
      senderName: message.senderName || "",
      senderId: message.senderId || "",
      pinnedBy: user.uid,
    });

    if (result.success) {
      Alert.alert("Thành công", "Đã pin tin nhắn");
    } else {
      Alert.alert("Lỗi", result.error);
    }
  };

  const handleUnpinMessage = async (pinId) => {
    Alert.alert("Bỏ pin", "Bạn có chắc muốn bỏ pin tin nhắn này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Bỏ pin",
        onPress: async () => {
          const result = await unpinMessage(pinId);
          if (!result.success) {
            Alert.alert("Lỗi", result.error);
          }
        },
      },
    ]);
  };

  const handlePinnedPress = (pinned) => {
    // Scroll to message
    const messageIndex = messages.findIndex((m) => m.id === pinned.messageId);
    if (messageIndex >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: messageIndex, animated: true });
    }
  };


  const handleCreatePoll = async (pollData) => {
    const result = await createPoll(departmentId, pollData);
    if (result.success) {
      Alert.alert("Thành công", "Đã tạo poll");
      setShowPollModal(false);
    } else {
      Alert.alert("Lỗi", result.error);
    }
  };

  const handleVotePoll = async (pollId, optionId) => {
    // Director không thể vote
    if (isDirectorReadOnly) {
      return;
    }

    const result = await votePoll(pollId, optionId, user.uid);
    if (!result.success) {
      Alert.alert("Lỗi", result.error);
    }
  };

  const renderMessage = ({ item, index }) => {
    // Check if there's a poll before this message
    const pollBefore = polls.find((poll) => {
      // Simple check: if poll was created around the same time as message
      // In real implementation, you'd want to integrate polls into messages array
      return false; // Simplified for now
    });

    const isOwn = item.senderId === user?.uid;
    const previousMessage = index > 0 ? messages[index - 1] : null;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPressMessage(item)}
        activeOpacity={0.7}
      >
        <ChatBubble
          message={item}
          isOwn={isOwn}
          previousMessage={previousMessage}
          showSenderName={true}
        />
      </TouchableOpacity>
    );
  };

  // Render polls separately (they're not in messages array)
  const renderPoll = (poll) => (
    <PollCard
      key={poll.id}
      poll={poll}
      onVote={handleVotePoll}
      currentUserId={user?.uid}
      canVote={!isDirectorReadOnly} // Director không thể vote
    />
  );

  if (loading) {
    return <LoadingScreen message="Đang tải tin nhắn..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Display polls */}
      {polls.length > 0 && (
        <View style={styles.pollsContainer}>
          {polls.map(renderPoll)}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesContainer,
          messages.length === 0 && styles.emptyContainer,
        ]}
        ListHeaderComponent={
          pinnedMessages.length > 0 ? (
            <View>
              {pinnedMessages.map((pinned) => (
                <PinnedMessageCard
                  key={pinned.id}
                  pinnedMessage={pinned}
                  onPress={() => handlePinnedPress(pinned)}
                  onUnpin={() => handleUnpinMessage(pinned.id)}
                  canUnpin={canPin}
                />
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-outline"
            title="Chưa có tin nhắn"
            subtitle="Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn"
          />
        }
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

      {/* Director Read-only Banner */}
      {isDirectorReadOnly && (
        <View style={styles.directorWarning}>
          <Ionicons name="eye-outline" size={18} color="#5856D6" />
          <Text style={styles.directorWarningText}>
            Chế độ chỉ xem
          </Text>
        </View>
      )}

      {/* MessageInput - chỉ hiển thị khi không phải read-only */}
      {!isDirectorReadOnly && canChat && (
        <MessageInput
          onSend={handleSendMessage}
          onImagePick={handleImagePick}
          disabled={false}
          placeholder="Nhập tin nhắn..."
        />
      )}

      {/* FAB for Create Poll (chỉ Manager) */}
      {canCreatePollPerm && !isDirectorReadOnly && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, styles.fabPoll]}
            onPress={() => setShowPollModal(true)}
          >
            <Ionicons name="stats-chart" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <CreatePollModal
        visible={showPollModal}
        onClose={() => setShowPollModal(false)}
        onSubmit={handleCreatePoll}
        currentUserId={user?.uid}
        currentUserName={user?.name}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  directorBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  directorBadgeText: {
    color: "#5856D6",
    fontSize: 11,
    fontWeight: "600",
  },
  directorWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8FF",
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#5856D6",
  },
  directorWarningText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#5856D6",
    fontWeight: "500",
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  uploadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 90,
    gap: 10,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabTask: {
    backgroundColor: "#007AFF",
  },
  fabPoll: {
    backgroundColor: "#5856D6",
  },
  pollsContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
});
