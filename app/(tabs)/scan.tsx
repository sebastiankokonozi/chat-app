import React from "react";
import { View, StyleSheet, Text, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { QRCodeScanner } from "../../components/QRCodeScanner";
import { Id } from "../../convex/_generated/dataModel";

export default function ScanScreen() {
  const router = useRouter();

  const handleJoin = (chatRoomId: Id<"chatRooms">) => {
    router.push(`/chat/${chatRoomId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join Chat Room</Text>
        <Text style={styles.subtitle}>
          Enter a chat room code to join the conversation
        </Text>
      </View>
      <View style={styles.scannerContainer}>
        <QRCodeScanner onJoin={handleJoin} />
      </View>
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
    backgroundColor: "#f8f8f8",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  scannerContainer: {
    flex: 1,
  },
});
