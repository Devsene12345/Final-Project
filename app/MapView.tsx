import React, { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { treeImages, treeMarkers } from "../assets/markers";
import {
  MarkerRecord,
  TreeRecord,
  seedMarkersIfEmpty,
  subscribeAllTrees,
  subscribeMarkers,
} from "./Services/rtdb";

type StaticMarkerWithImage = MarkerRecord & {
  image?: any;
};

function attachImage(marker: MarkerRecord): StaticMarkerWithImage {
  return {
    ...marker,
    image: treeImages[marker.id] ?? treeImages[1],
  };
}

function pinColor(risk: "Low" | "Medium" | "High") {
  if (risk === "High") return "red";
  if (risk === "Medium") return "orange";
  return "blue";
}

export default function MapViewScreen() {
  const [markers, setMarkers] = useState<StaticMarkerWithImage[]>(
    treeMarkers.map((marker) => ({
      id: marker.id,
      description: marker.description,
      latitude: marker.latitude,
      longitude: marker.longitude,
      height: marker.height,
      risklevel: marker.risklevel,
      image: marker.image,
      imageUrl: null,
    })),
  );

  const [userTrees, setUserTrees] = useState<TreeRecord[]>([]);

  useEffect(() => {
    const seed = async () => {
      const rows: MarkerRecord[] = treeMarkers.map((marker) => ({
        id: marker.id,
        description: marker.description,
        latitude: marker.latitude,
        longitude: marker.longitude,
        height: marker.height,
        risklevel: marker.risklevel,
        imageUrl: null,
      }));

      await seedMarkersIfEmpty(rows);
    };

    seed().catch(() => undefined);

    const unsubscribeMarkers = subscribeMarkers((rows) => {
      setMarkers(rows.map(attachImage));
    });

    const unsubscribeTrees = subscribeAllTrees((rows) => {
      setUserTrees(rows);
    });

    return () => {
      unsubscribeMarkers();
      unsubscribeTrees();
    };
  }, []);

  const initialRegion = useMemo(
    () => ({
      latitude: markers[0]?.latitude ?? 6.991,
      longitude: markers[0]?.longitude ?? 81.056,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }),
    [markers],
  );

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {markers.map((marker) => (
          <Marker
            key={`static-${marker.id}`}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            pinColor={pinColor(marker.risklevel)}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                {marker.image ? (
                  <Image source={marker.image} style={styles.image} />
                ) : null}
                <Text style={styles.calloutTitle}>{marker.description}</Text>
                <Text style={styles.calloutText}>
                  Height: {marker.height} m
                </Text>
                <Text style={styles.calloutText}>Risk: {marker.risklevel}</Text>
                <Text style={styles.calloutText}>
                  Lat: {marker.latitude.toFixed(5)} | Lng:{" "}
                  {marker.longitude.toFixed(5)}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {userTrees.map((tree) => (
          <Marker
            key={`tree-${tree.id}`}
            coordinate={{
              latitude: tree.latitude,
              longitude: tree.longitude,
            }}
            pinColor={pinColor(tree.riskLevel)}
          >
            <Callout tooltip>
              <View style={styles.callout}>
                {tree.photoUrls?.[0] ? (
                  <Image
                    source={{ uri: tree.photoUrls[0] }}
                    style={styles.image}
                  />
                ) : null}
                <Text style={styles.calloutTitle}>{tree.species}</Text>
                <Text style={styles.calloutText}>Health: {tree.health}</Text>
                <Text style={styles.calloutText}>Risk: {tree.riskLevel}</Text>
                <Text style={styles.calloutText}>
                  Added by: {tree.createdByName ?? "User"}
                </Text>
                {!!tree.notes && (
                  <Text style={styles.calloutText}>Notes: {tree.notes}</Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Trees in Badulla</Text>
        <Text style={styles.legendItem}>🔵 Low</Text>
        <Text style={styles.legendItem}>🟠 Medium</Text>
        <Text style={styles.legendItem}>🔴 High</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  legend: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.72)",
    padding: 12,
    borderRadius: 12,
  },
  legendTitle: {
    color: "#fff",
    fontWeight: "800",
    marginBottom: 6,
  },
  legendItem: {
    color: "#fff",
    marginBottom: 4,
  },
  callout: {
    width: 240,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
  },
  image: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#ddd",
  },
  calloutTitle: {
    fontWeight: "800",
    marginBottom: 4,
    fontSize: 15,
  },
  calloutText: {
    fontWeight: "600",
    color: "#555",
    marginBottom: 2,
  },
});
