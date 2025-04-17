import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useChatStore } from "../../store/chatStore";
import { Id } from "../../convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChatRoom {
  _id: Id<"chatRooms">;
  name: string;
  createdBy: string;
  createdAt: number;
  lastMessageAt: number;
  participantIds: string[];
}

export default function ExploreScreen() {
  const router = useRouter();
  const { deviceId } = useChatStore();
  const [error, setError] = useState<string | null>(null);

  let chatRooms: ChatRoom[] | undefined;
  try {
    chatRooms = useQuery(api.chatRooms.list, { userId: deviceId || "" });
  } catch (err) {
    console.error("Error fetching chat rooms:", err);
    useEffect(() => {
      setError("Error connecting to the backend. Please try again later.");
    }, []);
    chatRooms = [];
  }

  const joinChatRoom = useMutation(api.chatRooms.join);

  const handleJoinRoom = async (chatRoomId: Id<"chatRooms">) => {
    try {
      await joinChatRoom({ chatRoomId, userId: deviceId });
      router.push(`/chat/${chatRoomId}`);
    } catch (error) {
      console.error("Failed to join chat room:", error);
      Alert.alert("Error", "Failed to join this chat room");
    }
  };

  const handleRetry = () => {
    setError(null);
    router.replace("/explore");
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => {
    const isParticipant = item.participantIds.includes(deviceId);

    return (
      <Pressable
        style={styles.roomItem}
        onPress={() => {
          if (isParticipant) {
            router.push(`/chat/${item._id}`);
          } else {
            handleJoinRoom(item._id);
          }
        }}
      >
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomParticipants}>
            {item.participantIds.length} participants
          </Text>
          <Text style={styles.roomDate}>
            Created {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.roomAction}>
          {isParticipant ? (
            <View style={[styles.badge, styles.joinedBadge]}>
              <Text style={styles.joinedBadgeText}>Joined</Text>
            </View>
          ) : (
            <Ionicons name="arrow-forward" size={24} color="#007AFF" />
          )}
        </View>
      </Pressable>
    );
  };

  const renderEmptyList = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>No chat rooms available</Text>
        <Text style={styles.emptySubText}>
          Create a new chat room from the Home tab
        </Text>
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={60} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Chats</Text>
        <Text style={styles.subtitle}>Discover and join chat rooms</Text>
      </View>

      {chatRooms === undefined ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading chat rooms...</Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={
            chatRooms.length === 0 ? { flex: 1 } : { paddingBottom: 20 }
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  roomItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  roomParticipants: {
    fontSize: 14,
    color: "#666",
  },
  roomDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  roomAction: {
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  joinedBadge: {
    backgroundColor: "#E1F5FE",
  },
  joinedBadgeText: {
    color: "#0288D1",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});
