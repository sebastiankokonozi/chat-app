import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChatRoom as ChatRoomComponent } from "../../components/ChatRoom";
import { QRCodeGenerator } from "../../components/QRCodeGenerator";
import { Id } from "../../convex/_generated/dataModel";

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chatRoomId = id as Id<"chatRooms">;

  const chatRoom = useQuery(api.chatRooms.get, { id: chatRoomId });

  if (!chatRoom) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chat room...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.detailsContainer}>
        <Text style={styles.chatName}>{chatRoom.name}</Text>
        <Text style={styles.chatId}>ID: {chatRoomId}</Text>
        <Text style={styles.chatCreated}>
          Created: {new Date(chatRoom.createdAt).toLocaleString()}
        </Text>
      </View>
      <View style={styles.qrContainer}>
        <QRCodeGenerator chatRoomId={chatRoomId} size={150} />
      </View>
      <ChatRoomComponent chatRoomId={chatRoomId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  chatName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  chatId: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  chatCreated: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  qrContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 1,
    margin: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
