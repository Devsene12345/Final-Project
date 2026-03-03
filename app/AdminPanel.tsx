// app/(tabs)/AdminPanel.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./FirebaseConfig";
import { useAuth } from "./context/AuthContext";

type TreeDoc = {
  id: string;
  species: string;
  riskLevel?: "Low" | "Medium" | "High";
  health?: "healthy" | "at-risk";
  latitude?: number;
  longitude?: number;
  verified: boolean;
  createdBy?: string;
};

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [pending, setPending] = useState<TreeDoc[]>([]);

  useEffect(() => {
    const qPending = query(
      collection(db, "trees"),
      where("verified", "==", false),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(qPending, (snap) => {
      setPending(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });

    return () => unsub();
  }, []);

  const verifyTree = async (id: string) => {
    try {
      await updateDoc(doc(db, "trees", id), { verified: true });
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to verify");
    }
  };

  const rejectTree = async (id: string) => {
    Alert.alert("Reject", "Delete this tree submission?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "trees", id));
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Failed to delete");
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
          <Text style={{ color: "#666", marginTop: 12 }}>
            No pending trees.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.species}>{item.species}</Text>
            <Text style={styles.meta}>
              Risk: {item.riskLevel ?? "N/A"} | Health: {item.health ?? "N/A"}
            </Text>
            <Text style={styles.meta}>
              Location: {item.latitude?.toFixed(5)},{" "}
              {item.longitude?.toFixed(5)}
            </Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => verifyTree(item.id)}
              >
                <Text style={styles.btnText}>Verify</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.danger]}
                onPress={() => rejectTree(item.id)}
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
  title: { fontSize: 20, fontWeight: "900", marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  species: { fontWeight: "900", fontSize: 16 },
  meta: { color: "#666" },
  row: { flexDirection: "row", gap: 10, marginTop: 6 },
  btn: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  danger: { backgroundColor: "#b00020" },
  btnText: { color: "#fff", fontWeight: "800" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
