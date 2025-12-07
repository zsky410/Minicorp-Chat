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
import {
  subscribeToDepartmentMessages,
  sendDepartmentMessage,
} from "../../services/departmentService";
import {
  subscribeToPinnedMessages,
  pinMessage,
  unpinMessage,
} from "../../services/pinnedMessageService";
import { canPinMessage } from "../../services/permissionService";
import { uploadChatImage } from "../../services/storageService";
import ChatBubble from "../../components/ChatBubble";
import MessageInput from "../../components/MessageInput";
import PinnedMessageCard from "../../components/PinnedMessageCard";
import CreateTaskModal from "../../components/CreateTaskModal";
import CreatePollModal from "../../components/CreatePollModal";
import PollCard from "../../components/PollCard";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { canCreateTask, canCreatePoll } from "../../services/permissionService";
import { createTask } from "../../services/taskService";
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
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const flatListRef = useRef(null);

  const canPin = canPinMessage(user, departmentId);
  const canCreateTaskPerm = canCreateTask(user, departmentId);
  const canCreatePollPerm = canCreatePoll(user, departmentId);
  const isDirectorViewingOtherDept =
    user?.role === "director" && user?.department?.toLowerCase() !== deptName?.toLowerCase();

  // Setup header
  useEffect(() => {
    const isDirectorViewingOtherDept =
      user?.role === "director" && user?.department?.toLowerCase() !== deptName?.toLowerCase();

    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerContainer}>
          <Text style={styles.headerIcon}>{deptIcon || "📁"}</Text>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerName}>#{deptName}</Text>
            {isDirectorViewingOtherDept && (
              <View style={styles.directorBadge}>
                <Text style={styles.directorBadgeText}>Director</Text>
              </View>
            )}
          </View>
        </View>
      ),
      headerStyle: {
        backgroundColor: "#fff",
      },
    });
  }, [deptName, deptIcon, user?.role, user?.department, navigation]);

  // Subscribe to messages
  useEffect(() => {
    if (!departmentId || !user?.uid) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const unsubscribe = subscribeToDepartmentMessages(departmentId, (data) => {
      if (!isMounted) return;
      setMessages(data);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [departmentId, user?.uid]);

  // Subscribe to pinned messages
  useEffect(() => {
    if (!departmentId) return;

    const unsubscribe = subscribeToPinnedMessages(departmentId, (data) => {
      setPinnedMessages(data.slice(0, 5)); // Show max 5 pinned
    });

    return () => unsubscribe();
  }, [departmentId]);

  // Subscribe to polls
  useEffect(() => {
    if (!departmentId) return;

    const unsubscribe = subscribeToPolls(departmentId, (data) => {
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

  const handleCreateTask = async (taskData) => {
    const result = await createTask(departmentId, taskData);
    if (result.success) {
      Alert.alert("Thành công", "Đã tạo task");
      setShowTaskModal(false);
    } else {
      Alert.alert("Lỗi", result.error);
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
    return (
      <TouchableOpacity
        onLongPress={() => handleLongPressMessage(item)}
        activeOpacity={0.7}
      >
        <ChatBubble message={item} isOwn={isOwn} />
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

      {isDirectorViewingOtherDept && (
        <View style={styles.directorWarning}>
          <Ionicons name="information-circle" size={18} color="#FF9500" />
          <Text style={styles.directorWarningText}>
            Bạn đang xem với quyền Director (Read-only)
          </Text>
        </View>
      )}

      <MessageInput
        onSend={handleSendMessage}
        onImagePick={handleImagePick}
        disabled={isDirectorViewingOtherDept}
      />

      {/* FABs for Create Task and Poll */}
      {(canCreateTaskPerm || canCreatePollPerm) && (
        <View style={styles.fabContainer}>
          {canCreateTaskPerm && (
            <TouchableOpacity
              style={[styles.fab, styles.fabTask]}
              onPress={() => setShowTaskModal(true)}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          {canCreatePollPerm && (
            <TouchableOpacity
              style={[styles.fab, styles.fabPoll]}
              onPress={() => setShowPollModal(true)}
            >
              <Ionicons name="stats-chart" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <CreateTaskModal
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleCreateTask}
        departmentId={departmentId}
        currentUserId={user?.uid}
        currentUserName={user?.name}
      />

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
    backgroundColor: "#FF9500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  directorBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  directorWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9500",
  },
  directorWarningText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#FF9500",
    fontWeight: "500",
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
