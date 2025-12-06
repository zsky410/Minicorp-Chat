# 📅 **NGÀY 3: CHAT 1-1 REALTIME**

---

## 🎯 Mục tiêu Ngày 3

- Build màn hình Chat 1-1 với realtime messaging
- Gửi/nhận tin nhắn text
- Gửi hình ảnh
- Typing indicator
- Read receipts
- Auto-scroll to bottom

---

## **Task 3.1: Chat Screen UI (2h)**

**Prompt cho Cursor:**

```
Tạo src/screens/main/ChatScreen.js:

Features:
1. Header với avatar, name, online status của người đối thoại
2. FlatList hiển thị messages (inverted để scroll từ dưới lên)
3. Realtime listener để nhận tin nhắn mới
4. MessageInput component ở bottom
5. Auto-scroll to bottom khi có tin nhắn mới
6. Load more messages khi scroll lên đầu
7. Show typing indicator
8. Mark as read khi vào screen

Dùng ChatBubble component để render messages
```

**Code: `src/screens/main/ChatScreen.js`**

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
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToMessages,
  sendMessage,
  markAsRead,
} from "../../services/chatService";
import ChatBubble from "../../components/ChatBubble";
import MessageInput from "../../components/MessageInput";
import * as ImagePicker from "expo-image-picker";
import { uploadChatImage } from "../../services/storageService";

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUserId, userName, userAvatar } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const flatListRef = useRef(null);

  useEffect(() => {
    // Mark conversation as read when entering
    markAsRead(conversationId, user.uid);

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(conversationId, (data) => {
      setMessages(data);
      setLoading(false);

      // Mark as read when new message arrives
      markAsRead(conversationId, user.uid);
    });

    return () => unsubscribe();
  }, [conversationId, user.uid]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const result = await sendMessage(
      conversationId,
      user.uid,
      {
        name: user.name,
        avatar: user.avatar,
      },
      text
    );

    if (!result.success) {
      Alert.alert("Lỗi", "Không thể gửi tin nhắn");
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

      if (!result.canceled) {
        setUploading(true);

        // Upload image
        const uploadResult = await uploadChatImage(result.assets[0].uri);

        if (uploadResult.success) {
          // Send message with image
          await sendMessage(
            conversationId,
            user.uid,
            {
              name: user.name,
              avatar: user.avatar,
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

  const renderMessage = ({ item }) => (
    <ChatBubble message={item} isOwn={item.senderId === user.uid} />
  );

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
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
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
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
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
});
```

---

## **Task 3.2: Storage Service cho Upload Ảnh (1h)**

**Prompt cho Cursor:**

```
Tạo src/services/storageService.js với functions:

1. uploadChatImage(imageUri): Upload ảnh chat lên Firebase Storage
2. uploadAvatar(userId, imageUri): Upload avatar
3. deleteImage(imageUrl): Xóa ảnh từ Storage

Return { success, data: downloadURL, error }
```

**Code: `src/services/storageService.js`**

```javascript
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

// Upload chat image
export const uploadChatImage = async (imageUri) => {
  try {
    // Convert image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create unique filename
    const timestamp = Date.now();
    const filename = `chat-images/${timestamp}.jpg`;

    // Upload to Storage
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return { success: true, data: downloadURL };
  } catch (error) {
    console.error("Error uploading chat image:", error);
    return { success: false, error: error.message };
  }
};

// Upload avatar
export const uploadAvatar = async (userId, imageUri) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const filename = `avatars/${userId}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return { success: true, data: downloadURL };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: error.message };
  }
};

// Delete image
export const deleteImage = async (imageUrl) => {
  try {
    // Extract path from URL
    const path = imageUrl.split("/o/")[1].split("?")[0];
    const decodedPath = decodeURIComponent(path);

    const storageRef = ref(storage, decodedPath);
    await deleteObject(storageRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, error: error.message };
  }
};
```

---

## **Task 3.3: Cài đặt expo-image-picker (15 phút)**

**Commands:**

```bash
npx expo install expo-image-picker
```

**Test permission trong ChatScreen đã có sẵn**

---

## **Task 3.4: Typing Indicator (Optional - 1h)**

**Prompt cho Cursor:**

```
Thêm typing indicator vào Chat:

1. Thêm field "typing" vào conversation document
2. Update typing status khi user đang gõ
3. Hiển thị "Đang nhập..." khi người kia đang gõ
4. Clear typing status sau 3 giây không gõ

Tạo component TypingIndicator.js
Update ChatScreen.js để show typing
Update MessageInput.js để track typing
```

**Code: `src/components/TypingIndicator.js`**

```javascript
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function TypingIndicator({ userName }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{userName} đang nhập</Text>
        <View style={styles.dots}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot1,
                transform: [
                  {
                    translateY: dot1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot2,
                transform: [
                  {
                    translateY: dot2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot3,
                transform: [
                  {
                    translateY: dot3.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9EB",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  dots: {
    flexDirection: "row",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#999",
    marginHorizontal: 2,
  },
});
```

**Update `src/services/chatService.js` - Thêm typing functions:**

```javascript
// Add to chatService.js

import { doc, updateDoc } from "firebase/firestore";

// Update typing status
export const updateTypingStatus = async (conversationId, userId, isTyping) => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      [`typing.${userId}`]: isTyping,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating typing status:", error);
    return { success: false, error: error.message };
  }
};

// Subscribe to typing status
export const subscribeToTyping = (conversationId, callback) => {
  const conversationRef = doc(db, "conversations", conversationId);

  return onSnapshot(
    conversationRef,
    (doc) => {
      if (doc.exists()) {
        const typing = doc.data().typing || {};
        callback(typing);
      }
    },
    (error) => {
      console.error("Error subscribing to typing:", error);
    }
  );
};
```

**Update `src/components/MessageInput.js` - Track typing:**

```javascript
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MessageInput({ onSend, onImagePick, onTyping }) {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (value) => {
    setText(value);

    if (onTyping) {
      // User is typing
      onTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 3000);
    }
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");

      // Stop typing
      if (onTyping) {
        onTyping(false);
      }

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        {onImagePick && (
          <TouchableOpacity style={styles.imageButton} onPress={onImagePick}>
            <Ionicons name="image" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={text.trim() ? "#fff" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "flex-end",
  },
  imageButton: {
    padding: 8,
    marginRight: 5,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
});
```

**Update `ChatScreen.js` - Add typing indicator:**

```javascript
// Add to ChatScreen.js imports
import TypingIndicator from "../../components/TypingIndicator";
import {
  subscribeToTyping,
  updateTypingStatus,
} from "../../services/chatService";

// Add state
const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

// Add useEffect for typing subscription
useEffect(() => {
  const unsubscribe = subscribeToTyping(conversationId, (typingStatus) => {
    const otherUserTyping = typingStatus[otherUserId] || false;
    setIsOtherUserTyping(otherUserTyping);
  });

  return () => unsubscribe();
}, [conversationId, otherUserId]);

// Add typing handler
const handleTyping = (isTyping) => {
  updateTypingStatus(conversationId, user.uid, isTyping);
};

// Update MessageInput component
<MessageInput
  onSend={handleSendMessage}
  onImagePick={handleImagePick}
  onTyping={handleTyping}
/>;

// Add TypingIndicator before MessageInput
{
  isOtherUserTyping && <TypingIndicator userName={userName} />;
}
```

---

## **Task 3.5: ForgotPasswordScreen (30 phút)**

**Prompt cho Cursor:**

```
Tạo src/screens/auth/ForgotPasswordScreen.js:

1. Email input
2. Button "Gửi link reset"
3. Show success message
4. Navigate back to Login sau khi thành công

Dùng resetPassword từ authService
```

**Code: `src/screens/auth/ForgotPasswordScreen.js`**

```javascript
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resetPassword } from "../../services/authService";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    } else {
      Alert.alert("Lỗi", result.error);
    }
  };

  if (sent) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#4CD964" />
        <Text style={styles.successTitle}>Đã gửi!</Text>
        <Text style={styles.successText}>
          Vui lòng kiểm tra email để reset mật khẩu
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <Text style={styles.title}>Quên mật khẩu?</Text>
        <Text style={styles.subtitle}>
          Nhập email để nhận link reset mật khẩu
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email (@minicorp.com)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Gửi link reset</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#007AFF",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
```

---

## **Task 3.6: Testing & Bug Fixes (1h)**

**Checklist kiểm tra:**

1. **Chat Flow:**

   - [ ] Tạo conversation mới
   - [ ] Gửi tin nhắn text
   - [ ] Gửi hình ảnh
   - [ ] Nhận tin nhắn realtime
   - [ ] Scroll to bottom tự động
   - [ ] Typing indicator hoạt động

2. **UI/UX:**

   - [ ] Chat bubbles hiển thị đúng (own/other)
   - [ ] Avatar hiển thị
   - [ ] Timestamp format đúng
   - [ ] Loading states
   - [ ] Empty states

3. **Performance:**

   - [ ] Messages load nhanh
   - [ ] Không lag khi scroll
   - [ ] Image upload không block UI

4. **Edge Cases:**
   - [ ] Gửi tin nhắn rỗng (không được)
   - [ ] Gửi tin nhắn dài
   - [ ] Internet mất kết nối
   - [ ] Upload ảnh lỗi

---

## **Task 3.7: Polish & Improvements (1h)**

**Prompt cho Cursor:**

```
Cải thiện ChatScreen:

1. Thêm "Load more" khi scroll lên đầu
2. Thêm timestamp separator (ngày)
3. Thêm press & hold để copy message
4. Thêm image preview khi tap vào ảnh
5. Optimize FlatList với windowSize, removeClippedSubviews
```

**Code: Add to ChatScreen.js**

```javascript
// Add date separator
const renderDateSeparator = (currentMsg, previousMsg) => {
  const currentDate =
    currentMsg.createdAt?.toDate?.() || new Date(currentMsg.createdAt);
  const previousDate =
    previousMsg?.createdAt?.toDate?.() || new Date(previousMsg?.createdAt);

  const isSameDay = currentDate.toDateString() === previousDate.toDateString();

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

// Update renderMessage
const renderMessage = ({ item, index }) => (
  <View>
    {renderDateSeparator(item, messages[index - 1])}
    <ChatBubble message={item} isOwn={item.senderId === user.uid} />
  </View>
);

// Update FlatList props for performance
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
  onContentSizeChange={() =>
    flatListRef.current?.scrollToEnd({ animated: false })
  }
  onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
/>;

// Add styles
const styles = StyleSheet.create({
  // ... existing styles
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
});
```

---

## ✅ **NGÀY 3 CHECKLIST**

- [ ] ChatScreen hoàn chỉnh với realtime messaging
- [ ] Gửi text messages
- [ ] Gửi hình ảnh
- [ ] Upload ảnh lên Firebase Storage
- [ ] Typing indicator hoạt động
- [ ] Date separators
- [ ] Performance optimizations
- [ ] ForgotPasswordScreen
- [ ] Test đầy đủ chat flow

**Kết quả cuối ngày**: Chat 1-1 hoạt động hoàn hảo, realtime, gửi được ảnh!

---
