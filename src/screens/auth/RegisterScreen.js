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

