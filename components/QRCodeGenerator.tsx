import React from "react";
import { View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Linking from "expo-linking";

interface QRCodeGeneratorProps {
  chatRoomId: string;
  size?: number;
}

export function QRCodeGenerator({
  chatRoomId,
  size = 200,
}: QRCodeGeneratorProps) {
  const deepLink = Linking.createURL(`chat/${chatRoomId}`);

  return (
    <View style={styles.container}>
      <QRCode
        value={deepLink}
        size={size}
        backgroundColor="white"
        color="black"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },
});
