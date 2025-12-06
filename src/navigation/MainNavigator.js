import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Screens
import HomeScreen from "../screens/main/HomeScreen";
import ChatScreen from "../screens/main/ChatScreen";
import DepartmentsScreen from "../screens/main/DepartmentsScreen";
import DepartmentChatScreen from "../screens/main/DepartmentChatScreen";
import NotificationsScreen from "../screens/main/NotificationsScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import CreateAnnouncementScreen from "../screens/admin/CreateAnnouncementScreen";

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
        options={{ title: "Chats" }}
      />
      <HomeStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params?.userName || "Chat",
        })}
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
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator() {
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

          return <Ionicons name={iconName} size={size} color={color} />;
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
        options={{ tabBarLabel: "Thông Báo" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{ tabBarLabel: "Cá Nhân" }}
      />
    </Tab.Navigator>
  );
}
