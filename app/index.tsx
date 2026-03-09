import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function IndexScreen() {
  const router = useRouter();
  const { firebaseUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (firebaseUser) {
      router.replace("/(tabs)/Dashboard");
    } else {
      router.replace("/Login");
    }
  }, [firebaseUser, loading, router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <ActivityIndicator size="large" color="#1b6e21" />
    </View>
  );
}
