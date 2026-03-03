// app/(tabs)/add-tree.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function AddTreeTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Tree</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/modal")}
      >
        <Text style={styles.btnText}>Open Add Tree Form</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        New trees go to admin verification before appearing on map/analytics.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  btn: {
    backgroundColor: "#18bd16",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
  note: { textAlign: "center", color: "#666" },
});
