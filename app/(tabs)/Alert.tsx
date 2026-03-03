// app/(tabs)/Alert.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert as RNAlert,
} from "react-native";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useAuth } from "../context/AuthContext";

type AlertDoc = {
  id: string;
  treeId?: string;
  level?: "High" | "Medium" | "Low";
  message?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: any;
  resolved?: boolean;
};

export default function AlertScreen() {
  const { isAdmin } = useAuth();
  const [alerts, setAlerts] = useState<AlertDoc[]>([]);

  useEffect(() => {
    const qAlerts = query(
      collection(db, "alerts"),
      where("resolved", "==", false),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(qAlerts, (snap) => {
      setAlerts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await updateDoc(doc(db, "alerts", id), { resolved: true });
    } catch (e: any) {
      RNAlert.alert("Error", e?.message ?? "Failed to resolve alert");
    }
  };

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={styles.title}>Active Alerts</Text>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: "#666", marginTop: 12 }}>
            No active alerts.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.level}>Level: {item.level ?? "N/A"}</Text>
            <Text style={styles.msg}>{item.message ?? "No message"}</Text>
            {item.treeId ? (
              <Text style={styles.meta}>Tree: {item.treeId}</Text>
            ) : null}

            {isAdmin ? (
              <TouchableOpacity
                style={styles.btn}
                onPress={() => resolveAlert(item.id)}
              >
                <Text style={styles.btnText}>Mark as Resolved</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.meta}>Only admins can resolve alerts.</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  level: { fontWeight: "800" },
  msg: { fontSize: 14 },
  meta: { color: "#666" },
  btn: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
