import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import API from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const res = await API.get("/trees/dashboard");
    setData(res.data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tree Dashboard</Text>

      <Text>Total Trees: {data.totalTrees}</Text>
      <Text>Healthy: {data.healthy}</Text>
      <Text>Moderate: {data.moderate}</Text>
      <Text>Critical: {data.critical}</Text>
      <Text style={{ color: "red" }}>
        Risk Trees (Red Alert): {data.riskTrees}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
});
