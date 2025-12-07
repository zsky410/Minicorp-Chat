import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function MessageInput({ onSend, onImagePick, onTyping, disabled = false, placeholder = "Nhập tin nhắn..." }) {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Clear timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (value) => {
    setText(value);

    if (onTyping) {
      // User is typing
      onTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 3000);
    }
  };

  const handleSend = () => {
    if (text.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSend(text.trim());
      setText("");

      // Stop typing
      if (onTyping) {
        onTyping(false);
      }

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        {onImagePick && (
          <TouchableOpacity style={styles.imageButton} onPress={onImagePick}>
            <Ionicons name="image" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          placeholder={placeholder}
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
          editable={!disabled}
        />

        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || disabled) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
        >
          <Ionicons
            name="send"
            size={20}
            color={text.trim() ? "#fff" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "flex-end",
  },
  imageButton: {
    padding: 8,
    marginRight: 5,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
});

