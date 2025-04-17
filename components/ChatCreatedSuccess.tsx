import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { Id } from "../convex/_generated/dataModel";

interface ChatCreatedSuccessProps {
  chatRoomId: Id<"chatRooms">;
  chatName: string;
  onClose: () => void;
}

export function ChatCreatedSuccess({
  chatRoomId,
  chatName,
  onClose,
}: ChatCreatedSuccessProps) {
  const router = useRouter();
  const deepLink = Linking.createURL(`chat/${chatRoomId}`);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my chat "${chatName}" using this link: ${deepLink}`,
      });
    } catch (error) {
      console.error("Error sharing chat link:", error);
    }
  };

  const navigateToChat = () => {
    onClose();
    router.push(`/chat/${chatRoomId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Room Created!</Text>
      <Text style={styles.chatName}>{chatName}</Text>

      <View style={styles.qrContainer}>
        <QRCodeGenerator chatRoomId={chatRoomId} size={200} />
      </View>

      <Text style={styles.instruction}>
        Share this QR code or link with others to join your chat
      </Text>

      <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
        {deepLink}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>Share Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={navigateToChat}
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            Open Chat
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  chatName: {
    fontSize: 18,
    color: "#555",
    marginBottom: 20,
  },
  qrContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instruction: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  linkText: {
    fontSize: 14,
    color: "#007AFF",
    backgroundColor: "#F0F0F0",
    padding: 10,
    borderRadius: 6,
    width: "100%",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "white",
  },
});
