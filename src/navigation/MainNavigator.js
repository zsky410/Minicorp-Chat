import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  subscribeToAnnouncements,
  getUnreadCount,
  getUserAnnouncements,
} from "../services/announcementService";

// Screens
import HomeScreen from "../screens/main/HomeScreen";
import ChatScreen from "../screens/main/ChatScreen";
import DepartmentsScreen from "../screens/main/DepartmentsScreen";
import DepartmentChatScreen from "../screens/main/DepartmentChatScreen";
import NotificationsScreen from "../screens/main/NotificationsScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import EditProfileScreen from "../screens/main/EditProfileScreen";
import CreateAnnouncementScreen from "../screens/admin/CreateAnnouncementScreen";

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

// Home Stack Navigator
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
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
        }}
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

// Notification Stack Navigator
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

// Profile Stack Navigator
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
    if (!user?.uid || !user?.department) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToAnnouncements((announcements) => {
      const userAnnouncements = getUserAnnouncements(
        announcements,
        user.department
      );
      const count = getUnreadCount(
        userAnnouncements,
        user.uid,
        user.department
      );
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.department]);

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
            <View style={{ position: "relative" }}>
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
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
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
