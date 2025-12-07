import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Avatar from "./Avatar";

export default function UserListItem({
  user,
  onPress,
  showDepartment = true,
}) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Avatar
        uri={user.avatar}
        name={user.name}
        size={50}
        showOnline={true}
        isOnline={user.status === "online"}
      />

      <View style={styles.content}>
        <Text style={styles.name}>{user.name}</Text>
        {showDepartment && (
          <Text style={styles.department}>{user.department}</Text>
        )}
      </View>

      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                user.status === "online" ? "#4CD964" : "#ccc",
            },
          ]}
        />
        <Text style={styles.statusText}>
          {user.status === "online" ? "Online" : "Offline"}
        </Text>
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
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: "#007AFF",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
});

