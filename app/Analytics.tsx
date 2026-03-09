import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { subscribeVerifiedTrees, TreeRecord } from "./Services/rtdb";

export default function AnalyticsScreen() {
  const [trees, setTrees] = useState<TreeRecord[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeVerifiedTrees(setTrees);
    return unsubscribe;
  }, []);

  const stats = useMemo(() => {
    const result = {
      total: trees.length,
      low: 0,
      medium: 0,
      high: 0,
      healthy: 0,
      atRisk: 0,
      critical: 0,
    };

    for (const tree of trees) {
      if (tree.riskLevel === "Low") result.low += 1;
      if (tree.riskLevel === "Medium") result.medium += 1;
      if (tree.riskLevel === "High") result.high += 1;
      if (tree.health === "healthy") result.healthy += 1;
      if (tree.health === "at-risk") result.atRisk += 1;
      if (tree.health === "critical") result.critical += 1;
    }

    return result;
  }, [trees]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Verified Trees</Text>
        <Text style={styles.value}>{stats.total}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Risk Levels</Text>
        <Text>Low: {stats.low}</Text>
        <Text>Medium: {stats.medium}</Text>
        <Text>High: {stats.high}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Health Status</Text>
        <Text>Healthy: {stats.healthy}</Text>
        <Text>At Risk: {stats.atRisk}</Text>
        <Text>Critical: {stats.critical}</Text>
      </View>
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
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e4e4e4",
    gap: 6,
  },
  label: {
    fontWeight: "800",
    fontSize: 16,
  },
  value: {
    fontWeight: "900",
    fontSize: 34,
  },
});
