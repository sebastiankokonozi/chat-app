import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useChatStore } from "../store/chatStore";
import { Id } from "../convex/_generated/dataModel";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";

interface QRCodeScannerProps {
  onJoin: (chatRoomId: Id<"chatRooms">) => void;
}

export function QRCodeScanner({ onJoin }: QRCodeScannerProps) {
  const [processing, setProcessing] = useState(false);
  const [chatRoomCode, setChatRoomCode] = useState("");
  const { deviceId } = useChatStore();
  const joinChatRoom = useMutation(api.chatRooms.join);

  const extractChatRoomId = (data: string): Id<"chatRooms"> | null => {
    try {
      const { path } = Linking.parse(data);

      if (path && path.startsWith("chat/")) {
        return path.replace("chat/", "") as Id<"chatRooms">;
      }

      if (data.match(/^[a-zA-Z0-9]+$/)) {
        return data as Id<"chatRooms">;
      }

      return null;
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      return null;
    }
  };

  const handleJoinChatRoom = async (chatRoomId: Id<"chatRooms">) => {
    setProcessing(true);

    try {
      await joinChatRoom({ chatRoomId, userId: deviceId });
      Alert.alert("Success", "Successfully joined the chat room!");
      onJoin(chatRoomId);
    } catch (error) {
      console.error("Failed to join chat room:", error);
      Alert.alert(
        "Error",
        "Failed to join this chat room. It may not exist or you might be having connectivity issues.",
        [
          {
            text: "Try Again",
            onPress: () => {
              setProcessing(false);
            },
          },
          {
            text: "OK",
            onPress: () => {
              setProcessing(false);
            },
          },
        ]
      );
    }
  };

  const handleManualJoin = async () => {
    if (!chatRoomCode.trim()) {
      Alert.alert("Error", "Please enter a valid chat room code");
      return;
    }

    const cleanedCode = chatRoomCode.trim();

    const chatRoomId = extractChatRoomId(cleanedCode);

    if (!chatRoomId) {
      Alert.alert("Error", "Invalid chat room code format");
      return;
    }

    setChatRoomCode("");
    await handleJoinChatRoom(chatRoomId);
  };

  if (processing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Joining chat room...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Ionicons name="qr-code" size={100} color="#007AFF" />
          <Text style={styles.title}>Enter Chat Room Code</Text>
          <Text style={styles.subtitle}>
            Enter a chat room code or URL to join a conversation
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            value={chatRoomCode}
            onChangeText={setChatRoomCode}
            placeholder="Enter code or URL"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleManualJoin}
            disabled={!chatRoomCode.trim()}
          >
            <Text style={styles.joinButtonText}>Join Chat Room</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Chat room codes can be found in the share screen of any chat room,
            or by scanning a QR code shared by another user.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  joinButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  helpContainer: {
    paddingHorizontal: 20,
  },
  helpText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
});
