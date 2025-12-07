import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToConversations,
  searchUsers,
  getOrCreateConversation,
} from "../../services/chatService";
import { auth } from "../../services/firebase";
import ConversationItem from "../../components/ConversationItem";
import UserListItem from "../../components/UserListItem";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search modal
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const unsubscribe = subscribeToConversations(user.uid, (data) => {
      // Check if component is still mounted and user is still authenticated
      if (!isMounted || !auth.currentUser) return;

      // Chỉ hiển thị chat 1-1 (type: "direct"), bỏ group chat và department chat
      const directConversations = data.filter(
        (conv) => conv.type === "direct" && conv.members?.length === 2
      );

      setConversations(directConversations);
      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.uid]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Firestore realtime listener will handle refresh automatically
  };

  const handleSearchUsers = async () => {
    if (searchQuery.trim().length < 2 || !user?.uid) return;

    setSearching(true);
    const result = await searchUsers(searchQuery, user.uid);
    setSearching(false);

    if (result.success) {
      setSearchResults(result.data);
    }
  };

  const handleStartChat = useCallback(
    async (otherUser) => {
      if (!user?.uid) {
        console.error("User not authenticated");
        return;
      }

      setShowSearchModal(false);
      setSearchQuery("");
      setSearchResults([]);

      // Get or create conversation
      const result = await getOrCreateConversation(
        user.uid,
        otherUser.id,
        otherUser,
        user // Pass current user data
      );

      if (result.success) {
        navigation.navigate("Chat", {
          conversationId: result.data.id,
          otherUserId: otherUser.id,
          userName: otherUser.name,
          userAvatar: otherUser.avatar,
        });
      } else {
        console.error("Failed to create conversation:", result.error);
        // You can add Alert here to show error to user
      }
    },
    [user, navigation]
  );

  const renderConversation = useCallback(
    ({ item }) => {
      if (!user?.uid) return null;

      return (
        <ConversationItem
          conversation={item}
          currentUserId={user.uid}
          onPress={() => {
            const otherUserId = item.members.find((id) => id !== user.uid);
            const otherUser = item.memberDetails[otherUserId];

            navigation.navigate("Chat", {
              conversationId: item.id,
              otherUserId,
              userName: otherUser?.name,
              userAvatar: otherUser?.avatar,
            });
          }}
        />
      );
    },
    [user?.uid, navigation]
  );

  const renderSearchResult = useCallback(
    ({ item }) => (
      <UserListItem user={item} onPress={() => handleStartChat(item)} />
    ),
    [handleStartChat]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading || !user?.uid) {
    return <LoadingScreen message="Đang tải cuộc trò chuyện..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={keyExtractor}
        contentContainerStyle={
          conversations.length === 0 && styles.emptyContainer
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        initialNumToRender={15}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="Chưa có cuộc trò chuyện"
            subtitle="Nhấn nút + để bắt đầu chat"
          />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowSearchModal(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Ionicons name="close" size={28} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tìm người để chat</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchUsers}
              autoFocus
            />
          </View>

          {searching ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              contentContainerStyle={
                searchResults.length === 0 && styles.emptyContainer
              }
              ListEmptyComponent={
                searchQuery.length >= 2 && (
                  <EmptyState
                    icon="search-outline"
                    title="Không tìm thấy kết quả"
                    subtitle="Thử tìm kiếm với từ khóa khác"
                  />
                )
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyContainer: {
    flexGrow: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});

