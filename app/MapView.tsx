import React, { useEffect, useState } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import { View, Text, StyleSheet } from "react-native";
import API from "./Services/api";
import { treeMarkers, TreeMarker } from "../assets/markers";

export default function MapScreen() {
  const [trees, setTrees] = useState([]);

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    try {
      const res = await API.get("/trees");
      setTrees(res.data);
    } catch (err) {
      console.error("Failed to fetch trees:", err);
    }
  };

  // Returns pin color based on riskLevel from the database
  const getMarkerColor = (risk: string) => {
    if (risk === "High") return "red";
    if (risk === "Medium") return "orange";
    return "green";
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 6.991,
          longitude: 81.0545,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        }}
      >
        {/* ── Static markers loaded from CSV (My_Places_EPSG_32644) ── */}
        {treeMarkers.map((marker: TreeMarker) => (
          <Marker
            key={`csv-${marker.id}`}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            pinColor="blue"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{marker.description}</Text>
                <Text style={styles.calloutText}>
                  Height: {marker.height} m
                </Text>
                <Text style={styles.calloutText}>
                  {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* ── Dynamic markers fetched from the backend API ── */}
        {trees.map((tree: any) => (
          <Marker
            key={`api-${tree._id}`}
            coordinate={{
              latitude: tree.latitude,
              longitude: tree.longitude,
            }}
            pinColor={getMarkerColor(tree.riskLevel)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{tree.treeName}</Text>
                <Text style={styles.calloutText}>
                  Health: {tree.healthStatus}
                </Text>
                <Text style={styles.calloutText}>Risk: {tree.riskLevel}</Text>
                {tree.height && (
                  <Text style={styles.calloutText}>
                    Height: {tree.height} m
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* ── Legend ── */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: "blue" }]} />
          <Text style={styles.legendText}>CSV / Survey Points</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: "green" }]} />
          <Text style={styles.legendText}>Low Risk</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: "orange" }]} />
          <Text style={styles.legendText}>Medium Risk</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: "red" }]} />
          <Text style={styles.legendText}>High Risk</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // Callout popup
  callout: {
    width: 200,
    padding: 6,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: "#444",
  },

  // Legend overlay
  legend: {
    position: "absolute",
    bottom: 24,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 10,
    padding: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  legendTitle: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
  },
});
