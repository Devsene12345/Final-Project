// app/MapView.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

// ✅ import markers
import { treeMarkers } from "../assets/markers"; // adjust path if your markers.tsx is elsewhere

export default function MapViewScreen() {
  const initialRegion = useMemo(
    () => ({
      latitude: treeMarkers[0]?.latitude ?? 6.989,
      longitude: treeMarkers[0]?.longitude ?? 81.055,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {treeMarkers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            description={m.description ?? `Risk: ${m.risklevel ?? "N/A"}`}
          />
        ))}
      </MapView>

      <View style={styles.bottom}>
        <Text style={styles.bottomText}>Markers: {treeMarkers.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  bottom: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  bottomText: { color: "#fff", fontWeight: "700" },
});
