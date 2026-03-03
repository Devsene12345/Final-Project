// app/index.tsx
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "./context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { firebaseUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (firebaseUser) router.replace("../(tabs)/Dashboard");
    else router.replace("/Login");
  }, [firebaseUser, loading]);

  return (
    <View style={{ flex: 1 }}>
      <LoadingScreen text="Starting..." />
    </View>
  );
}
