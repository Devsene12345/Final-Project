// app/(tabs)/dashboard.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardScreen() {
  const router = useRouter();
  const { appUser, logout } = useAuth();

  const [trees, setTrees] = useState<{ id: string; [key: string]: any }[]>([]);
  const [alerts, setAlerts] = useState<{ id: string; [key: string]: any }[]>(
    [],
  );

  // Load verified trees
  useEffect(() => {
    const q = query(collection(db, "trees"), where("verified", "==", true));
    return onSnapshot(q, (snap) =>
      setTrees(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, []);

  // Load active alerts
  useEffect(() => {
    const qAlerts = query(
      collection(db, "alerts"),
      where("resolved", "==", false),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(qAlerts, (snap) =>
      setAlerts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, []);

  const totalTrees = trees.length;
  const riskTrees = trees.filter((t) => t.riskLevel === "High").length;

  // Species distribution
  const speciesCount = trees.reduce(
    (acc, t) => {
      const key = t.species || "Other";
      (acc as Record<string, number>)[key] =
        ((acc as Record<string, number>)[key] || 0) + 1;
      return acc;
    },
    { Oak: 0, Maple: 0, Pine: 0, Other: 0 },
  );

  const percent = (val: number) => ((val / (totalTrees || 1)) * 100).toFixed(1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ---------------- HEADER ---------------- */}
      <Text style={styles.headerTitle}>🌳 Tree Monitoring Dashboard</Text>

      {/* ---------------- CARDS ---------------- */}
      <View style={styles.cardRow}>
        <View style={[styles.infoCard, { backgroundColor: "#e8f8ee" }]}>
          <Text style={styles.cardIcon}>🍃</Text>
          <Text style={styles.cardLabel}>Total Trees</Text>
          <Text style={styles.cardNumber}>{totalTrees}</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: "#ffe8e8" }]}>
          <Text style={styles.cardIcon}>⚠️</Text>
          <Text style={styles.cardLabel}>Risk Trees</Text>
          <Text style={styles.cardNumber}>{riskTrees}</Text>
        </View>
      </View>

      {/* ---------------- MAP BUTTON ---------------- */}
      <TouchableOpacity
        style={styles.mapBtn}
        onPress={() => router.push("/map")}
      >
        <Text style={styles.mapBtnText}>Open Tree Map</Text>
      </TouchableOpacity>

      {/* ---------------- ADD TREE BUTTON ---------------- */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push("/modal")}
      >
        <Text style={styles.addBtnText}>Add Tree</Text>
      </TouchableOpacity>

      {/* ---------------- HEALTH TRENDS ---------------- */}
      <Text style={styles.sectionTitle}>Tree Health Trends</Text>
      <View style={styles.trendBox}>
        <View style={styles.trendBar}></View>
      </View>

      {/* ---------------- RECENT ALERTS ---------------- */}
      <Text style={styles.sectionTitle}>Recent Alerts</Text>

      {alerts.slice(0, 3).map((alert) => (
        <View key={alert.id} style={styles.alertCard}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  alert.level === "High"
                    ? "red"
                    : alert.level === "Medium"
                      ? "yellow"
                      : "green",
              },
            ]}
          ></View>

          <Text style={styles.alertText}>{alert.message || "Alert"}</Text>

          <Text style={styles.alertTime}>
            {formatTime(alert.createdAt?.seconds)}
          </Text>
        </View>
      ))}

      <TouchableOpacity onPress={() => router.push("/alerts")}>
        <Text style={styles.viewAll}>View All Alerts</Text>
      </TouchableOpacity>

      {/* ---------------- LOGOUT ---------------- */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => router.push("/Login")}
      >
        <Ionicons name="map" size={30} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

// Convert timestamp to "2 hours", "1 day", etc.
function formatTime(seconds: number | undefined) {
  if (!seconds) return "";
  const diff = Date.now() / 1000 - seconds;
  if (diff < 3600) return Math.floor(diff / 60) + " min";
  if (diff < 86400) return Math.floor(diff / 3600) + " hours";
  return Math.floor(diff / 86400) + " days";
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },

  // Cards
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  infoCard: {
    width: "48%",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  cardIcon: { fontSize: 26 },
  cardLabel: { fontSize: 14, color: "#333" },
  cardNumber: { fontSize: 28, fontWeight: "800", marginTop: 4 },

  // Buttons
  mapBtn: {
    backgroundColor: "#1b6e21",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },
  mapBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  addBtn: {
    backgroundColor: "#1b6e21",
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 12,
  },

  trendBox: {
    backgroundColor: "#fff",
    height: 80,
    borderRadius: 16,
    padding: 12,
    justifyContent: "center",
  },
  trendBar: {
    height: 6,
    width: "85%",
    backgroundColor: "#8fd189",
    borderRadius: 10,
  },

  barTrack: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    marginTop: 6,
  },
  barFill: {
    height: 10,
    borderRadius: 10,
  },
  speciesLabel: { fontSize: 15, fontWeight: "500" },

  // Alerts
  alertCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  alertText: { flex: 1, fontSize: 16 },
  alertTime: { color: "#666" },
  viewAll: {
    textAlign: "center",
    color: "#0a8638",
    fontWeight: "700",
    marginVertical: 12,
  },

  logoutBtn: {
    backgroundColor: "#d72626",
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
