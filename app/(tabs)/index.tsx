import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useQuery, useMutation } from "convex/react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { api } from "../../convex/_generated/api";
import { useChatStore } from "../../store/chatStore";
import { ChatRoom } from "../../types/chat";
import { IconButton } from "../../components/IconButton";
import { Id } from "../../convex/_generated/dataModel";
import { ChatCreatedSuccess } from "../../components/ChatCreatedSuccess";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function HomeScreen() {
  const router = useRouter();
  const { deviceId, userName, setPushToken } = useChatStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdChatId, setCreatedChatId] = useState<Id<"chatRooms"> | null>(
    null
  );

  // Initialize with empty string to avoid undefined error
  const chatRooms =
    useQuery(api.chatRooms.list, { userId: deviceId || "" }) || [];
  const createChatRoom = useMutation(api.chatRooms.create);
  const upsertUser = useMutation(api.users.upsert);

  useEffect(() => {
    if (!deviceId) return;
    registerForPushNotifications();
  }, [deviceId]);

  async function registerForPushNotifications() {
    if (!Device.isDevice) {
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    setPushToken(token);
    await upsertUser({
      deviceId,
      name: userName,
      pushToken: token,
    });
  }

  const handleCreateRoom = () => {
    setNewChatName("");
    setModalVisible(true);
  };

  const createRoom = async () => {
    if (!newChatName.trim()) {
      Alert.alert("Error", "Please enter a valid room name");
      return;
    }

    try {
      const chatRoomId = await createChatRoom({
        name: newChatName.trim(),
        createdBy: deviceId,
      });

      setModalVisible(false);
      setCreatedChatId(chatRoomId);
      setSuccessModalVisible(true);
    } catch (error) {
      console.error("Failed to create chat room:", error);
      Alert.alert("Error", "Failed to create chat room");
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    setCreatedChatId(null);
  };

  const handleJoinRoom = (chatRoomId: Id<"chatRooms">) => {
    router.push(`/chat/${chatRoomId}`);
  };

  if (!deviceId) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyStateText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Create Chat Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Create Chat Room</Text>
            <TextInput
              style={styles.input}
              onChangeText={setNewChatName}
              value={newChatName}
              placeholder="Enter chat room name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonCreate]}
                onPress={createRoom}
              >
                <Text style={styles.textStyle}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={successModalVisible && createdChatId !== null}
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.successModalView}>
            {createdChatId && (
              <ChatCreatedSuccess
                chatRoomId={createdChatId}
                chatName={newChatName}
                onClose={handleCloseSuccessModal}
              />
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.title}>Chat Rooms</Text>
        <IconButton
          name="add-circle"
          size={32}
          color="#007AFF"
          onPress={handleCreateRoom}
        />
      </View>

      {chatRooms.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No chat rooms yet. Create one to get started!
          </Text>
        </View>
      ) : (
        <FlashList
          data={chatRooms}
          estimatedItemSize={70}
          renderItem={({ item }: { item: ChatRoom }) => (
            <Pressable
              style={styles.roomItem}
              onPress={() => handleJoinRoom(item._id)}
            >
              <View>
                <Text style={styles.roomName}>{item.name}</Text>
                <Text style={styles.roomInfo}>
                  {item.participantIds.length} participants
                </Text>
              </View>
              <Text style={styles.timestamp}>
                {new Date(item.lastMessageAt).toLocaleDateString()}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  roomItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  roomName: {
    fontSize: 18,
    fontWeight: "500",
  },
  roomInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  modalView: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successModalView: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: "#f0f0f0",
  },
  buttonCreate: {
    backgroundColor: "#007AFF",
  },
  textStyle: {
    fontWeight: "bold",
    color: "white",
  },
});
