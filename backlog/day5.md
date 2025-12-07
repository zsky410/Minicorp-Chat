# 📅 **NGÀY 5: ANNOUNCEMENTS & PROFILE**

---

## 🎯 Mục tiêu Ngày 5

- Hệ thống thông báo nội bộ (Announcements)
- Admin có thể tạo thông báo
- Màn hình Profile với edit profile
- Upload avatar
- Settings & Logout

---

## **Task 5.1: Announcement Service (1h)**

**Prompt cho Cursor:**

```
Tạo src/services/announcementService.js với functions:

1. createAnnouncement(data): Tạo thông báo mới (admin only)
2. getAllAnnouncements(): Lấy tất cả thông báo
3. getAnnouncementById(id): Lấy 1 thông báo
4. subscribeToAnnouncements(callback): Realtime listener
5. markAnnouncementAsRead(announcementId, userId): Đánh dấu đã đọc
6. deleteAnnouncement(announcementId): Xóa thông báo (admin only)
7. getUnreadCount(userId): Đếm số thông báo chưa đọc

Return format: { success, data, error }
```

**Code: `src/services/announcementService.js`**

```javascript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";

// Create announcement (Admin only)
export const createAnnouncement = async (creatorId, creatorName, data) => {
  try {
    const announcementRef = collection(db, "announcements");

    const newAnnouncement = {
      title: data.title,
      content: data.content,
      priority: data.priority || "normal", // normal | urgent
      createdBy: creatorId,
      createdByName: creatorName,
      targetDepartments: data.targetDepartments || [], // Empty = all
      readBy: [],
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(announcementRef, newAnnouncement);

    return { success: true, data: { id: docRef.id, ...newAnnouncement } };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { success: false, error: error.message };
  }
};

// Get all announcements
export const getAllAnnouncements = async () => {
  try {
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const announcements = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: announcements };
  } catch (error) {
    console.error("Error getting announcements:", error);
    return { success: false, error: error.message };
  }
};

// Get announcement by ID
export const getAnnouncementById = async (announcementId) => {
  try {
    const docRef = doc(db, "announcements", announcementId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Announcement not found" };
    }
  } catch (error) {
    console.error("Error getting announcement:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to announcements (realtime)
export const subscribeToAnnouncements = (callback) => {
  const q = query(
    collection(db, "announcements"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const announcements = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(announcements);
    },
    (error) => {
      console.error("Error subscribing to announcements:", error);
    }
  );
};

// Mark announcement as read
export const markAnnouncementAsRead = async (announcementId, userId) => {
  try {
    const docRef = doc(db, "announcements", announcementId);
    await updateDoc(docRef, {
      readBy: arrayUnion(userId),
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking announcement as read:", error);
    return { success: false, error: error.message };
  }
};

// Delete announcement (Admin only)
export const deleteAnnouncement = async (announcementId) => {
  try {
    const docRef = doc(db, "announcements", announcementId);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: error.message };
  }
};

// Get unread count for user
export const getUnreadCount = (announcements, userId, userDepartment) => {
  return announcements.filter((announcement) => {
    // Check if user has read it
    if (announcement.readBy?.includes(userId)) {
      return false;
    }

    // Check if announcement is for user's department
    const targets = announcement.targetDepartments || [];
    if (targets.length === 0) {
      // No target = for everyone
      return true;
    }

    // Check if user's department is in targets
    return targets.includes(userDepartment);
  }).length;
};

// Get announcements for user's department
export const getUserAnnouncements = (announcements, userDepartment) => {
  return announcements.filter((announcement) => {
    const targets = announcement.targetDepartments || [];

    // No target = for everyone
    if (targets.length === 0) return true;

    // Check if user's department is in targets
    return targets.includes(userDepartment);
  });
};
```

---

## **Task 5.2: AnnouncementCard Component (30 phút)**

**Prompt cho Cursor:**

```
Tạo src/components/AnnouncementCard.js:

Component hiển thị announcement trong list:
- Props: announcement, userId, onPress
- Show: priority badge (urgent = red), title, content preview, author, time
- Show "đã đọc" badge nếu user đã đọc
- Urgent announcements có border đỏ

Style đẹp, clear hierarchy
```

**Code: `src/components/AnnouncementCard.js`**

```javascript
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AnnouncementCard({ announcement, userId, onPress }) {
  const isRead = announcement.readBy?.includes(userId);
  const isUrgent = announcement.priority === "urgent";

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isUrgent && styles.urgentContainer,
        isRead && styles.readContainer,
      ]}
      onPress={onPress}
    >
      {/* Priority Badge */}
      {isUrgent && (
        <View style={styles.urgentBadge}>
          <Ionicons name="warning" size={16} color="#fff" />
          <Text style={styles.urgentText}>KHẨN CẤP</Text>
        </View>
      )}

      {/* Title */}
      <Text
        style={[styles.title, isRead && styles.readTitle]}
        numberOfLines={2}
      >
        {announcement.title}
      </Text>

      {/* Content Preview */}
      <Text style={styles.content} numberOfLines={2}>
        {announcement.content}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.authorContainer}>
          <Ionicons name="person-circle-outline" size={16} color="#999" />
          <Text style={styles.author}>{announcement.createdByName}</Text>
        </View>

        <View style={styles.rightFooter}>
          <Text style={styles.time}>{formatTime(announcement.createdAt)}</Text>
          {isRead && (
            <View style={styles.readBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#4CD964" />
              <Text style={styles.readText}>Đã đọc</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urgentContainer: {
    borderColor: "#FF3B30",
    borderWidth: 2,
    backgroundColor: "#FFF5F5",
  },
  readContainer: {
    opacity: 0.7,
    backgroundColor: "#f9f9f9",
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  urgentText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  readTitle: {
    color: "#666",
  },
  content: {
    fontSize: 15,
    color: "#666",
    marginBottom: 12,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  author: {
    fontSize: 13,
    color: "#999",
    marginLeft: 5,
  },
  rightFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  readBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  readText: {
    fontSize: 11,
    color: "#4CD964",
    marginLeft: 3,
  },
});
```

---

## **Task 5.3: NotificationsScreen (1.5h)**

**Prompt cho Cursor:**

```
Tạo src/screens/main/NotificationsScreen.js:

Features:
1. Hiển thị danh sách announcements realtime
2. Filter: "Tất cả" vs "Chưa đọc"
3. Badge hiển thị số thông báo chưa đọc
4. Tap vào announcement → màn hình detail, mark as read
5. FAB button cho Admin tạo thông báo mới
6. Pull to refresh
7. Empty states

Dùng AnnouncementCard component
```

**Code: `src/screens/main/NotificationsScreen.js`**

```javascript
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
import AnnouncementCard from "../../components/AnnouncementCard";

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

  useEffect(() => {
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
  }, [user.uid, user.department]);

  useEffect(() => {
    filterAnnouncements();
  }, [allAnnouncements, filter, user.uid]);

  const filterAnnouncements = () => {
    if (filter === "all") {
      setDisplayedAnnouncements(allAnnouncements);
    } else {
      // Show only unread
      const unread = allAnnouncements.filter(
        (announcement) => !announcement.readBy?.includes(user.uid)
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
    if (!announcement.readBy?.includes(user.uid)) {
      await markAnnouncementAsRead(announcement.id, user.uid);
    }
  };

  const handleCreateAnnouncement = () => {
    if (user.role !== "admin") {
      Alert.alert("Thông báo", "Chỉ Admin mới có quyền tạo thông báo");
      return;
    }
    navigation.navigate("CreateAnnouncement");
  };

  const renderAnnouncement = ({ item }) => (
    <AnnouncementCard
      announcement={item}
      userId={user.uid}
      onPress={() => handleAnnouncementPress(item)}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
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
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              {filter === "unread"
                ? "Không có thông báo chưa đọc"
                : "Chưa có thông báo nào"}
            </Text>
          </View>
        }
      />

      {/* FAB for Admin */}
      {user.role === "admin" && (
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
                    {selectedAnnouncement.createdAt
                      ?.toDate?.()
                      .toLocaleString("vi-VN")}
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 20,
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
```

---

## **Task 5.4: CreateAnnouncementScreen (Admin) (1h)**

**Prompt cho Cursor:**

```
Tạo src/screens/admin/CreateAnnouncementScreen.js:

Features:
1. Form để tạo announcement
2. Fields: Title, Content, Priority (normal/urgent)
3. Target departments (optional, empty = all)
4. Preview button
5. Submit button
6. Validation

Chỉ admin mới access được (check trong screen)
```

**Code: `src/screens/admin/CreateAnnouncementScreen.js`**

```javascript
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { createAnnouncement } from "../../services/announcementService";

export default function CreateAnnouncementScreen({ navigation }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is admin
  if (user.role !== "admin") {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Bạn không có quyền truy cập trang này
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung");
      return;
    }

    setLoading(true);

    const result = await createAnnouncement(user.uid, user.name, {
      title: title.trim(),
      content: content.trim(),
      priority: isUrgent ? "urgent" : "normal",
      targetDepartments: [], // Empty = for all
    });

    setLoading(false);

    if (result.success) {
      Alert.alert("Thành công", "Đã tạo thông báo", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert("Lỗi", result.error);
    }
  };

  const handlePreview = () => {
    Alert.alert(title || "Tiêu đề", content || "Nội dung", [{ text: "Đóng" }]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Tiêu đề *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề thông báo..."
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>Nội dung *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nhập nội dung thông báo..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={10}
          maxLength={1000}
          textAlignVertical="top"
        />

        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Thông báo khẩn cấp</Text>
            <Text style={styles.switchSubtext}>Sẽ được highlight màu đỏ</Text>
          </View>
          <Switch
            value={isUrgent}
            onValueChange={setIsUrgent}
            trackColor={{ false: "#ccc", true: "#FF3B30" }}
            thumbColor={isUrgent ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.previewButton]}
            onPress={handlePreview}
          >
            <Text style={styles.previewButtonText}>Xem trước</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đăng thông báo</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 200,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  switchSubtext: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  previewButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  previewButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
```

---

## **Task 5.5: ProfileScreen (1.5h)**

**Prompt cho Cursor:**

```
Tạo src/screens/main/ProfileScreen.js:

Features:
1. Hiển thị thông tin user: avatar, name, email, department, phone
2. Edit profile button → EditProfileScreen
3. Settings section:
   - Đổi mật khẩu
   - Thông báo
   - Dark mode (optional)
4. About section: App version, Terms
5. Logout button với confirm dialog

UI đẹp với sections rõ ràng
```

**Code: `src/screens/main/ProfileScreen.js`**

```javascript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert('Lỗi', result.error);
            }
          }
        }
      ]
    );
  };

  const MenuButton = ({ icon, title, onPress, color = '#000', showBadge = false }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.menuText, { color }]}>{title}</Text>
      </View>
      <View style={styles.menuRight}>
        {showBadge && <View style={styles.badge} />}
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar
          uri={user.avatar}
          name={user.name}
          size={100}
          showOnline={true}
          isOnline={user.status === 'online'}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.badge Container}>
          <View style={styles.infoBadge}>
            <Text style={styles.badgeText}>{user.department}</Text>
          </View>
          {user.role === 'admin' && (
            <View style={[styles.infoBadge, styles.adminBadge]}>
              <Text style={styles.badgeText}>Admin</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Chỉnh sửa profile</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin</Text>
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{user.phone || 'Chưa cập nhật'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="briefcase-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{user.position || 'Chưa cập nhật'}</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <MenuButton
          icon="notifications-outline"
          title="Thông báo"
          onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
        />
        <MenuButton
          icon="lock-closed-outline"
          title="Đổi mật khẩu"
          onPress={() => Alert.alert('Đổi mật khẩu', 'Tính năng đang phát triển')}
        />
        <MenuButton
          icon="moon-outline"
          title="Giao diện tối"
          onPress={() => Alert.alert('Dark Mode', 'Tính năng đang phát triển')}
        />
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Về ứng dụng</Text>
        <MenuButton
          icon="information-circle-outline"
          title="Giới thiệu"
          onPress={() => Alert.alert('MiniCorp Chat', 'Version 1.0.0\n\nApp chat nội bộ công ty')}
        />
        <MenuButton
          icon="document-text-outline"
          title="Điều khoản sử dụng"
          onPress={() => Alert.alert('Điều khoản', 'Tính năng đang phát triển')}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>MiniCorp Chat v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#000',
  },
  email: {
    fontSize: 15,
    color: '#666',
    marginTop: 5,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  infoBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#FF9500',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 15,
    paddingBottom: 10,
    textTransform: 'uppercase',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
  },
});
```

---

## **Task 5.6: Add EditProfile to Navigation (15 phút)**

**Update `src/navigation/MainNavigator.js`:**

```javascript
// Add import
import EditProfileScreen from "../screens/main/EditProfileScreen";

// Add to ProfileStackScreen
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Chỉnh sửa Profile" }}
      />
    </ProfileStack.Navigator>
  );
}
```

---

## ✅ **NGÀY 5 CHECKLIST**

- [ ] Announcement Service hoàn chỉnh
- [ ] AnnouncementCard component đẹp
- [ ] NotificationsScreen với filter, realtime updates
- [ ] CreateAnnouncementScreen (Admin only)
- [ ] ProfileScreen với đầy đủ thông tin
- [ ] Logout functionality
- [ ] Unread count badge
- [ ] Test: Admin tạo thông báo → Users nhận được → Mark as read

**Kết quả cuối ngày**: Hệ thống thông báo hoàn chỉnh, Profile screen đẹp!

---
