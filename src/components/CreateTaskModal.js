import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUsersByDepartment } from "../services/userService";

export default function CreateTaskModal({
  visible,
  onClose,
  onSubmit,
  departmentId,
  currentUserId,
  currentUserName,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState("medium");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible && departmentId) {
      loadUsers();
    }
  }, [visible, departmentId]);

  const loadUsers = async () => {
    // Get department info first
    const { getDepartmentById } = require("../services/departmentService");
    const deptResult = await getDepartmentById(departmentId);

    if (deptResult.success) {
      const deptName = deptResult.data.name;
      const result = await getUsersByDepartment(deptName);
      if (result.success) {
        setUsers(result.data.filter((u) => u.id !== currentUserId));
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
      return;
    }

    if (!assignedTo) {
      Alert.alert("Lỗi", "Vui lòng chọn người được assign");
      return;
    }

    setLoading(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      assignedByName: currentUserName,
      assignedBy: currentUserId,
      dueDate: dueDate,
      priority,
    });
    setLoading(false);

    // Reset form
    setTitle("");
    setDescription("");
    setAssignedTo("");
    setDueDate(new Date());
    setPriority("medium");
  };

  const selectedUser = users.find((u) => u.id === assignedTo);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Tạo Task Mới</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiêu đề *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề task"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập mô tả chi tiết"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assign cho *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  Alert.alert(
                    "Chọn người",
                    users.map((u) => u.name).join("\n"),
                    [
                      { text: "Hủy", style: "cancel" },
                      ...users.map((u) => ({
                        text: u.name,
                        onPress: () => setAssignedTo(u.id),
                      })),
                    ]
                  );
                }}
              >
                <Text style={selectedUser ? styles.selectText : styles.placeholder}>
                  {selectedUser ? selectedUser.name : "Chọn người được assign"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hạn chót</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.selectText}>
                  {dueDate.toLocaleDateString("vi-VN")}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
              {showDatePicker && (
                <Modal
                  visible={showDatePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.datePickerModal}>
                    <View style={styles.datePickerContent}>
                      <View style={styles.datePickerHeader}>
                        <Text style={styles.datePickerTitle}>Chọn ngày</Text>
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.dateInputRow}>
                        <TextInput
                          style={styles.dateInput}
                          placeholder="Ngày (1-31)"
                          keyboardType="numeric"
                          maxLength={2}
                          value={dueDate.getDate().toString().padStart(2, "0")}
                          onChangeText={(day) => {
                            const d = new Date(dueDate);
                            d.setDate(parseInt(day) || 1);
                            setDueDate(d);
                          }}
                        />
                        <Text style={styles.dateSeparator}>/</Text>
                        <TextInput
                          style={styles.dateInput}
                          placeholder="Tháng (1-12)"
                          keyboardType="numeric"
                          maxLength={2}
                          value={(dueDate.getMonth() + 1).toString().padStart(2, "0")}
                          onChangeText={(month) => {
                            const d = new Date(dueDate);
                            d.setMonth((parseInt(month) || 1) - 1);
                            setDueDate(d);
                          }}
                        />
                        <Text style={styles.dateSeparator}>/</Text>
                        <TextInput
                          style={styles.dateInput}
                          placeholder="Năm"
                          keyboardType="numeric"
                          maxLength={4}
                          value={dueDate.getFullYear().toString()}
                          onChangeText={(year) => {
                            const d = new Date(dueDate);
                            d.setFullYear(parseInt(year) || new Date().getFullYear());
                            setDueDate(d);
                          }}
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.datePickerConfirmButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.datePickerConfirmText}>Xác nhận</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Độ ưu tiên</Text>
              <View style={styles.priorityRow}>
                {["low", "medium", "high"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      priority === p && styles.priorityButtonActive,
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        priority === p && styles.priorityTextActive,
                      ]}
                    >
                      {p === "low" ? "Thấp" : p === "medium" ? "Trung" : "Cao"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Tạo Task</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  selectText: {
    fontSize: 16,
    color: "#333",
  },
  placeholder: {
    fontSize: 16,
    color: "#999",
  },
  priorityRow: {
    flexDirection: "row",
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  priorityButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  priorityText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  priorityTextActive: {
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  datePickerModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "center",
    minWidth: 60,
    marginHorizontal: 5,
  },
  dateSeparator: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 5,
  },
  datePickerConfirmButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  datePickerConfirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

