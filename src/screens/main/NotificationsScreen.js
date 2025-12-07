import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToAnnouncements,
  getUserAnnouncements,
  getUnreadCount,
  markAnnouncementAsRead,
} from "../../services/announcementService";
import { canCreateCompanyAnnouncement, canCreateAnnouncement } from "../../services/permissionService";
import AnnouncementCard from "../../components/AnnouncementCard";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";

export default function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [displayedAnnouncements, setDisplayedAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'
  const [unreadCount, setUnreadCount] = useState(0);

  // Detail modal
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const canCreateCompany = canCreateCompanyAnnouncement(user);
  const canCreateDept = canCreateAnnouncement(user, user?.department);

  useEffect(() => {
    if (!user?.uid || !user?.department) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToAnnouncements((data) => {
      // Filter announcements for user's department
      const userAnnouncements = getUserAnnouncements(data, user.department);
      setAllAnnouncements(userAnnouncements);

      // Calculate unread count
      const count = getUnreadCount(
        userAnnouncements,
        user.uid,
        user.department
      );
      setUnreadCount(count);

      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.department]);

  useEffect(() => {
    filterAnnouncements();
  }, [allAnnouncements, filter, user?.uid]);

  const filterAnnouncements = () => {
    if (filter === "all") {
      setDisplayedAnnouncements(allAnnouncements);
    } else {
      // Show only unread
      const unread = allAnnouncements.filter(
        (announcement) => !announcement.readBy?.includes(user?.uid)
      );
      setDisplayedAnnouncements(unread);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleAnnouncementPress = async (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetailModal(true);

    // Mark as read
    if (!announcement.readBy?.includes(user?.uid)) {
      await markAnnouncementAsRead(announcement.id, user.uid);
    }
  };

  const handleCreateAnnouncement = () => {
    if (user?.role !== "admin") {
      Alert.alert("Thông báo", "Chỉ Admin mới có quyền tạo thông báo");
      return;
    }
    navigation.navigate("CreateAnnouncement");
  };

  const renderAnnouncement = ({ item }) => (
    <AnnouncementCard
      announcement={item}
      userId={user?.uid}
      onPress={() => handleAnnouncementPress(item)}
    />
  );

  if (loading) {
    return <LoadingScreen message="Đang tải thông báo..." />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            Tất cả ({allAnnouncements.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "unread" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("unread")}
        >
          <View style={styles.filterWithBadge}>
            <Text
              style={[
                styles.filterText,
                filter === "unread" && styles.filterTextActive,
              ]}
            >
              Chưa đọc
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedAnnouncements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          displayedAnnouncements.length === 0 && styles.emptyContainer
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title={
              filter === "unread"
                ? "Không có thông báo chưa đọc"
                : "Chưa có thông báo nào"
            }
          />
        }
      />

      {/* FAB for Admin/Manager/Director */}
      {(canCreateCompany || canCreateDept) && (
        <TouchableOpacity style={styles.fab} onPress={handleCreateAnnouncement}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        {selectedAnnouncement && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={28} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chi tiết thông báo</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedAnnouncement.priority === "urgent" && (
                <View style={styles.urgentBanner}>
                  <Ionicons name="warning" size={20} color="#fff" />
                  <Text style={styles.urgentBannerText}>
                    THÔNG BÁO KHẨN CẤP
                  </Text>
                </View>
              )}

              <Text style={styles.detailTitle}>
                {selectedAnnouncement.title}
              </Text>

              <View style={styles.detailMeta}>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="person-circle-outline"
                    size={18}
                    color="#666"
                  />
                  <Text style={styles.metaText}>
                    {selectedAnnouncement.createdByName}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={18} color="#666" />
                  <Text style={styles.metaText}>
                    {selectedAnnouncement.createdAt?.toDate
                      ? selectedAnnouncement.createdAt.toDate().toLocaleString("vi-VN")
                      : "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.detailContent}>
                {selectedAnnouncement.content}
              </Text>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  filterWithBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
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
  modalContent: {
    flex: 1,
    padding: 20,
  },
  urgentBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  urgentBannerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },
  detailMeta: {
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  detailContent: {
    fontSize: 16,
    lineHeight: 26,
    color: "#333",
  },
});
