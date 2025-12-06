import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToMessages,
  sendMessage,
  markAsRead,
} from "../../services/chatService";
import { auth } from "../../services/firebase";
import ChatBubble from "../../components/ChatBubble";
import MessageInput from "../../components/MessageInput";

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUserId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!conversationId || !user?.uid) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Mark as read when entering chat
    markAsRead(conversationId, user.uid);

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(conversationId, (data) => {
      // Check if component is still mounted and user is still authenticated
      if (!isMounted || !auth.currentUser) return;

      setMessages(data);
      setLoading(false);

      // Scroll to bottom when new message arrives
      setTimeout(() => {
        if (flatListRef.current && isMounted) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }, 100);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [conversationId, user?.uid]);

  const handleSend = async (text) => {
    if (!text.trim() || !user?.uid) return;

    const senderData = {
      name: user.name,
      avatar: user.avatar,
    };

    await sendMessage(conversationId, user.uid, senderData, text);

    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.senderId === user?.uid;
    return <ChatBubble message={item} isOwn={isOwn} />;
  };

  if (loading || !user?.uid) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />
      <MessageInput onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    padding: 15,
  },
});

