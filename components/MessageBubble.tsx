import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Message } from "../types/chat";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  status?: "sending" | "sent" | "error";
}

export function MessageBubble({ message, isOwn, status }: MessageBubbleProps) {
  const renderStatusIndicator = () => {
    if (!isOwn || !status) return null;

    switch (status) {
      case "sending":
        return (
          <ActivityIndicator
            size="small"
            color="rgba(255, 255, 255, 0.7)"
            style={styles.statusIndicator}
          />
        );
      case "sent":
        return (
          <Ionicons
            name="checkmark-done"
            size={14}
            color="rgba(255, 255, 255, 0.7)"
            style={styles.statusIndicator}
          />
        );
      case "error":
        return (
          <Ionicons
            name="alert-circle"
            size={14}
            color="#FF3B30"
            style={styles.statusIndicator}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {!isOwn && <Text style={styles.sender}>{message.senderName}</Text>}
      <View
        style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}
      >
        <Text
          style={[
            styles.content,
            isOwn ? styles.ownContent : styles.otherContent,
          ]}
        >
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              isOwn ? styles.ownTimestamp : styles.otherTimestamp,
            ]}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {renderStatusIndicator()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  ownContainer: {
    alignItems: "flex-end",
  },
  otherContainer: {
    alignItems: "flex-start",
  },
  sender: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    marginLeft: 12,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 20,
    padding: 12,
  },
  ownBubble: {
    backgroundColor: "#007AFF",
  },
  otherBubble: {
    backgroundColor: "#E9E9EB",
  },
  content: {
    fontSize: 16,
    marginBottom: 4,
  },
  ownContent: {
    color: "#fff",
  },
  otherContent: {
    color: "#000",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  timestamp: {
    fontSize: 11,
  },
  ownTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherTimestamp: {
    color: "#666",
  },
  statusIndicator: {
    marginLeft: 4,
  },
});
