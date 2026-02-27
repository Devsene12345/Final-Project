import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function Dashboard() {
  const router = useRouter();

  // Demo Data (replace with backend later)
  const totalTrees = 1245;
  const riskTrees = 87;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>🌳 Tree Monitoring Dashboard</Text>

      {/* ===== TOP CARDS ===== */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Ionicons name="leaf" size={28} color="#2e7d32" />
          <Text style={styles.cardTitle}>Total Trees</Text>
          <Text style={styles.cardValue}>{totalTrees}</Text>
        </View>

        <View style={[styles.card, styles.riskCard]}>
          <MaterialIcons name="warning" size={28} color="red" />
          <Text style={styles.cardTitle}>Risk Trees</Text>
          <Text style={styles.cardValue}>{riskTrees}</Text>
        </View>
      </View>

      {/* ===== MAP CARD ===== */}
      <TouchableOpacity
        style={styles.mapCard}
        onPress={() => router.push("/MapView")}
      >
        <Ionicons name="map" size={30} color="#fff" />
        <Text style={styles.mapText}>Open Tree Map</Text>
      </TouchableOpacity>

      {/* ===== TREE HEALTH TRENDS ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tree Health Trends</Text>

        <View style={styles.trendBox}>
          {/* Simple Trend Placeholder Line */}
          <View style={styles.trendLine} />
        </View>
      </View>

      {/* ===== SPECIES DISTRIBUTION ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Species Distribution</Text>

        {renderBar("Oak", 80, "#2e7d32")}
        {renderBar("Maple", 60, "#a5d6a7")}
        {renderBar("Pine", 30, "#90caf9")}
        {renderBar("Other", 40, "#bdbdbd")}
      </View>

      {/* ===== RECENT ALERTS ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Alerts</Text>

        {alertItem("Disease", "2 hours", "red")}
        {alertItem("Pest", "4 hours", "#cddc39")}
        {alertItem("Water Stress", "1 Day", "#4caf50")}

        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All Alerts</Text>
        </TouchableOpacity>

        {/* ===== Logout Button ===== */}
        <TouchableOpacity
          style={styles.logout}
          onPress={() => router.push("/Login")}
        >
          <Ionicons name="map" size={30} color="#fff" />
          <Text style={styles.mapText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ===== Helper Components ===== */

const renderBar = (label: string, width: number, color: string) => (
  <View style={{ marginBottom: 10 }} key={label}>
    <Text style={{ marginBottom: 3 }}>{label}</Text>
    <View style={styles.barBackground}>
      <View
        style={[styles.barFill, { width: `${width}%`, backgroundColor: color }]}
      />
    </View>
  </View>
);

const alertItem = (title: string, time: string, color: string) => (
  <View style={styles.alertItem} key={title}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={{ flex: 1 }}>{title}</Text>
    <Text style={{ color: "gray" }}>{time}</Text>
  </View>
);

/* ===== Styles ===== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f6f8",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
    elevation: 3,
  },
  riskCard: {
    marginRight: 0,
    backgroundColor: "#ffe5e5",
  },
  cardTitle: {
    marginTop: 5,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  mapCard: {
    marginTop: 15,
    backgroundColor: "#2e7d32",
    padding: 18,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mapText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  logout: {
    marginTop: 15,
    backgroundColor: "#ec2309",
    padding: 18,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  trendBox: {
    backgroundColor: "#fff",
    height: 120,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  trendLine: {
    width: "80%",
    height: 4,
    backgroundColor: "#81c784",
  },
  barBackground: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  barFill: {
    height: 8,
    borderRadius: 5,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  viewAllBtn: {
    marginTop: 10,
    alignItems: "center",
  },
  viewAllText: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
});
