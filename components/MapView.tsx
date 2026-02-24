import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { View, StyleSheet } from "react-native";
import API from "../services/api";

export default function MapScreen() {
  const [trees, setTrees] = useState([]);

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    const res = await API.get("/trees");
    setTrees(res.data);
  };

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
          latitude: 6.989,
          longitude: 81.055,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {trees.map((tree: any) => (
          <Marker
            key={tree._id}
            coordinate={{
              latitude: tree.latitude,
              longitude: tree.longitude,
            }}
            title={tree.treeName}
            description={`Health: ${tree.healthStatus}`}
            pinColor={getMarkerColor(tree.riskLevel)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
