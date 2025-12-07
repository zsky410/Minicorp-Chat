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
  Image,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/userService";
import { uploadAvatar } from "../../services/userService";
import Avatar from "../../components/Avatar";

export default function EditProfileScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [newAvatarUri, setNewAvatarUri] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleImagePick = async (source) => {
    try {
      let result;

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Cần quyền truy cập",
            "Vui lòng cấp quyền truy cập camera"
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Cần quyền truy cập",
            "Vui lòng cấp quyền truy cập thư viện ảnh"
          );
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        setNewAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Hủy", "Chụp ảnh", "Chọn từ thư viện"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleImagePick("camera");
          } else if (buttonIndex === 2) {
            handleImagePick("gallery");
          }
        }
      );
    } else {
      Alert.alert("Chọn ảnh", "Bạn muốn chọn ảnh từ đâu?", [
        { text: "Hủy", style: "cancel" },
        { text: "Chụp ảnh", onPress: () => handleImagePick("camera") },
        { text: "Thư viện", onPress: () => handleImagePick("gallery") },
      ]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên");
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = user?.avatar;

      // Upload new avatar if selected
      if (newAvatarUri) {
        setUploadingAvatar(true);
        const uploadResult = await uploadAvatar(user.uid, newAvatarUri);
        setUploadingAvatar(false);

        if (uploadResult.success) {
          avatarUrl = uploadResult.data;
        } else {
          Alert.alert(
            "Cảnh báo",
            "Không thể tải ảnh lên, các thông tin khác vẫn được lưu"
          );
        }
      }

      // Update profile
      const result = await updateUserProfile(user.uid, {
        name: name.trim(),
        phone: phone.trim() || null,
        avatar: avatarUrl,
      });

      setLoading(false);

      if (result.success) {
        if (refreshUser) {
          await refreshUser();
        }
        Alert.alert("Thành công", "Đã cập nhật thông tin", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("Lỗi", result.error);
      }
    } catch (error) {
      setLoading(false);
      setUploadingAvatar(false);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={showImagePickerOptions}>
            {newAvatarUri ? (
              <Image
                source={{ uri: newAvatarUri }}
                style={styles.avatarImage}
              />
            ) : (
              <Avatar uri={user?.avatar} name={user?.name} size={120} />
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarText}>Tap để thay đổi ảnh</Text>
          {uploadingAvatar && (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={{ marginTop: 10 }}
            />
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên của bạn"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Email"
              value={user?.email || ""}
              editable={false}
            />
            <Text style={styles.hint}>Email không thể thay đổi</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              Email và phòng ban do Admin quản lý. Vui lòng liên hệ Admin để thay đổi.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading || uploadingAvatar}
          >
            {loading || uploadingAvatar ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
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
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: "50%",
    marginRight: -50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    marginTop: 15,
    fontSize: 14,
    color: "#666",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  hint: {
    fontSize: 13,
    color: "#999",
    marginTop: 5,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 15,
    borderRadius: 8,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 10,
    lineHeight: 20,
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
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

