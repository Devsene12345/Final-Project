// app/Analytics.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./FirebaseConfig";

type TreeDoc = {
  id: string;
  riskLevel?: "Low" | "Medium" | "High";
  health?: "healthy" | "at-risk";
  verified: boolean;
};

export default function AnalyticsScreen() {
  const [trees, setTrees] = useState<TreeDoc[]>([]);

  useEffect(() => {
    const qTrees = query(
      collection(db, "trees"),
      where("verified", "==", true),
    );
    const unsub = onSnapshot(qTrees, (snap) => {
      setTrees(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const total = trees.length;
    const risk = { Low: 0, Medium: 0, High: 0 } as Record<string, number>;
    const health = { healthy: 0, "at-risk": 0 } as Record<string, number>;

    for (const t of trees) {
      if (t.riskLevel) risk[t.riskLevel] = (risk[t.riskLevel] ?? 0) + 1;
      if (t.health) health[t.health] = (health[t.health] ?? 0) + 1;
    }

    return { total, risk, health };
  }, [trees]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Analytics (Verified Trees)</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Verified Trees</Text>
        <Text style={styles.big}>{stats.total}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Risk Levels</Text>
        <Text>Low: {stats.risk.Low}</Text>
        <Text>Medium: {stats.risk.Medium}</Text>
        <Text>High: {stats.risk.High}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Health</Text>
        <Text>Healthy: {stats.health.healthy}</Text>
        <Text>At-risk: {stats.health["at-risk"]}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "800" },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  big: { fontSize: 34, fontWeight: "900" },
});
