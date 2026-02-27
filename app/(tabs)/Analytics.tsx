import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import API from "../Services/api";

const screenWidth = Dimensions.get("window").width;

const TREE_COLORS: Record<string, string> = {
  "Swietenia macrophylla - Mahogany": "#4CAF50",
  "Albizia saman - Mara": "#2196F3",
  "Arecaceae - Palm": "#FF9800",
  "Cocos nucifera - Coconut": "#009688",
  "Bambusoideae - Bamboo": "#8BC34A",
  "Carica papaya - Papaya": "#FFEB3B",
  "Shorea robusta - Sal": "#795548",
  "Tectona grandis - Teak": "#607D8B",
  "Prunus serrulata - Sakura": "#E91E63",
  "Ficus religiosa - Bo": "#9C27B0",
  "Atalantia ceylanica - Werella": "#FF5722",
  "Garcinia spicata - Garseeniya": "#00BCD4",
  "Cassia fistula - Abul": "#FFC107",
  "Mesua ferrea - Vihara": "#3F51B5",
  Other: "#9E9E9E",
};

function categorizeTree(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("mahogany")) return "Swietenia macrophylla - Mahogany";
  if (desc.includes("mara")) return "Albizia saman - Mara";
  if (desc.includes("palm") || desc.includes("plam")) return "Arecaceae - Palm";
  if (desc.includes("coconut")) return "Cocos nucifera - Coconut";
  if (desc.includes("bamboo")) return "Bambusoideae - Bamboo";
  if (desc.includes("papaya")) return "Carica papaya - Papaya";
  if (desc.includes("sal")) return "Shorea robusta - Sal";
  if (desc.includes("thekka") || desc.includes("teak"))
    return "Tectona grandis - Teak";
  if (desc.includes("sakura")) return "Prunus serrulata - Sakura";
  if (desc.includes("boho") || desc.includes("bo tree"))
    return "Ficus religiosa - Bo";
  if (desc.includes("werella")) return "Atalantia ceylanica - Werella";
  if (desc.includes("garseeniya")) return "Garcinia spicata - Garseeniya";
  if (desc.includes("abul")) return "Cassia fistula - Abul";
  if (desc.includes("vihara")) return "Mesua ferrea - Vihara";
  return "Other";
}

const chartConfig = {
  backgroundColor: "#fff",
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: () => `#000`,
};

export default function Analytics() {
  const [healthChartData, setHealthChartData] = useState<any[]>([]);
  const [speciesChartData, setSpeciesChartData] = useState<any[]>([]);
  const [totalTrees, setTotalTrees] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    loadSpeciesData();
  }, []);

  // Fetches health status (healthy/critical) from backend API
  const fetchData = async () => {
    try {
      const res = await API.get("/trees/dashboard");

      const data = [
        {
          name: "Healthy",
          population: res.data.healthy,
          color: "green",
          legendFontColor: "#000",
          legendFontSize: 12,
        },
        {
          name: "Critical",
          population: res.data.critical,
          color: "red",
          legendFontColor: "#000",
          legendFontSize: 12,
        },
      ];

      setHealthChartData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Loads species distribution from the local CSV data
  // Data derived from My_Places_EPSG_32644.csv
  const loadSpeciesData = () => {
    const csvSpeciesCounts: Record<string, number> = {
      "Swietenia macrophylla - Mahogany": 5,
      "Albizia saman - Mara": 3,
      "Arecaceae - Palm": 1,
      "Cocos nucifera - Coconut": 1,
      "Bambusoideae - Bamboo": 1,
      "Carica papaya - Papaya": 1,
      "Shorea robusta - Sal": 1,
      "Tectona grandis - Teak": 1,
      "Prunus serrulata - Sakura": 1,
      "Ficus religiosa - Bo": 1,
      "Atalantia ceylanica - Werella": 1,
      "Garcinia spicata - Garseeniya": 1,
      "Cassia fistula - Abul": 1,
      "Mesua ferrea - Vihara": 1,
      Other: 3,
    };

    const total = Object.values(csvSpeciesCounts).reduce((a, b) => a + b, 0);
    setTotalTrees(total);

    const speciesData = Object.entries(csvSpeciesCounts)
      .filter(([, count]) => count > 0)
      .map(([species, count]) => ({
        name: species,
        population: count,
        color: TREE_COLORS[species] || "#9E9E9E",
        legendFontColor: "#333",
        legendFontSize: 11,
      }));

    setSpeciesChartData(speciesData);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Health Status Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tree Health Status</Text>
        {healthChartData.length > 0 ? (
          <PieChart
            data={healthChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"20"}
          />
        ) : (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>No health data available</Text>
          </View>
        )}
      </View>

      {/* Species Distribution Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compisition of Tree Species</Text>
        <Text style={styles.subtitle}>Total Mapped Trees: {totalTrees}</Text>
        <PieChart
          data={speciesChartData}
          width={screenWidth - 22}
          height={150}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
        />
      </View>

      {/* Summary Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Species Summary</Text>
        <View style={styles.statsGrid}>
          {speciesChartData.map((item) => (
            <View key={item.name} style={styles.statCard}>
              <View
                style={[styles.colorDot, { backgroundColor: item.color }]}
              />
              <Text style={styles.statName}>{item.name}</Text>
              <Text style={styles.statCount}>{item.population}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  noData: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "#aaa",
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 10,
    minWidth: "100%",
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statName: {
    fontSize: 12,
    color: "#333",
    flex: 1,
  },
  statCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a1a1a",
  },
});
