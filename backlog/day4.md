# 📅 **NGÀY 4: DEPARTMENT CHANNELS & GROUP CHAT**

---

## 🎯 Mục tiêu Ngày 4

- Tạo hệ thống phòng ban (Departments)
- Chat theo nhóm phòng ban (Group Chat)
- Quản lý departments
- Admin tools cơ bản

---

## **Task 4.1: Department Service (1.5h)**

**Prompt cho Cursor:**

```
Tạo src/services/departmentService.js với functions:

1. createDepartment(data): Tạo phòng ban mới (admin only)
2. getAllDepartments(): Lấy danh sách phòng ban
3. getDepartmentById(deptId): Lấy thông tin 1 phòng ban
4. subscribeToDepartments(callback): Realtime listener cho departments
5. sendDepartmentMessage(deptId, message): Gửi tin nhắn trong phòng ban
6. getDepartmentMessages(deptId, limit): Lấy messages của phòng ban
7. subscribeToDepartmentMessages(deptId, callback): Realtime messages
8. addMemberToDepartment(deptId, userId): Thêm member (auto từ user.department)
9. initializeDefaultDepartments(): Tạo departments mặc định

Return format nhất quán { success, data, error }
```

**Code: `src/services/departmentService.js`**

```javascript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";

// Initialize default departments
export const initializeDefaultDepartments = async () => {
  try {
    const defaultDepartments = [
      {
        id: "general",
        name: "General",
        description: "Kênh chung cho toàn công ty",
        icon: "🏢",
        type: "public",
        members: [],
      },
      {
        id: "engineering",
        name: "Engineering",
        description: "Phòng Kỹ Thuật",
        icon: "💻",
        type: "department",
        members: [],
      },
      {
        id: "marketing",
        name: "Marketing",
        description: "Phòng Marketing",
        icon: "📢",
        type: "department",
        members: [],
      },
      {
        id: "sales",
        name: "Sales",
        description: "Phòng Kinh Doanh",
        icon: "💼",
        type: "department",
        members: [],
      },
      {
        id: "hr",
        name: "HR",
        description: "Phòng Nhân Sự",
        icon: "👥",
        type: "department",
        members: [],
      },
    ];

    for (const dept of defaultDepartments) {
      const deptRef = doc(db, "departments", dept.id);
      const deptDoc = await getDoc(deptRef);

      if (!deptDoc.exists()) {
        await setDoc(deptRef, {
          ...dept,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`Created department: ${dept.name}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error initializing departments:", error);
    return { success: false, error: error.message };
  }
};

// Create department
export const createDepartment = async (data) => {
  try {
    const deptRef = doc(db, "departments", data.id);
    await setDoc(deptRef, {
      ...data,
      members: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: { id: data.id, ...data } };
  } catch (error) {
    console.error("Error creating department:", error);
    return { success: false, error: error.message };
  }
};

// Get all departments
export const getAllDepartments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "departments"));
    const departments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { success: true, data: departments };
  } catch (error) {
    console.error("Error getting departments:", error);
    return { success: false, error: error.message };
  }
};

// Get department by ID
export const getDepartmentById = async (deptId) => {
  try {
    const deptRef = doc(db, "departments", deptId);
    const deptDoc = await getDoc(deptRef);

    if (deptDoc.exists()) {
      return { success: true, data: { id: deptDoc.id, ...deptDoc.data() } };
    } else {
      return { success: false, error: "Department not found" };
    }
  } catch (error) {
    console.error("Error getting department:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to departments (realtime)
export const subscribeToDepartments = (callback) => {
  const q = query(collection(db, "departments"), orderBy("name"));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const departments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(departments);
    },
    (error) => {
      console.error("Error subscribing to departments:", error);
    }
  );
};

// Send message in department
export const sendDepartmentMessage = async (
  deptId,
  senderId,
  senderData,
  messageText,
  imageUrl = null
) => {
  try {
    const messagesRef = collection(db, "departments", deptId, "messages");

    const newMessage = {
      senderId,
      senderName: senderData.name,
      senderAvatar: senderData.avatar,
      senderDepartment: senderData.department,
      text: messageText,
      imageUrl,
      type: imageUrl ? "image" : "text",
      createdAt: serverTimestamp(),
    };

    const messageDoc = await addDoc(messagesRef, newMessage);

    // Update department's lastMessage
    const deptRef = doc(db, "departments", deptId);
    await updateDoc(deptRef, {
      lastMessage: {
        text: messageText || "📷 Hình ảnh",
        senderId,
        senderName: senderData.name,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });

    return { success: true, data: { id: messageDoc.id, ...newMessage } };
  } catch (error) {
    console.error("Error sending department message:", error);
    return { success: false, error: error.message };
  }
};

// Get department messages
export const getDepartmentMessages = async (deptId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, "departments", deptId, "messages"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .reverse();

    return { success: true, data: messages };
  } catch (error) {
    console.error("Error getting department messages:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to department messages (realtime)
export const subscribeToDepartmentMessages = (deptId, callback) => {
  const q = query(
    collection(db, "departments", deptId, "messages"),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const messages = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse();
      callback(messages);
    },
    (error) => {
      console.error("Error subscribing to department messages:", error);
    }
  );
};

// Add member to department
export const addMemberToDepartment = async (deptId, userId) => {
  try {
    const deptRef = doc(db, "departments", deptId);
    await updateDoc(deptRef, {
      members: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding member to department:", error);
    return { success: false, error: error.message };
  }
};

// Get user's departments
export const getUserDepartments = async (userDepartment) => {
  try {
    const allDepts = await getAllDepartments();

    if (!allDepts.success) {
      return allDepts;
    }

    // Filter: General + user's department
    const userDepts = allDepts.data.filter(
      (dept) =>
        dept.id === "general" ||
        dept.name.toLowerCase() === userDepartment.toLowerCase()
    );

    return { success: true, data: userDepts };
  } catch (error) {
    console.error("Error getting user departments:", error);
    return { success: false, error: error.message };
  }
};
```

---

## **Task 4.2: DepartmentCard Component (30 phút)**

**Prompt cho Cursor:**

```
Tạo src/components/DepartmentCard.js:

Component hiển thị thông tin department trong list:
- Props: department, onPress
- Show: icon, name, description, member count, last message
- Style giống ConversationItem nhưng có icon lớn hơn
```

**Code: `src/components/DepartmentCard.js`**

```javascript
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function DepartmentCard({ department, onPress }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins}p`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString("vi-VN");
  };

  const memberCount = department.members?.length || 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{department.icon || "📁"}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>#{department.name}</Text>
          {department.lastMessage && (
            <Text style={styles.time}>
              {formatTime(department.lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <Text style={styles.description} numberOfLines={1}>
          {department.description}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.memberCount}>👥 {memberCount} thành viên</Text>
          {department.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {department.lastMessage.senderName}: {department.lastMessage.text}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007AFF",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberCount: {
    fontSize: 13,
    color: "#999",
  },
  lastMessage: {
    fontSize: 13,
    color: "#666",
    flex: 1,
    marginLeft: 10,
  },
});
```

---

## **Task 4.3: DepartmentsScreen (1.5h)**

**Prompt cho Cursor:**

```
Tạo src/screens/main/DepartmentsScreen.js:

Features:
1. Hiển thị danh sách departments
2. Filter: "Tất cả" vs "Của tôi" (chỉ show general + user's department)
3. Realtime updates
4. Pull to refresh
5. Tap vào department → navigate to DepartmentChatScreen
6. FAB button cho Admin tạo department mới (optional)

Dùng DepartmentCard component
```

**Code: `src/screens/main/DepartmentsScreen.js`**

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
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToDepartments,
  getUserDepartments,
} from "../../services/departmentService";
import DepartmentCard from "../../components/DepartmentCard";

export default function DepartmentsScreen({ navigation }) {
  const { user } = useAuth();
  const [allDepartments, setAllDepartments] = useState([]);
  const [displayedDepartments, setDisplayedDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("mine"); // 'all' or 'mine'

  useEffect(() => {
    const unsubscribe = subscribeToDepartments((data) => {
      setAllDepartments(data);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterDepartments();
  }, [allDepartments, filter, user.department]);

  const filterDepartments = () => {
    if (filter === "all") {
      setDisplayedDepartments(allDepartments);
    } else {
      // Show General + user's department
      const filtered = allDepartments.filter(
        (dept) =>
          dept.id === "general" ||
          dept.name.toLowerCase() === user.department.toLowerCase()
      );
      setDisplayedDepartments(filtered);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Firestore realtime listener handles refresh
  };

  const handleDepartmentPress = (department) => {
    navigation.navigate("DepartmentChat", {
      departmentId: department.id,
      deptName: department.name,
      deptIcon: department.icon,
    });
  };

  const renderDepartment = ({ item }) => (
    <DepartmentCard
      department={item}
      onPress={() => handleDepartmentPress(item)}
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
            filter === "mine" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("mine")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "mine" && styles.filterTextActive,
            ]}
          >
            Của tôi
          </Text>
        </TouchableOpacity>

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
            Tất cả
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedDepartments}
        renderItem={renderDepartment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          displayedDepartments.length === 0 && styles.emptyContainer
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có phòng ban nào</Text>
          </View>
        }
      />
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
  filterContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#fff",
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
  },
});
```

---

## **Task 4.4: DepartmentChatScreen (2h)**

**Prompt cho Cursor:**

```
Tạo src/screens/main/DepartmentChatScreen.js:

Giống ChatScreen nhưng:
1. Group chat (nhiều người)
2. Hiển thị tên + department của người gửi
3. Không có typing indicator (phức tạp cho group)
4. Có member list button trên header
5. Support gửi text + image

Reuse ChatBubble, MessageInput components
Dùng departmentService
```

**Code: `src/screens/main/DepartmentChatScreen.js`**

```javascript
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToDepartmentMessages,
  sendDepartmentMessage,
} from "../../services/departmentService";
import ChatBubble from "../../components/ChatBubble";
import MessageInput from "../../components/MessageInput";
import * as ImagePicker from "expo-image-picker";
import { uploadChatImage } from "../../services/storageService";

export default function DepartmentChatScreen({ route, navigation }) {
  const { departmentId, deptName, deptIcon } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const flatListRef = useRef(null);

  useEffect(() => {
    // Set header
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Text style={styles.headerIcon}>{deptIcon}</Text>
          <Text style={styles.headerText}>#{deptName}</Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => Alert.alert("Members", "Feature coming soon!")}
        >
          <Ionicons name="people" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });

    // Subscribe to messages
    const unsubscribe = subscribeToDepartmentMessages(departmentId, (data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [departmentId]);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

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
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Cần quyền truy cập",
          "Vui lòng cấp quyền truy cập thư viện ảnh"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
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
          Alert.alert("Lỗi", "Không thể tải ảnh lên");
        }

        setUploading(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setUploading(false);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra");
    }
  };

  const renderMessage = ({ item, index }) => (
    <View>
      {renderDateSeparator(item, messages[index - 1])}
      <ChatBubble message={item} isOwn={item.senderId === user.uid} />
    </View>
  );

  const renderDateSeparator = (currentMsg, previousMsg) => {
    const currentDate =
      currentMsg.createdAt?.toDate?.() || new Date(currentMsg.createdAt);
    const previousDate =
      previousMsg?.createdAt?.toDate?.() || new Date(previousMsg?.createdAt);

    const isSameDay =
      currentDate.toDateString() === previousDate.toDateString();

    if (!previousMsg || !isSameDay) {
      return (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>
            {currentDate.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        initialNumToRender={20}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{deptIcon}</Text>
            <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
            <Text style={styles.emptySubtext}>
              Hãy bắt đầu cuộc trò chuyện!
            </Text>
          </View>
        }
      />

      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.uploadingText}>Đang tải ảnh...</Text>
        </View>
      )}

      <MessageInput onSend={handleSendMessage} onImagePick={handleImagePick} />
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
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerButton: {
    marginRight: 15,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexGrow: 1,
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
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
});
```

---

## **Task 4.5: Initialize Departments Script (30 phút)**

**Prompt cho Cursor:**

```
Tạo utility để init departments khi app chạy lần đầu:

Update App.js hoặc tạo useEffect trong MainNavigator để:
1. Check xem đã có departments chưa
2. Nếu chưa, gọi initializeDefaultDepartments()
3. Chỉ chạy 1 lần

Hoặc tạo admin screen để manually init
```

**Update `App.js` - Add initialization:**

```javascript
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator";
import MainNavigator from "./src/navigation/MainNavigator";
import { ActivityIndicator, View } from "react-native";
import { initializeDefaultDepartments } from "./src/services/departmentService";

const Stack = createStackNavigator();

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Initialize departments on first run
    const initDepartments = async () => {
      await initializeDefaultDepartments();
    };
    initDepartments();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
```

---

## **Task 4.6: Update ChatBubble để hiển thị Department (30 phút)**

**Prompt cho Cursor:**

```
Update src/components/ChatBubble.js:

Khi dùng trong group chat (DepartmentChatScreen):
- Hiển thị department badge của sender
- Show như: "John Doe • Engineering"

Add prop: showDepartment (default false)
```

**Update `src/components/ChatBubble.js`:**

```javascript
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function ChatBubble({ message, isOwn, showDepartment = false }) {
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
      style={[
        styles.container,
        isOwn ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {!isOwn && (
        <View style={styles.senderInfo}>
          <Text style={styles.senderName}>{message.senderName}</Text>
          {showDepartment && message.senderDepartment && (
            <>
              <Text style={styles.separator}> • </Text>
              <Text style={styles.department}>{message.senderDepartment}</Text>
            </>
          )}
        </View>
      )}

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
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginLeft: 10,
  },
  senderName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  separator: {
    fontSize: 13,
    color: "#999",
  },
  department: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
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
```

**Update `DepartmentChatScreen.js` - Pass showDepartment prop:**

```javascript
const renderMessage = ({ item, index }) => (
  <View>
    {renderDateSeparator(item, messages[index - 1])}
    <ChatBubble
      message={item}
      isOwn={item.senderId === user.uid}
      showDepartment={true} // Enable department display
    />
  </View>
);
```

---

## ✅ **NGÀY 4 CHECKLIST**

- [ ] Department Service với 9+ functions
- [ ] DepartmentCard component
- [ ] DepartmentsScreen với filter
- [ ] DepartmentChatScreen (group chat)
- [ ] Initialize default departments
- [ ] ChatBubble support department badge
- [ ] Upload ảnh trong department chat
- [ ] Test: Join department → Send message → Nhận realtime

**Kết quả cuối ngày**: App có hệ thống phòng ban hoàn chỉnh, chat nhóm hoạt động tốt!

---
