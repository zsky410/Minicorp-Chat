import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DepartmentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Departments Screen</Text>
      <Text style={styles.subtext}>Sẽ được implement trong Day 3</Text>
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
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: "#666",
  },
});

