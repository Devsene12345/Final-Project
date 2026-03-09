import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "./context/AuthContext";
import AdminPanel from "./AdminPanel";

export default function AdminScreen() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Admin access only</Text>
      </View>
    );
  }

  return <AdminPanel />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
