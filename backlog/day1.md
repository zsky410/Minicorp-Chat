# 🚀 BACKLOG CHI TIẾT - APP CHAT NỘI BỘ "MiniCorp Chat"

## 📋 TỔNG QUAN DỰ ÁN

**Mục tiêu**: Xây dựng app chat nội bộ công ty nhỏ (20-50 người) trong 7 ngày

**Tech Stack**:

- Frontend: React Native (Expo)
- Backend: Firebase (Auth, Firestore, Storage)
- Navigation: React Navigation v6
- UI: React Native Paper / Native Base (optional)

**Deliverables**:

- App chat hoạt động đầy đủ
- Video demo 3-5 phút
- Source code + Documentation

---

## 🗂️ CẤU TRÚC THỨ MỤC

```
minicorp-chat/
├── App.js
├── app.json
├── package.json
├── firebase.config.js
├── src/
│   ├── components/
│   │   ├── ChatBubble.js
│   │   ├── Avatar.js
│   │   ├── MessageInput.js
│   │   ├── ConversationItem.js
│   │   ├── DepartmentCard.js
│   │   ├── AnnouncementCard.js
│   │   └── UserListItem.js
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── main/
│   │   │   ├── HomeScreen.js           // List conversations
│   │   │   ├── ChatScreen.js           // Chat 1-1
│   │   │   ├── DepartmentsScreen.js    // List departments
│   │   │   ├── DepartmentChatScreen.js // Group chat
│   │   │   ├── NotificationsScreen.js  // Announcements
│   │   │   └── ProfileScreen.js
│   │   └── admin/
│   │       └── CreateAnnouncementScreen.js
│   ├── navigation/
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── services/
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   ├── chatService.js
│   │   ├── userService.js
│   │   └── notificationService.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── ChatContext.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useConversations.js
│   │   └── useMessages.js
│   └── utils/
│       ├── constants.js
│       ├── validators.js
│       └── helpers.js
└── assets/
    └── images/
```

---

## 📊 DATABASE SCHEMA (FIRESTORE)

### Collection: `users`

```javascript
{
  uid: "string (auto from Auth)",
  email: "user@minicorp.com",
  name: "Nguyễn Văn A",
  avatar: "https://storage.../avatar.jpg",
  department: "Engineering", // HR, Engineering, Sales, Marketing
  position: "Developer",
  phone: "0912345678",
  role: "member", // member | admin
  status: "online", // online | offline | away
  lastSeen: Timestamp,
  createdAt: Timestamp
}
```

### Collection: `conversations`

```javascript
{
  id: "auto-generated",
  type: "direct", // direct | group
  members: ["uid1", "uid2"], // Array of user IDs
  memberDetails: {
    "uid1": { name: "User 1", avatar: "..." },
    "uid2": { name: "User 2", avatar: "..." }
  },
  lastMessage: {
    text: "Last message text",
    senderId: "uid1",
    senderName: "User 1",
    timestamp: Timestamp
  },
  unreadCount: {
    "uid1": 0,
    "uid2": 2
  },
  updatedAt: Timestamp,
  createdAt: Timestamp
}
```

### SubCollection: `conversations/{conversationId}/messages`

```javascript
{
  id: "auto-generated",
  senderId: "uid1",
  senderName: "Nguyễn Văn A",
  senderAvatar: "https://...",
  text: "Message content",
  imageUrl: "https://... (optional)",
  type: "text", // text | image | system
  status: "sent", // sent | delivered | read
  createdAt: Timestamp
}
```

### Collection: `departments`

```javascript
{
  id: "engineering",
  name: "Engineering",
  description: "Phòng Kỹ Thuật",
  icon: "💻",
  members: ["uid1", "uid2", "uid3"], // Array of user IDs
  conversationId: "dept_engineering", // Link to group chat
  createdAt: Timestamp
}
```

### SubCollection: `departments/{departmentId}/messages`

```javascript
// Same structure as conversation messages
{
  id: "auto-generated",
  senderId: "uid1",
  senderName: "Nguyễn Văn A",
  senderAvatar: "https://...",
  text: "Message in department",
  createdAt: Timestamp
}
```

### Collection: `announcements`

```javascript
{
  id: "auto-generated",
  title: "Thông báo nghỉ lễ",
  content: "Công ty nghỉ lễ từ ngày...",
  priority: "normal", // normal | urgent
  createdBy: "uid_admin",
  createdByName: "Admin Name",
  targetDepartments: [], // Empty = all, or ["Engineering", "HR"]
  readBy: ["uid1", "uid2"], // Array of users who read
  createdAt: Timestamp
}
```

### Collection: `presence` (for online status)

```javascript
{
  uid: "user_id",
  status: "online",
  lastSeen: Timestamp
}
```

---

## 🎯 BACKLOG CHI TIẾT THEO NGÀY

---

## 📅 **NGÀY 1: FOUNDATION & AUTHENTICATION**

### **Task 1.1: Setup Project (2h)**

**Prompt cho Cursor:**

```
Tạo project React Native với Expo CLI:
- Name: MiniCorpChat
- Install dependencies: @react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs
- Install Firebase: firebase
- Install UI: @react-native-async-storage/async-storage, react-native-vector-icons
- Setup folder structure theo cấu trúc đã định nghĩa
- Tạo file firebase.config.js với template Firebase config
```

**Checklist:**

- [ ] Init Expo project: `npx create-expo-app MiniCorpChat`
- [ ] Install dependencies:

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install firebase
npm install @react-native-async-storage/async-storage
npx expo install react-native-screens react-native-safe-area-context
```

- [ ] Create folder structure
- [ ] Create `firebase.config.js`

---

### **Task 1.2: Firebase Setup (1h)**

**Prompt cho Cursor:**

```
Setup Firebase cho project:
1. Tạo file src/services/firebase.js với:
   - Initialize Firebase app
   - Export auth, db (Firestore), storage
   - Setup persistence
2. Tạo file .env để lưu Firebase credentials
3. Add .env vào .gitignore
```

**Code: `firebase.config.js`**

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

**Code: `src/services/firebase.js`**

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "../../firebase.config";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**Manual Steps:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project "MiniCorpChat"
3. Enable Authentication > Email/Password
4. Create Firestore Database (Start in production mode)
5. Create Storage bucket
6. Copy config to `firebase.config.js`

---

### **Task 1.3: Auth Service (2h)**

**Prompt cho Cursor:**

```
Tạo file src/services/authService.js với các functions:
- signUp(email, password, name, department, phone): Register user
- signIn(email, password): Login
- signOut(): Logout
- resetPassword(email): Send reset email
- updateUserProfile(uid, data): Update profile
- getCurrentUser(): Get current user
Tất cả functions phải có error handling và return { success, data, error }
```

**Code: `src/services/authService.js`**

```javascript
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export const signUp = async (email, password, name, department, phone) => {
  try {
    // Validate email domain (optional)
    if (!email.endsWith("@minicorp.com")) {
      throw new Error("Chỉ email @minicorp.com mới được đăng ký");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      name,
      department,
      phone,
      position: "",
      avatar: "",
      role: "member",
      status: "online",
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update status to online
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      status: "online",
      lastSeen: serverTimestamp(),
    });

    return { success: true, data: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Update status to offline before signing out
      await updateDoc(doc(db, "users", user.uid), {
        status: "offline",
        lastSeen: serverTimestamp(),
      });
    }
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};
```

---

### **Task 1.4: Auth Context (1h)**

**Prompt cho Cursor:**

```
Tạo src/context/AuthContext.js với:
- AuthProvider component
- useAuth hook
- State: user, loading, isAuthenticated
- Functions: login, register, logout, resetPassword
- Listen to auth state changes
```

**Code: `src/context/AuthContext.js`**

```javascript
import React, { createContext, useState, useEffect, useContext } from "react";
import {
  onAuthChanged,
  signIn,
  signUp,
  signOut,
  resetPassword,
} from "../services/authService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return await signIn(email, password);
  };

  const register = async (email, password, name, department, phone) => {
    return await signUp(email, password, name, department, phone);
  };

  const logout = async () => {
    return await signOut();
  };

  const resetPass = async (email) => {
    return await resetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        resetPassword: resetPass,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

### **Task 1.5: Auth Screens UI (3h)**

**Prompt cho Cursor:**

```
Tạo 3 screens trong src/screens/auth/:

1. LoginScreen.js:
   - Email input
   - Password input (secure)
   - Login button
   - "Quên mật khẩu?" link
   - "Chưa có tài khoản? Đăng ký" link
   - Show loading và error messages

2. RegisterScreen.js:
   - Email input (@minicorp.com)
   - Password input (min 6 chars)
   - Confirm password
   - Họ tên
   - Số điện thoại
   - Dropdown chọn phòng ban: HR, Engineering, Sales, Marketing
   - Register button
   - "Đã có tài khoản? Đăng nhập" link

3. ForgotPasswordScreen.js:
   - Email input
   - Gửi link reset button
   - Success message

Tất cả screens dùng useAuth hook và handle errors properly
```

**Code: `src/screens/auth/LoginScreen.js`**

```javascript
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Đăng nhập thất bại", result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>MiniCorp Chat</Text>
        <Text style={styles.subtitle}>Đăng nhập vào tài khoản</Text>

        <TextInput
          style={styles.input}
          placeholder="Email (@minicorp.com)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.link}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
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
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
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
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#007AFF",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
  },
});
```

**Code: `src/screens/auth/RegisterScreen.js`**

```javascript
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../context/AuthContext";

const DEPARTMENTS = ["HR", "Engineering", "Sales", "Marketing"];

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    department: "Engineering",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    const { email, password, confirmPassword, name, phone, department } =
      formData;

    // Validation
    if (!email || !password || !name || !phone) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!email.endsWith("@minicorp.com")) {
      Alert.alert("Lỗi", "Email phải có đuôi @minicorp.com");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    const result = await register(email, password, name, department, phone);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Đăng ký thất bại", result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>

        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Email (@minicorp.com)"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.department}
            onValueChange={(value) =>
              setFormData({ ...formData, department: value })
            }
          >
            {DEPARTMENTS.map((dept) => (
              <Picker.Item key={dept} label={dept} value={dept} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Xác nhận mật khẩu"
          value={formData.confirmPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, confirmPassword: text })
          }
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#007AFF",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    color: "#007AFF",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
  },
});
```

---

### **Task 1.6: Navigation Setup (1h)**

**Prompt cho Cursor:**

```
Tạo navigation structure:
1. src/navigation/AuthNavigator.js: Stack navigator cho Login, Register, ForgotPassword
2. src/navigation/MainNavigator.js: Bottom tabs cho Home, Departments, Notifications, Profile
3. App.js: Root navigator switch giữa Auth và Main dựa vào isAuthenticated

Install: npm install @react-native-picker/picker
```

**Code: `App.js`**

```javascript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import AuthNavigator from "./src/navigation/AuthNavigator";
import MainNavigator from "./src/navigation/MainNavigator";
import { ActivityIndicator, View } from "react-native";

const Stack = createStackNavigator();

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

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

## ✅ **NGÀY 1 CHECKLIST**

- [ ] Project setup xong
- [ ] Firebase connected
- [ ] Auth service hoạt động
- [ ] Login/Register UI đẹp
- [ ] Navigation chuyển đổi Auth/Main
- [ ] Test: Đăng ký → Logout → Login lại

**Kết quả cuối ngày**: App có thể đăng ký, đăng nhập, đăng xuất thành công!

---
