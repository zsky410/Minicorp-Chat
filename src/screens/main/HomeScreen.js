import React, { useState, useEffect } from "react";
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

      setConversations(data);
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

  const handleStartChat = async (otherUser) => {
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
  };

  const renderConversation = ({ item }) => {
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
  };

  const renderSearchResult = ({ item }) => (
    <UserListItem user={item} onPress={() => handleStartChat(item)} />
  );

  if (loading || !user?.uid) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          conversations.length === 0 && styles.emptyContainer
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện</Text>
            <Text style={styles.emptySubtext}>
              Nhấn nút + để bắt đầu chat
            </Text>
          </View>
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
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
                  </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 20,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
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

