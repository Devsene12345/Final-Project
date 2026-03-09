// app/AdminPanel.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "./context/AuthContext";
import {
  TreeRecord,
  rejectTree,
  subscribePendingTrees,
  verifyTree,
} from "./Services/rtdb";

export default function AdminPanel() {
  const { isAdmin, appUser } = useAuth();
  const [pending, setPending] = useState<TreeRecord[]>([]);

  useEffect(() => {
    const unsub = subscribePendingTrees(
      (trees) => setPending(trees),
      (e) => Alert.alert("Error", String((e as any)?.message ?? e)),
    );
    return () => unsub();
  }, []);

  const onVerify = async (id: string) => {
    if (!appUser?.uid) return;
    try {
      await verifyTree(id, appUser.uid);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to verify");
    }
  };

  const onReject = async (id: string) => {
    if (!appUser?.uid) return;
    Alert.alert("Reject", "Mark this submission as rejected?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            await rejectTree(id, appUser.uid);
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Failed to reject");
          }
        },
      },
    ]);
  };

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={{ fontWeight: "800" }}>Admin only</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={styles.title}>Admin Panel - Pending Trees</Text>

      <FlatList
        data={pending}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: "#666" }}>No pending trees.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.species}</Text>
            <Text style={styles.meta}>Risk: {item.riskLevel}</Text>
            <Text style={styles.meta}>Health: {item.health}</Text>
            <Text style={styles.meta}>
              Location: {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={() => onVerify(item.id)}
              >
                <Text style={styles.btnText}>Verify</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => onReject(item.id)}
              >
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 4,
  },
  name: { fontWeight: "900", fontSize: 16 },
  meta: { color: "#555", fontWeight: "600" },
  verifyBtn: {
    flex: 1,
    backgroundColor: "#1b6e21",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "800" },
});
