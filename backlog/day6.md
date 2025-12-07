# 📅 **NGÀY 6: EDIT PROFILE & POLISH**

---

## 🎯 Mục tiêu Ngày 6

- Edit Profile với upload avatar
- Cải thiện UI/UX toàn bộ app
- Add loading states, error handling
- Performance optimization
- Bug fixes
- Polish animations và transitions

---

## **Task 6.1: EditProfileScreen (2h)**

**Prompt cho Cursor:**

```
Tạo src/screens/main/EditProfileScreen.js:

Features:
1. Form chỉnh sửa: Name, Phone, Position, Department
2. Upload/change avatar từ camera hoặc gallery
3. Preview avatar trước khi upload
4. Save button với loading state
5. Validation đầy đủ
6. Success/error messages
7. Cancel button

Dùng ImagePicker, uploadAvatar từ storageService
```

**Code: `src/screens/main/EditProfileScreen.js`**

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
  Image,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/userService";
import { uploadAvatar } from "../../services/storageService";
import Avatar from "../../components/Avatar";

const DEPARTMENTS = ["HR", "Engineering", "Sales", "Marketing"];

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    position: user.position || "",
    department: user.department || "Engineering",
    avatar: user.avatar || "",
  });

  const [newAvatarUri, setNewAvatarUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleImagePick = async (source) => {
    try {
      let result;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Cần quyền truy cập",
            "Vui lòng cấp quyền truy cập camera"
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Cần quyền truy cập",
            "Vui lòng cấp quyền truy cập thư viện ảnh"
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (!result.canceled) {
        setNewAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Chụp ảnh", "Chọn từ thư viện"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleImagePick("camera");
          } else if (buttonIndex === 2) {
            handleImagePick("gallery");
          }
        }
      );
    } else {
      Alert.alert("Chọn ảnh", "Bạn muốn chọn ảnh từ đâu?", [
        { text: "Hủy", style: "cancel" },
        { text: "Chụp ảnh", onPress: () => handleImagePick("camera") },
        { text: "Thư viện", onPress: () => handleImagePick("gallery") },
      ]);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên");
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = formData.avatar;

      // Upload new avatar if selected
      if (newAvatarUri) {
        setUploadingAvatar(true);
        const uploadResult = await uploadAvatar(user.uid, newAvatarUri);
        setUploadingAvatar(false);

        if (uploadResult.success) {
          avatarUrl = uploadResult.data;
        } else {
          Alert.alert(
            "Cảnh báo",
            "Không thể tải ảnh lên, các thông tin khác vẫn được lưu"
          );
        }
      }

      // Update profile
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
        department: formData.department,
        avatar: avatarUrl,
      };

      const result = await updateUserProfile(user.uid, updateData);

      setLoading(false);

      if (result.success) {
        Alert.alert("Thành công", "Đã cập nhật profile", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Lỗi", result.error);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={showImagePickerOptions}>
            {newAvatarUri ? (
              <Image
                source={{ uri: newAvatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <Avatar uri={formData.avatar} name={formData.name} size={120} />
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarText}>Tap để thay đổi ảnh</Text>
          {uploadingAvatar && (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={{ marginTop: 10 }}
            />
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ tên"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user.email}
            editable={false}
          />
          <Text style={styles.hint}>Email không thể thay đổi</Text>

          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Chức vụ</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Developer, Manager..."
            value={formData.position}
            onChangeText={(text) =>
              setFormData({ ...formData, position: text })
            }
          />

          <Text style={styles.label}>Phòng ban</Text>
          <View style={styles.departmentContainer}>
            {DEPARTMENTS.map((dept) => (
              <TouchableOpacity
                key={dept}
                style={[
                  styles.departmentChip,
                  formData.department === dept && styles.departmentChipActive,
                ]}
                onPress={() => setFormData({ ...formData, department: dept })}
              >
                <Text
                  style={[
                    styles.departmentChipText,
                    formData.department === dept &&
                      styles.departmentChipTextActive,
                  ]}
                >
                  {dept}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
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
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    marginTop: 15,
    fontSize: 14,
    color: "#666",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  hint: {
    fontSize: 13,
    color: "#999",
    marginTop: -10,
    marginBottom: 15,
  },
  departmentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 15,
  },
  departmentChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  departmentChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  departmentChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  departmentChipTextActive: {
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
```

---

## **Task 6.2: Add Tab Badge for Unread Notifications (30 phút)**

**Prompt cho Cursor:**

```
Update MainNavigator.js để:
1. Subscribe to announcements để đếm unread
2. Hiển thị badge trên Notifications tab khi có unread
3. Badge màu đỏ với số lượng

Dùng Context hoặc state trong MainNavigator
```

**Update `src/navigation/MainNavigator.js`:**

```javascript
import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

// Screens
import HomeScreen from "../screens/main/HomeScreen";
import ChatScreen from "../screens/main/ChatScreen";
import DepartmentsScreen from "../screens/main/DepartmentsScreen";
import DepartmentChatScreen from "../screens/main/DepartmentChatScreen";
import NotificationsScreen from "../screens/main/NotificationsScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import EditProfileScreen from "../screens/main/EditProfileScreen";
import CreateAnnouncementScreen from "../screens/admin/CreateAnnouncementScreen";

// Services
import {
  subscribeToAnnouncements,
  getUnreadCount,
} from "../services/announcementService";
import { useAuth } from "../context/AuthContext";

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const DeptStack = createStackNavigator();
const NotifStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Badge Component
function TabBadge({ count }) {
  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

// Stack Navigators (same as before)
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "Chats" }}
      />
      <HomeStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params?.userName || "Chat" })}
      />
    </HomeStack.Navigator>
  );
}

function DeptStackScreen() {
  return (
    <DeptStack.Navigator>
      <DeptStack.Screen
        name="DepartmentsScreen"
        component={DepartmentsScreen}
        options={{ title: "Phòng Ban" }}
      />
      <DeptStack.Screen
        name="DepartmentChat"
        component={DepartmentChatScreen}
        options={({ route }) => ({
          title: route.params?.deptName || "Department Chat",
        })}
      />
    </DeptStack.Navigator>
  );
}

function NotifStackScreen() {
  return (
    <NotifStack.Navigator>
      <NotifStack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ title: "Thông Báo" }}
      />
      <NotifStack.Screen
        name="CreateAnnouncement"
        component={CreateAnnouncementScreen}
        options={{ title: "Tạo Thông Báo" }}
      />
    </NotifStack.Navigator>
  );
}

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

export default function MainNavigator() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAnnouncements((announcements) => {
      const count = getUnreadCount(announcements, user.uid, user.department);
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user.uid, user.department]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Departments") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return (
            <View>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === "Notifications" && (
                <TabBadge count={unreadCount} />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{ tabBarLabel: "Chats" }}
      />
      <Tab.Screen
        name="Departments"
        component={DeptStackScreen}
        options={{ tabBarLabel: "Phòng Ban" }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotifStackScreen}
        options={{
          tabBarLabel: "Thông Báo",
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{ tabBarLabel: "Cá Nhân" }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -10,
    top: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
```

---

## **Task 6.3: Loading States & Empty States (1h)**

**Prompt cho Cursor:**

```
Tạo reusable components:

1. src/components/LoadingScreen.js - Full screen loading
2. src/components/EmptyState.js - Empty state với icon, text, action button
3. Update tất cả screens để dùng components này

Props:
- LoadingScreen: message (optional)
- EmptyState: icon, title, subtitle, actionText, onAction
```

**Code: `src/components/LoadingScreen.js`**

```javascript
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

export default function LoadingScreen({ message = "Đang tải..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
});
```

**Code: `src/components/EmptyState.js`**

```javascript
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function EmptyState({
  icon = "file-tray-outline",
  title = "Không có dữ liệu",
  subtitle = "",
  actionText = "",
  onAction = null,
}) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={80} color="#ccc" />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionText && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    marginTop: 25,
    paddingHorizontal: 25,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
```

---

## **Task 6.4: Error Handling Component (30 phút)**

**Prompt cho Cursor:**

```
Tạo src/components/ErrorScreen.js:

Component hiển thị khi có lỗi:
- Props: error, onRetry
- Icon error
- Error message
- Retry button

Reusable cho tất cả screens
```

**Code: `src/components/ErrorScreen.js`**

```javascript
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ErrorScreen({ error = "Đã có lỗi xảy ra", onRetry }) {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={80} color="#FF3B30" />
      <Text style={styles.title}>Có lỗi xảy ra</Text>
      <Text style={styles.message}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Ionicons
            name="refresh"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
  },
  message: {
    fontSize: 15,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    paddingHorizontal: 25,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
```

---

## **Task 6.5: UI Polish & Animations (2h)**

**Prompt cho Cursor:**

```
Cải thiện UI/UX:

1. Add fade-in animations cho lists
2. Add haptic feedback cho buttons (Expo Haptics)
3. Smooth transitions giữa screens
4. Better shadows và elevations
5. Consistent spacing và padding
6. Polish colors và typography

Update styles trong các components chính
```

**Install Haptics:**

```bash
npx expo install expo-haptics
```

**Example: Add to MessageInput.js:**

```javascript
import * as Haptics from "expo-haptics";

const handleSend = () => {
  if (text.trim()) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(text.trim());
    setText("");

    if (onTyping) {
      onTyping(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }
};
```

**Create `src/utils/constants.js` for consistent styling:**

```javascript
export const COLORS = {
  primary: "#007AFF",
  secondary: "#5856D6",
  success: "#4CD964",
  warning: "#FF9500",
  danger: "#FF3B30",

  text: {
    primary: "#000",
    secondary: "#666",
    tertiary: "#999",
    inverse: "#fff",
  },

  background: {
    primary: "#fff",
    secondary: "#f5f5f5",
    tertiary: "#e0e0e0",
  },

  border: "#e0e0e0",
};

export const SIZES = {
  padding: {
    small: 10,
    medium: 15,
    large: 20,
  },

  borderRadius: {
    small: 8,
    medium: 12,
    large: 20,
  },

  font: {
    small: 13,
    medium: 16,
    large: 20,
    xlarge: 28,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
};
```

---

## **Task 6.6: Performance Optimization (1h)**

**Prompt cho Cursor:**

```
Optimize performance:

1. Add React.memo to components
2. useMemo, useCallback where needed
3. FlatList optimizations (windowSize, removeClippedSubviews)
4. Image caching
5. Debounce search inputs
6. Lazy load images

Focus on: HomeScreen, ChatScreen, DepartmentChatScreen
```

**Example: Optimize ConversationItem with React.memo:**

```javascript
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Avatar from "./Avatar";

const ConversationItem = React.memo(
  ({ conversation, currentUserId, onPress }) => {
    const otherUserId = conversation.members?.find(
      (id) => id !== currentUserId
    );
    const otherUser = conversation.memberDetails?.[otherUserId];

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

    const unreadCount = conversation.unreadCount?.[currentUserId] || 0;

    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Avatar
          uri={otherUser?.avatar}
          name={otherUser?.name}
          size={55}
          showOnline={true}
          isOnline={otherUser?.status === "online"}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {otherUser?.name || "Unknown"}
            </Text>
            <Text style={styles.time}>
              {formatTime(conversation.updatedAt)}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {conversation.lastMessage?.text || "Chưa có tin nhắn"}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for optimization
    return (
      prevProps.conversation.id === nextProps.conversation.id &&
      prevProps.conversation.updatedAt === nextProps.conversation.updatedAt &&
      prevProps.conversation.unreadCount?.[nextProps.currentUserId] ===
        nextProps.conversation.unreadCount?.[nextProps.currentUserId]
    );
  }
);

export default ConversationItem;

// ... styles remain the same
```

---

## **Task 6.7: Bug Fixes & Final Testing (1h)**

**Checklist kiểm tra và fix bugs:**

### **Authentication:**

- [ ] Login/logout flow mượt
- [ ] Remember user session
- [ ] Handle expired sessions
- [ ] Forgot password works

### **Chat:**

- [ ] Messages load correctly
- [ ] Realtime sync working
- [ ] Images upload successfully
- [ ] Typing indicator accurate
- [ ] Scroll to bottom smooth

### **Departments:**

- [ ] Department list loads
- [ ] Group chat works
- [ ] Messages show department badge

### **Announcements:**

- [ ] Unread count accurate
- [ ] Mark as read works
- [ ] Admin can create
- [ ] Urgent badge shows correctly

### **Profile:**

- [ ] Edit profile saves
- [ ] Avatar upload works
- [ ] Data syncs across app

### **General:**

- [ ] No memory leaks
- [ ] No crashes
- [ ] Smooth performance
- [ ] Works offline gracefully

---

## ✅ **NGÀY 6 CHECKLIST**

- [ ] EditProfileScreen hoàn chỉnh
- [ ] Upload avatar working
- [ ] Tab badge cho notifications
- [ ] LoadingScreen, EmptyState, ErrorScreen components
- [ ] UI polish với animations
- [ ] Haptic feedback
- [ ] Constants file cho styling
- [ ] Performance optimizations
- [ ] Bug fixes

**Kết quả cuối ngày**: App chạy mượt, UI đẹp, performance tốt, ít bugs!
