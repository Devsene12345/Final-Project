// app/components/LoadingScreen.tsx
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function LoadingScreen({
  text = "Loading...",
}: {
  text?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
      }}
    >
      <ActivityIndicator size="large" />
      <Text>{text}</Text>
    </View>
  );
}
