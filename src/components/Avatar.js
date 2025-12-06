import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

export default function Avatar({
  uri,
  size = 50,
  name = "",
  showOnline = false,
  isOnline = false,
}) {
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size }]}
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <Text style={[styles.initials, { fontSize: size / 2.5 }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {showOnline && isOnline && (
        <View
          style={[
            styles.onlineDot,
            { width: size / 5, height: size / 5 },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    borderRadius: 100,
  },
  placeholder: {
    borderRadius: 100,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#fff",
    fontWeight: "bold",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CD964",
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#fff",
  },
});

