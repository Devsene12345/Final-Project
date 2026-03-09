import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  resolveAlert,
  subscribeActiveAlerts,
  AlertRecord,
} from "../Services/rtdb";
import { useAuth } from "../context/AuthContext";

export default function AlertsScreen() {
  const { isAdmin, firebaseUser } = useAuth();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeActiveAlerts(setAlerts, (error) =>
      Alert.alert("Error", String(error)),
    );
    return unsubscribe;
  }, []);

  const handleResolve = async (alertId: string) => {
    if (!firebaseUser?.uid) return;

    try {
      await resolveAlert(alertId, firebaseUser.uid);
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to resolve alert.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Alerts</Text>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No active alerts.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.level}>{item.level}</Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.location}>
              Lat: {item.latitude.toFixed(5)} | Lng: {item.longitude.toFixed(5)}
            </Text>

            {isAdmin ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleResolve(item.id)}
              >
                <Text style={styles.buttonText}>Resolve Alert</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },
  empty: {
    color: "#666",
    textAlign: "center",
    marginTop: 32,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 5,
  },
  level: {
    fontWeight: "900",
    color: "#c10000",
  },
  message: {
    fontWeight: "600",
  },
  location: {
    color: "#666",
  },
  button: {
    marginTop: 8,
    backgroundColor: "#1b6e21",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
