import React, { useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Message } from "../types/chat";
import { useChatStore } from "../store/chatStore";
import { MessageBubble } from "./MessageBubble";
import { IconButton } from "./IconButton";
import { Id } from "../convex/_generated/dataModel";

interface ChatRoomProps {
  chatRoomId: Id<"chatRooms">;
}

type ExtendedMessage = Message & {
  status?: "sending" | "sent" | "error";
};

interface PendingMessage {
  localId: string;
  content: string;
  chatRoomId: Id<"chatRooms">;
  senderId: string;
  senderName: string;
  createdAt: number;
  status: "sending" | "sent" | "error";
}

export function ChatRoom({ chatRoomId }: ChatRoomProps) {
  const [message, setMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<
    Record<string, PendingMessage>
  >({});
  const [messageStatuses, setMessageStatuses] = useState<
    Record<string, "sending" | "sent" | "error">
  >({});
  const { deviceId, userName } = useChatStore();
  const listRef = useRef<FlashList<ExtendedMessage | PendingMessage> | null>(
    null
  );

  const messages =
    useQuery(api.messages.list, {
      chatRoomId,
      limit: 50,
    }) || [];

  const sendMessage = useMutation(api.messages.send);

  const extendedMessages: ExtendedMessage[] = messages.map((msg) => ({
    ...msg,
    status: messageStatuses[msg._id.toString()],
  }));

  const displayMessages: (ExtendedMessage | PendingMessage)[] = [
    ...extendedMessages,
    ...Object.values(pendingMessages),
  ].sort((a, b) => b.createdAt - a.createdAt);

  const handleSend = async () => {
    if (!message.trim()) return;

    const content = message.trim();
    setMessage("");

    const localId = Date.now().toString();
    const timestamp = Date.now();

    const pendingMessage: PendingMessage = {
      localId,
      content,
      chatRoomId,
      senderId: deviceId,
      senderName: userName,
      createdAt: timestamp,
      status: "sending",
    };

    setPendingMessages((prev) => ({
      ...prev,
      [localId]: pendingMessage,
    }));

    try {
      const messageId = await sendMessage({
        content,
        chatRoomId,
        senderId: deviceId,
        senderName: userName,
      });

      setPendingMessages((prev) => {
        const updated = { ...prev };
        delete updated[localId];
        return updated;
      });

      setMessageStatuses((prev) => ({
        ...prev,
        [messageId.toString()]: "sent",
      }));
    } catch (error) {
      console.error("Failed to send message:", error);

      setPendingMessages((prev) => ({
        ...prev,
        [localId]: {
          ...prev[localId],
          status: "error",
        },
      }));

      Alert.alert(
        "Failed to Send Message",
        "Your message couldn't be sent. Tap to retry.",
        [
          {
            text: "Retry",
            onPress: () => {
              setPendingMessages((prev) => {
                const updated = { ...prev };
                delete updated[localId];
                return updated;
              });
              setMessage(content);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>Start the conversation!</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.messageList}>
        {messages === undefined ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlashList
            ref={listRef}
            data={displayMessages}
            estimatedItemSize={70}
            renderItem={({ item }) => (
              <MessageBubble
                message={item as Message}
                isOwn={item.senderId === deviceId}
                status={item.status}
              />
            )}
            inverted={displayMessages.length > 0}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#007AFF"
                colors={["#007AFF"]}
              />
            }
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
        />
        <IconButton
          name="send"
          size={24}
          color="#007AFF"
          onPress={handleSend}
          disabled={!message.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messageList: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    maxHeight: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  emptyContainer: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    padding: 20,
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 15,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
});
