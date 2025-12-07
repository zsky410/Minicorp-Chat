import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { createAnnouncement } from "../../services/announcementService";
import { canCreateCompanyAnnouncement, canCreateAnnouncement } from "../../services/permissionService";

export default function CreateAnnouncementScreen({ navigation }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [scope, setScope] = useState("department"); // "department" | "company"
  const [loading, setLoading] = useState(false);

  const canCreateCompany = canCreateCompanyAnnouncement(user);
  const canCreateDept = canCreateAnnouncement(user, user?.department);

  // Check permissions
  if (!canCreateDept && !canCreateCompany) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Bạn không có quyền tạo thông báo
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung");
      return;
    }

    setLoading(true);

    const result = await createAnnouncement(user.uid, user.name, {
      title: title.trim(),
      content: content.trim(),
      priority: isUrgent ? "urgent" : "normal",
      scope: scope, // "department" | "company"
      targetDepartments: scope === "company" ? [] : [user.department], // Empty = for all, or user's department
    });

    setLoading(false);

    if (result.success) {
      Alert.alert("Thành công", "Đã tạo thông báo", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert("Lỗi", result.error);
    }
  };

  const handlePreview = () => {
    Alert.alert(title || "Tiêu đề", content || "Nội dung", [{ text: "Đóng" }]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Tiêu đề *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tiêu đề thông báo..."
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>Nội dung *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nhập nội dung thông báo..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={10}
          maxLength={1000}
          textAlignVertical="top"
        />

        {canCreateCompany && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phạm vi</Text>
            <View style={styles.scopeRow}>
              <TouchableOpacity
                style={[
                  styles.scopeButton,
                  scope === "department" && styles.scopeButtonActive,
                ]}
                onPress={() => setScope("department")}
              >
                <Text
                  style={[
                    styles.scopeText,
                    scope === "department" && styles.scopeTextActive,
                  ]}
                >
                  Phòng ban
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.scopeButton,
                  scope === "company" && styles.scopeButtonActive,
                ]}
                onPress={() => setScope("company")}
              >
                <Text
                  style={[
                    styles.scopeText,
                    scope === "company" && styles.scopeTextActive,
                  ]}
                >
                  Toàn công ty
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Thông báo khẩn cấp</Text>
            <Text style={styles.switchSubtext}>Sẽ được highlight màu đỏ</Text>
          </View>
          <Switch
            value={isUrgent}
            onValueChange={setIsUrgent}
            trackColor={{ false: "#ccc", true: "#FF3B30" }}
            thumbColor={isUrgent ? "#fff" : "#f4f3f4"}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.previewButton]}
            onPress={handlePreview}
          >
            <Text style={styles.previewButtonText}>Xem trước</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đăng thông báo</Text>
            )}
          </TouchableOpacity>
        </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
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
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 200,
    textAlignVertical: "top",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  switchSubtext: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  scopeRow: {
    flexDirection: "row",
    gap: 10,
  },
  scopeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  scopeButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  scopeText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  scopeTextActive: {
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  previewButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  previewButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
