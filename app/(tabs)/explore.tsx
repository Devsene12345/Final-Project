import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const { width } = Dimensions.get("window");

// Conditional import for MapView
let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== "web") {
  const RNMaps = require("react-native-maps");
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
}

// Default location: Badulla, Sri Lanka
const BADULLA_LOCATION = {
  latitude: 6.9934,
  longitude: 81.055,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Tree interface
interface Tree {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  species: string;
  health: "healthy" | "at-risk" | "critical";
  createdAt?: string;
}

export default function ExploreScreen() {
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid">(
    "standard"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([
    "healthy",
    "at-risk",
    "critical",
  ]);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  // Sample tree data - replace with actual API call
  useEffect(() => {
    loadTrees();
  }, []);

  const loadTrees = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('YOUR_API_ENDPOINT/trees');
      // const data = await response.json();

      // Sample data
      const sampleTrees: Tree[] = [
        {
          id: "1",
          coordinate: { latitude: 6.9934, longitude: 81.055 },
          species: "Mango Tree",
          health: "healthy",
          createdAt: "2025-01-15",
        },
        {
          id: "2",
          coordinate: { latitude: 6.9944, longitude: 81.056 },
          species: "Coconut Palm",
          health: "at-risk",
          createdAt: "2025-01-14",
        },
        {
          id: "3",
          coordinate: { latitude: 6.9924, longitude: 81.054 },
          species: "Jak Tree",
          health: "critical",
          createdAt: "2025-01-13",
        },
      ];

      setTrees(sampleTrees);
    } catch (error) {
      Alert.alert("Error", "Failed to load tree data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMapType = () => {
    const types: Array<"standard" | "satellite" | "hybrid"> = [
      "standard",
      "satellite",
      "hybrid",
    ];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const getMarkerColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "#2e7d32";
      case "at-risk":
        return "#f57c00";
      case "critical":
        return "#d32f2f";
      default:
        return "#757575";
    }
  };

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const filteredTrees = trees.filter((tree) =>
    selectedFilters.includes(tree.health)
  );

  const handleMarkerPress = (tree: Tree) => {
    setSelectedTree(tree);
  };

  const getHealthStats = () => {
    return {
      healthy: trees.filter((t) => t.health === "healthy").length,
      atRisk: trees.filter((t) => t.health === "at-risk").length,
      critical: trees.filter((t) => t.health === "critical").length,
    };
  };

  const stats = getHealthStats();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen message="Loading tree data..." />
      </SafeAreaView>
    );
  }

  // Web fallback - show list view instead of map
  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.webContainer}>
          <View style={styles.webHeader}>
            <Text style={styles.webTitle}>Tree Explorer</Text>
            <Text style={styles.webSubtitle}>
              Map view is available on mobile devices
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.webStats}>
            <Card style={styles.webStatCard}>
              <Text style={styles.webStatValue}>{trees.length}</Text>
              <Text style={styles.webStatLabel}>Total Trees</Text>
            </Card>
            <Card style={styles.webStatCard}>
              <Text style={[styles.webStatValue, { color: "#2e7d32" }]}>
                {stats.healthy}
              </Text>
              <Text style={styles.webStatLabel}>Healthy</Text>
            </Card>
            <Card style={styles.webStatCard}>
              <Text style={[styles.webStatValue, { color: "#f57c00" }]}>
                {stats.atRisk}
              </Text>
              <Text style={styles.webStatLabel}>At Risk</Text>
            </Card>
            <Card style={styles.webStatCard}>
              <Text style={[styles.webStatValue, { color: "#d32f2f" }]}>
                {stats.critical}
              </Text>
              <Text style={styles.webStatLabel}>Critical</Text>
            </Card>
          </View>

          {/* Filters */}
          <Card style={styles.webFilters}>
            <Text style={styles.filterTitle}>Filter Trees by Health</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilters.includes("healthy") &&
                    styles.filterOptionActive,
                ]}
                onPress={() => toggleFilter("healthy")}
              >
                <View
                  style={[
                    styles.filterColorBox,
                    { backgroundColor: "#2e7d32" },
                  ]}
                />
                <Text style={styles.filterOptionText}>Healthy Trees</Text>
                <Badge
                  label={stats.healthy.toString()}
                  variant="success"
                  size="small"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilters.includes("at-risk") &&
                    styles.filterOptionActive,
                ]}
                onPress={() => toggleFilter("at-risk")}
              >
                <View
                  style={[
                    styles.filterColorBox,
                    { backgroundColor: "#f57c00" },
                  ]}
                />
                <Text style={styles.filterOptionText}>At Risk Trees</Text>
                <Badge
                  label={stats.atRisk.toString()}
                  variant="warning"
                  size="small"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFilters.includes("critical") &&
                    styles.filterOptionActive,
                ]}
                onPress={() => toggleFilter("critical")}
              >
                <View
                  style={[
                    styles.filterColorBox,
                    { backgroundColor: "#d32f2f" },
                  ]}
                />
                <Text style={styles.filterOptionText}>Critical Trees</Text>
                <Badge
                  label={stats.critical.toString()}
                  variant="danger"
                  size="small"
                />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Tree List */}
          <View style={styles.webTreeList}>
            {filteredTrees.map((tree) => (
              <Card key={tree.id} style={styles.webTreeCard}>
                <View style={styles.treeInfoHeader}>
                  <View style={styles.treeInfoTitleContainer}>
                    <Ionicons
                      name="leaf"
                      size={24}
                      color={getMarkerColor(tree.health)}
                    />
                    <Text style={styles.treeInfoTitle}>{tree.species}</Text>
                  </View>
                </View>

                <View style={styles.treeInfoBody}>
                  <View style={styles.treeInfoRow}>
                    <Text style={styles.treeInfoLabel}>Health Status:</Text>
                    <Badge
                      label={tree.health.replace("-", " ")}
                      variant={
                        tree.health === "healthy"
                          ? "success"
                          : tree.health === "at-risk"
                          ? "warning"
                          : "danger"
                      }
                    />
                  </View>

                  <View style={styles.treeInfoRow}>
                    <Text style={styles.treeInfoLabel}>Location:</Text>
                    <Text style={styles.treeInfoValue}>
                      {tree.coordinate.latitude.toFixed(6)},{" "}
                      {tree.coordinate.longitude.toFixed(6)}
                    </Text>
                  </View>

                  {tree.createdAt && (
                    <View style={styles.treeInfoRow}>
                      <Text style={styles.treeInfoLabel}>Added:</Text>
                      <Text style={styles.treeInfoValue}>{tree.createdAt}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.treeInfoActions}>
                  <Button
                    title="View Details"
                    onPress={() =>
                      Alert.alert("Coming Soon", "Full tree details page")
                    }
                    size="small"
                    fullWidth
                  />
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Native (iOS/Android) - show map view
  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={BADULLA_LOCATION}
        mapType={mapType}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        toolbarEnabled={false}
      >
        {filteredTrees.map((tree) => (
          <Marker
            key={tree.id}
            coordinate={tree.coordinate}
            onPress={() => handleMarkerPress(tree)}
          >
            <View
              style={[
                styles.markerContainer,
                { backgroundColor: getMarkerColor(tree.health) },
              ]}
            >
              <Ionicons name="leaf" size={20} color="#fff" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        {/* Map Type Toggle */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleMapType}
          activeOpacity={0.7}
        >
          <Ionicons name="layers" size={24} color="#2e7d32" />
          <Text style={styles.controlButtonText}>{mapType}</Text>
        </TouchableOpacity>

        {/* Filter Toggle */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            showFilters && styles.controlButtonActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="filter"
            size={24}
            color={showFilters ? "#fff" : "#2e7d32"}
          />
          <Text
            style={[
              styles.controlButtonText,
              showFilters && styles.controlButtonTextActive,
            ]}
          >
            Filter
          </Text>
        </TouchableOpacity>

        {/* Refresh */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={loadTrees}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={24} color="#2e7d32" />
          <Text style={styles.controlButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Trees by Health</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedFilters.includes("healthy") &&
                  styles.filterOptionActive,
              ]}
              onPress={() => toggleFilter("healthy")}
            >
              <View
                style={[styles.filterColorBox, { backgroundColor: "#2e7d32" }]}
              />
              <Text style={styles.filterOptionText}>Healthy Trees</Text>
              <Badge
                label={stats.healthy.toString()}
                variant="success"
                size="small"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedFilters.includes("at-risk") &&
                  styles.filterOptionActive,
              ]}
              onPress={() => toggleFilter("at-risk")}
            >
              <View
                style={[styles.filterColorBox, { backgroundColor: "#f57c00" }]}
              />
              <Text style={styles.filterOptionText}>At Risk Trees</Text>
              <Badge
                label={stats.atRisk.toString()}
                variant="warning"
                size="small"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedFilters.includes("critical") &&
                  styles.filterOptionActive,
              ]}
              onPress={() => toggleFilter("critical")}
            >
              <View
                style={[styles.filterColorBox, { backgroundColor: "#d32f2f" }]}
              />
              <Text style={styles.filterOptionText}>Critical Trees</Text>
              <Badge
                label={stats.critical.toString()}
                variant="danger"
                size="small"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.filterNote}>Tap to show/hide trees on map</Text>
        </View>
      )}

      {/* Selected Tree Info Card */}
      {selectedTree && (
        <View style={styles.treeInfoContainer}>
          <Card style={styles.treeInfoCard}>
            <View style={styles.treeInfoHeader}>
              <View style={styles.treeInfoTitleContainer}>
                <Ionicons
                  name="leaf"
                  size={24}
                  color={getMarkerColor(selectedTree.health)}
                />
                <Text style={styles.treeInfoTitle}>{selectedTree.species}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTree(null)}>
                <Ionicons name="close-circle" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <View style={styles.treeInfoBody}>
              <View style={styles.treeInfoRow}>
                <Text style={styles.treeInfoLabel}>Health Status:</Text>
                <Badge
                  label={selectedTree.health.replace("-", " ")}
                  variant={
                    selectedTree.health === "healthy"
                      ? "success"
                      : selectedTree.health === "at-risk"
                      ? "warning"
                      : "danger"
                  }
                />
              </View>

              <View style={styles.treeInfoRow}>
                <Text style={styles.treeInfoLabel}>Location:</Text>
                <Text style={styles.treeInfoValue}>
                  {selectedTree.coordinate.latitude.toFixed(6)},{" "}
                  {selectedTree.coordinate.longitude.toFixed(6)}
                </Text>
              </View>

              {selectedTree.createdAt && (
                <View style={styles.treeInfoRow}>
                  <Text style={styles.treeInfoLabel}>Added:</Text>
                  <Text style={styles.treeInfoValue}>
                    {selectedTree.createdAt}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.treeInfoActions}>
              <Button
                title="View Details"
                onPress={() =>
                  Alert.alert("Coming Soon", "Full tree details page")
                }
                size="small"
                fullWidth
              />
            </View>
          </Card>
        </View>
      )}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{trees.length}</Text>
          <Text style={styles.statLabel}>Total Trees</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredTrees.length}</Text>
          <Text style={styles.statLabel}>Visible</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#2e7d32" }]}>
            {stats.healthy}
          </Text>
          <Text style={styles.statLabel}>Healthy</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#d32f2f" }]}>
            {stats.critical}
          </Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  controlsContainer: {
    position: "absolute",
    top: 20,
    right: 16,
    gap: 12,
  },
  controlButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    minWidth: 80,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  controlButtonActive: {
    backgroundColor: "#2e7d32",
  },
  controlButtonText: {
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "600",
    marginTop: 4,
    textTransform: "capitalize",
  },
  controlButtonTextActive: {
    color: "#fff",
  },
  filterPanel: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 100,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: 400,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  filterOptionActive: {
    borderColor: "#2e7d32",
    backgroundColor: "#e8f5e9",
  },
  filterColorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  filterOptionText: {
    flex: 1,
    fontSize: 14,
    color: "#212121",
    fontWeight: "500",
  },
  filterNote: {
    fontSize: 12,
    color: "#757575",
    marginTop: 12,
    fontStyle: "italic",
  },
  treeInfoContainer: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
  },
  treeInfoCard: {
    padding: 16,
  },
  treeInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  treeInfoTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  treeInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },
  treeInfoBody: {
    gap: 8,
    marginBottom: 12,
  },
  treeInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  treeInfoLabel: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  treeInfoValue: {
    fontSize: 14,
    color: "#212121",
  },
  treeInfoActions: {
    marginTop: 8,
  },
  statsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    flexDirection: "row",
    padding: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },
  statLabel: {
    fontSize: 11,
    color: "#757575",
    marginTop: 2,
  },
  // Web-specific styles
  webContainer: {
    flex: 1,
  },
  webHeader: {
    padding: 24,
    backgroundColor: "#2e7d32",
    alignItems: "center",
  },
  webTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  webSubtitle: {
    fontSize: 14,
    color: "#e8f5e9",
  },
  webStats: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  webStatCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  webStatValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#212121",
  },
  webStatLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  webFilters: {
    margin: 16,
    padding: 16,
  },
  webTreeList: {
    padding: 16,
    gap: 16,
  },
  webTreeCard: {
    padding: 16,
  },
});
