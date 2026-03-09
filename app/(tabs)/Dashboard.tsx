import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  subscribeActiveAlerts,
  subscribeVerifiedTrees,
  TreeRecord,
  AlertRecord,
} from "../Services/rtdb";
import { useAuth } from "../context/AuthContext";

export default function DashboardScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const [trees, setTrees] = useState<TreeRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  useEffect(() => {
    const unsubscribeTrees = subscribeVerifiedTrees(setTrees, (error) =>
      Alert.alert("Error", String(error)),
    );

    const unsubscribeAlerts = subscribeActiveAlerts(setAlerts, (error) =>
      Alert.alert("Error", String(error)),
    );

    return () => {
      unsubscribeTrees();
      unsubscribeAlerts();
    };
  }, []);

  const stats = useMemo(() => {
    const riskTrees = trees.filter((tree) => tree.riskLevel === "High").length;
    return {
      totalTrees: trees.length,
      riskTrees,
    };
  }, [trees]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌳 Tree Monitoring Dashboard</Text>

      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: "#e8f8ee" }]}>
          <Text style={styles.cardLabel}>Total Trees</Text>
          <Text style={styles.cardValue}>{stats.totalTrees}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#ffe8e8" }]}>
          <Text style={styles.cardLabel}>Risk Trees</Text>
          <Text style={styles.cardValue}>{stats.riskTrees}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/map")}
      >
        <Text style={styles.buttonText}>Open Tree Map</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/modal")}
      >
        <Text style={styles.buttonText}>Add Tree</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Alerts</Text>
      {alerts.length === 0 ? (
        <Text style={styles.empty}>No active alerts.</Text>
      ) : null}

      {alerts.slice(0, 5).map((alert) => (
        <View key={alert.id} style={styles.alertCard}>
          <Text style={styles.alertLevel}>{alert.level}</Text>
          <Text style={styles.alertMessage}>{alert.message}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#555" }]}
        onPress={async () => {
          await logout();
          router.replace("/Login");
        }}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  cardLabel: {
    fontWeight: "700",
    color: "#333",
  },
  cardValue: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#1b6e21",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },
  empty: {
    color: "#666",
  },
  alertCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ececec",
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  alertLevel: {
    fontWeight: "800",
    color: "#b10000",
  },
  alertMessage: {
    color: "#333",
  },
});
