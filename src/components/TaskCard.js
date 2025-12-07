import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TaskCard({ task, onPress, onStatusChange, canEdit = false }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#FF3B30";
      case "medium":
        return "#FF9500";
      case "low":
        return "#4CD964";
      default:
        return "#999";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4CD964";
      case "in-progress":
        return "#007AFF";
      case "pending":
        return "#FF9500";
      default:
        return "#999";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("vi-VN");
  };

  const isOverdue = task.dueDate && task.status !== "completed" && new Date(task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate) < new Date();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(task.priority) },
            ]}
          >
            <Text style={styles.priorityText}>
              {task.priority === "high" ? "Cao" : task.priority === "medium" ? "Trung" : "Thấp"}
            </Text>
          </View>
        </View>
      </View>

      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.footerText}>{task.assignedByName || "Chưa assign"}</Text>
        </View>

        {task.dueDate && (
          <View style={styles.footerRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isOverdue ? "#FF3B30" : "#666"}
            />
            <Text
              style={[
                styles.footerText,
                isOverdue && styles.overdueText,
              ]}
            >
              {formatDate(task.dueDate)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(task.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {task.status === "pending"
              ? "Chờ xử lý"
              : task.status === "in-progress"
              ? "Đang làm"
              : "Hoàn thành"}
          </Text>
        </View>

        {canEdit && task.status !== "completed" && (
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => {
              const nextStatus =
                task.status === "pending" ? "in-progress" : "completed";
              onStatusChange?.(task.id, nextStatus);
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  overdueText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusButton: {
    padding: 4,
  },
});

