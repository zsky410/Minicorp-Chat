# 📅 **NGÀY 2: UI CORE & CHAT SERVICE**

---

## 🎯 Mục tiêu Ngày 2
- Setup Navigation chính (Bottom Tabs)
- Tạo các components UI tái sử dụng
- Build Chat Service (Firestore operations)
- Tạo màn hình Home (List conversations)

---

## **Task 2.1: Main Navigation Structure (1h)**

**Prompt cho Cursor:**
```
Tạo src/navigation/AuthNavigator.js và MainNavigator.js:

1. AuthNavigator.js: Stack navigator với 3 screens (Login, Register, ForgotPassword)
2. MainNavigator.js: Bottom Tab Navigator với 4 tabs:
   - Home (Chats) - icon: chatbubbles
   - Departments - icon: people
   - Notifications - icon: notifications
   - Profile - icon: person

Mỗi tab có Stack Navigator riêng để có thể push thêm screens.
Dùng @expo/vector-icons cho icons
```

**Code: `src/navigation/AuthNavigator.js`**
```javascript
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
```

**Code: `src/navigation/MainNavigator.js`**
```javascript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import ChatScreen from '../screens/main/ChatScreen';
import DepartmentsScreen from '../screens/main/DepartmentsScreen';
import DepartmentChatScreen from '../screens/main/DepartmentChatScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreateAnnouncementScreen from '../screens/admin/CreateAnnouncementScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const DeptStack = createStackNavigator();
const NotifStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Home Stack Navigator
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Chats' }}
      />
      <HomeStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({ title: route.params?.userName || 'Chat' })}
      />
    </HomeStack.Navigator>
  );
}

// Department Stack Navigator
function DeptStackScreen() {
  return (
    <DeptStack.Navigator>
      <DeptStack.Screen
        name="DepartmentsScreen"
        component={DepartmentsScreen}
        options={{ title: 'Phòng Ban' }}
      />
      <DeptStack.Screen
        name="DepartmentChat"
        component={DepartmentChatScreen}
        options={({ route }) => ({ title: route.params?.deptName || 'Department Chat' })}
      />
    </DeptStack.Navigator>
  );
}

// Notification Stack Navigator
function NotifStackScreen() {
  return (
    <NotifStack.Navigator>
      <NotifStack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ title: 'Thông Báo' }}
      />
      <NotifStack.Screen
        name="CreateAnnouncement"
        component={CreateAnnouncementScreen}
        options={{ title: 'Tạo Thông Báo' }}
      />
    </NotifStack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Departments') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{ tabBarLabel: 'Chats' }}
      />
      <Tab.Screen
        name="Departments"
        component={DeptStackScreen}
        options={{ tabBarLabel: 'Phòng Ban' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotifStackScreen}
        options={{ tabBarLabel: 'Thông Báo' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{ tabBarLabel: 'Cá Nhân' }}
      />
    </Tab.Navigator>
  );
}
```

---

## **Task 2.2: Reusable UI Components (2h)**

**Prompt cho Cursor:**
```
Tạo các components trong src/components/:

1. Avatar.js: Component hiển thị avatar user
   - Props: uri, size, name (for fallback)
   - Show initials nếu không có avatar
   - Online indicator (optional)

2. ChatBubble.js: Component hiển thị message bubble
   - Props: message, isOwn (sent by current user)
   - Show time, sender name
   - Different style for own/other messages

3. ConversationItem.js: Item trong danh sách conversations
   - Props: conversation, onPress
   - Show: avatar, name, last message, time, unread badge

4. UserListItem.js: Item trong danh sách users
   - Props: user, onPress
   - Show: avatar, name, department, online status

5. MessageInput.js: Input field để gửi message
   - Props: onSend
   - Text input + Send button
   - Image picker button (optional)
```

**Code: `src/components/Avatar.js`**
```javascript
import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function Avatar({ uri, size = 50, name = '', showOnline = false, isOnline = false }) {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, { width: size, height: size }]} />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <Text style={[styles.initials, { fontSize: size / 2.5 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {showOnline && isOnline && (
        <View style={[styles.onlineDot, { width: size / 5, height: size / 5 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    borderRadius: 100,
  },
  placeholder: {
    borderRadius: 100,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CD964',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
```

**Code: `src/components/ChatBubble.js`**
```javascript
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function ChatBubble({ message, isOwn }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {!isOwn && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}

      {message.imageUrl && (
        <Image source={{ uri: message.imageUrl }} style={styles.image} />
      )}

      {message.text && (
        <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
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
    maxWidth: '75%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 10,
  },
  bubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  ownBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#E9E9EB',
  },
  text: {
    fontSize: 16,
  },
  ownText: {
    color: '#fff',
  },
  otherText: {
    color: '#000',
  },
  time: {
    fontSize: 11,
    color: '#999',
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

**Code: `src/components/ConversationItem.js`**
```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';

export default function ConversationItem({ conversation, currentUserId, onPress }) {
  // Get other user's info (for direct chats)
  const otherUserId = conversation.members?.find(id => id !== currentUserId);
  const otherUser = conversation.memberDetails?.[otherUserId];

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins}p`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('vi-VN');
  };

  const unreadCount = conversation.unreadCount?.[currentUserId] || 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Avatar
        uri={otherUser?.avatar}
        name={otherUser?.name}
        size={55}
        showOnline={true}
        isOnline={otherUser?.status === 'online'}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {otherUser?.name || 'Unknown'}
          </Text>
          <Text style={styles.time}>
            {formatTime(conversation.updatedAt)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage?.text || 'Chưa có tin nhắn'}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    fontSize: 13,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

**Code: `src/components/UserListItem.js`**
```javascript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';

export default function UserListItem({ user, onPress, showDepartment = true }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Avatar
        uri={user.avatar}
        name={user.name}
        size={50}
        showOnline={true}
        isOnline={user.status === 'online'}
      />

      <View style={styles.content}>
        <Text style={styles.name}>{user.name}</Text>
        {showDepartment && (
          <Text style={styles.department}>{user.department}</Text>
        )}
        {user.position && (
          <Text style={styles.position}>{user.position}</Text>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View style={[
          styles.statusDot,
          { backgroundColor: user.status === 'online' ? '#4CD964' : '#ccc' }
        ]} />
        <Text style={styles.statusText}>
          {user.status === 'online' ? 'Online' : 'Offline'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  position: {
    fontSize: 13,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
});
```

**Code: `src/components/MessageInput.js`**
```javascript
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MessageInput({ onSend, onImagePick }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          onChangeText={setText}
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
            color={text.trim() ? '#fff' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
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
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
});
```

---

## **Task 2.3: Chat Service (2h)**

**Prompt cho Cursor:**
```
Tạo src/services/chatService.js với các functions:

1. getOrCreateConversation(currentUserId, otherUserId): Tạo hoặc lấy conversation 1-1
2. getConversations(userId): Lấy danh sách conversations của user
3. sendMessage(conversationId, message): Gửi tin nhắn
4. getMessages(conversationId, limit): Lấy messages trong conversation
5. markAsRead(conversationId, userId): Đánh dấu đã đọc
6. subscribeToMessages(conversationId, callback): Realtime listener
7. subscribeToConversations(userId, callback): Realtime listener conversations

Tất cả functions có error handling và return format nhất quán
```

**Code: `src/services/chatService.js`**
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
  increment
} from 'firebase/firestore';
import { db } from './firebase';

// Get or create 1-1 conversation
export const getOrCreateConversation = async (currentUserId, otherUserId, otherUserData) => {
  try {
    // Sort IDs to ensure consistent conversation ID
    const members = [currentUserId, otherUserId].sort();
    const conversationId = `${members[0]}_${members[1]}`;

    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      return { success: true, data: { id: conversationId, ...conversationDoc.data() } };
    }

    // Create new conversation
    const newConversation = {
      id: conversationId,
      type: 'direct',
      members,
      memberDetails: {
        [otherUserId]: {
          name: otherUserData.name,
          avatar: otherUserData.avatar,
          department: otherUserData.department
        }
      },
      lastMessage: null,
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(conversationRef, newConversation);
    return { success: true, data: newConversation };
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    return { success: false, error: error.message };
  }
};

// Get all conversations for a user
export const getConversations = async (userId) => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('members', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: conversations };
  } catch (error) {
    console.error('Error in getConversations:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to conversations (realtime)
export const subscribeToConversations = (userId, callback) => {
  const q = query(
    collection(db, 'conversations'),
    where('members', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const conversations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(conversations);
  }, (error) => {
    console.error('Error in subscribeToConversations:', error);
  });
};

// Send message
export const sendMessage = async (conversationId, senderId, senderData, messageText, imageUrl = null) => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');

    const newMessage = {
      senderId,
      senderName: senderData.name,
      senderAvatar: senderData.avatar,
      text: messageText,
      imageUrl,
      type: imageUrl ? 'image' : 'text',
      status: 'sent',
      createdAt: serverTimestamp()
    };

    const messageDoc = await addDoc(messagesRef, newMessage);

    // Update conversation's last message
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const otherUserId = conversationData.members.find(id => id !== senderId);

      await updateDoc(conversationRef, {
        lastMessage: {
          text: messageText || '📷 Hình ảnh',
          senderId,
          senderName: senderData.name,
          timestamp: serverTimestamp()
        },
        [`unreadCount.${otherUserId}`]: increment(1),
        updatedAt: serverTimestamp()
      });
    }

    return { success: true, data: { id: messageDoc.id, ...newMessage } };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return { success: false, error: error.message };
  }
};

// Get messages
export const getMessages = async (conversationId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse(); // Reverse to show oldest first

    return { success: true, data: messages };
  } catch (error) {
    console.error('Error in getMessages:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to messages (realtime)
export const subscribeToMessages = (conversationId, callback) => {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse();
    callback(messages);
  }, (error) => {
    console.error('Error in subscribeToMessages:', error);
  });
};

// Mark conversation as read
export const markAsRead = async (conversationId, userId) => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0
    });
    return { success: true };
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return { success: false, error: error.message };
  }
};

// Search users (for starting new chat)
export const searchUsers = async (searchTerm, currentUserId) => {
  try {
    // Note: This is a simple implementation. For production, consider using Algolia or similar
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    const users = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user =>
        user.id !== currentUserId &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    return { success: true, data: users };
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return { success: false, error: error.message };
  }
};
```

---

## **Task 2.4: Home Screen - Conversation List (2h)**

**Prompt cho Cursor:**
```
Tạo src/screens/main/HomeScreen.js:

Features:
1. Hiển thị danh sách conversations realtime
2. Search bar để tìm user mới chat
3. Floating Action Button để bắt đầu chat mới
4. Pull to refresh
5. Empty state khi chưa có conversation
6. Tap vào conversation → navigate to ChatScreen

Dùng FlatList cho performance tốt
Dùng ConversationItem component
```

**Code: `src/screens/main/HomeScreen.js`**
```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { subscribeToConversations, searchUsers, getOrCreateConversation } from '../../services/chatService';
import ConversationItem from '../../components/ConversationItem';
import UserListItem from '../../components/UserListItem';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search modal
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToConversations(user.uid, (data) => {
      setConversations(data);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Firestore realtime listener will handle refresh automatically
  };

  const handleSearchUsers = async () => {
    if (searchQuery.trim().length < 2) return;

    setSearching(true);
    const result = await searchUsers(searchQuery, user.uid);
    setSearching(false);

    if (result.success) {
      setSearchResults(result.data);
    }
  };

  const handleStartChat = async (otherUser) => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);

    // Get or create conversation
    const result = await getOrCreateConversation(user.uid, otherUser.id, otherUser);

    if (result.success) {
      navigation.navigate('Chat', {
        conversationId: result.data.id,
        otherUserId: otherUser.id,
        userName: otherUser.name,
        userAvatar: otherUser.avatar
      });
    }
  };

  const renderConversation = ({ item }) => (
    <ConversationItem
      conversation={item}
      currentUserId={user.uid}
      onPress={() => {
        const otherUserId = item.members.find(id => id !== user.uid);
        const otherUser = item.memberDetails[otherUserId];

        navigation.navigate('Chat', {
          conversationId: item.id,
          otherUserId,
          userName: otherUser?.name,
          userAvatar: otherUser?.avatar
        });
      }}
    />
  );

  const renderSearchResult = ({ item }) => (
    <UserListItem
      user={item}
      onPress={() => handleStartChat(item)}
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
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={conversations.length === 0 && styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có cuộc trò chuyện</Text>
            <Text style={styles.emptySubtext}>Nhấn nút + để bắt đầu chat</Text>
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
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
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
              contentContainerStyle={searchResults.length === 0 && styles.emptyContainer}
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
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
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
```

---

## **Task 2.5: User Service (1h)**

**Prompt cho Cursor:**
```
Tạo src/services/userService.js với functions:

1. getAllUsers(): Lấy tất cả users
2. getUserById(userId): Lấy thông tin 1 user
3. updateUserProfile(userId, data): Update profile
4. uploadAvatar(userId, imageUri): Upload avatar lên Storage
5. updateUserStatus(userId, status): Update online/offline
6. getUsersByDepartment(department): Lấy users theo phòng ban

Use Firestore và Firebase Storage
```

**Code: `src/services/userService.js`**
```javascript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);

    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: users };
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return { success: false, error: error.message };
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return { success: false, error: error.message };
  }
};

export const uploadAvatar = async (userId, imageUri) => {
  try {
    // Convert image to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Storage
    const storageRef = ref(storage, `avatars/${userId}.jpg`);
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Update user document
    await updateUserProfile(userId, { avatar: downloadURL });

    return { success: true, data: downloadURL };
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status,
      lastSeen: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error in updateUserStatus:', error);
    return { success: false, error: error.message };
  }
};

export const getUsersByDepartment = async (department) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('department', '==', department)
    );

    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: users };
  } catch (error) {
    console.error('Error in getUsersByDepartment:', error);
    return { success: false, error: error.message };
  }
};
```

---

## ✅ **NGÀY 2 CHECKLIST**

- [ ] Navigation structure hoàn chỉnh (Bottom Tabs)
- [ ] 5 reusable components (Avatar, ChatBubble, ConversationItem, UserListItem, MessageInput)
- [ ] Chat Service với 7+ functions
- [ ] User Service với 6+ functions
- [ ] Home Screen hoạt động (list conversations + search)
- [ ] Test: Tìm user → Xem conversation list

**Kết quả cuối ngày**: App có UI đẹp, navigation mượt, có thể xem danh sách conversations!

---