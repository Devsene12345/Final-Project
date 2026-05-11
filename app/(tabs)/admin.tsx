import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { onValue, ref } from "firebase/database";
import { rtdb } from "../FirebaseConfig";
import { useAuth } from "../context/AuthContext";
import {
  AlertRecord,
  TreeRecord,
  UserProfile,
  deleteTree,
  rejectTree,
  removeTreeImageByIndex,
  removeUserFromSystem,
  setUserDisabled,
  setUserRole,
  subscribeAllTrees,
  subscribePendingTrees,
  subscribeUsers,
  verifyTree,
} from "../Services/rtdb";

type AdminSection =
  | "pending"
  | "users"
  | "images"
  | "map"
  | "risk"
  | "activity";

type MarkerClickRecord = {
  id: string;
  markerId?: number;
  treeName?: string;
  scientificName?: string;
  riskLevel?: "Low" | "Medium" | "High";
  latitude?: number;
  longitude?: number;
  clickedAt?: number;
};

function getPinColor(riskLevel?: "Low" | "Medium" | "High") {
  if (riskLevel === "High") return "red";
  if (riskLevel === "Medium") return "orange";
  return "blue";
}

function formatDate(value?: number) {
  if (!value) return "Unknown time";
  return new Date(value).toLocaleString();
}

export default function AdminScreen() {
  const { isAdmin, appUser } = useAuth();

  const [activeSection, setActiveSection] = useState<AdminSection>("pending");
  const [pendingTrees, setPendingTrees] = useState<TreeRecord[]>([]);
  const [allTrees, setAllTrees] = useState<TreeRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [markerClicks, setMarkerClicks] = useState<MarkerClickRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  useEffect(() => {
    const unsubPending = subscribePendingTrees(setPendingTrees, (e) =>
      Alert.alert("Error", String((e as any)?.message ?? e)),
    );

    const unsubUsers = subscribeUsers(setUsers, (e) =>
      Alert.alert("Error", String((e as any)?.message ?? e)),
    );

    const unsubTrees = subscribeAllTrees(setAllTrees, (e) =>
      Alert.alert("Error", String((e as any)?.message ?? e)),
    );

    const markerClicksRef = ref(rtdb, "markerClicks");
    const unsubMarkerClicks = onValue(markerClicksRef, (snapshot) => {
      const data = snapshot.val() ?? {};
      const list: MarkerClickRecord[] = Object.keys(data)
        .map((id) => ({
          id,
          ...data[id],
        }))
        .reverse();
      setMarkerClicks(list);
    });

    const alertsRef = ref(rtdb, "alerts");
    const unsubAlerts = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val() ?? {};
      const list: AlertRecord[] = Object.keys(data)
        .map((id) => ({
          id,
          ...data[id],
        }))
        .reverse();
      setAlerts(list);
    });

    return () => {
      unsubPending();
      unsubUsers();
      unsubTrees();
      unsubMarkerClicks();
      unsubAlerts();
    };
  }, []);

  const treesWithImages = useMemo(
    () =>
      allTrees.filter(
        (tree) => Array.isArray(tree.photoUrls) && tree.photoUrls.length > 0,
      ),
    [allTrees],
  );

  const highRiskTrees = useMemo(
    () => allTrees.filter((tree) => tree.riskLevel === "High"),
    [allTrees],
  );

  const initialMapRegion = useMemo(() => {
    const firstTree = allTrees[0];
    return {
      latitude: firstTree?.latitude ?? 6.991,
      longitude: firstTree?.longitude ?? 81.056,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [allTrees]);

  const onVerify = async (treeId: string) => {
    if (!appUser?.uid) return;

    try {
      await verifyTree(treeId, appUser.uid);
      Alert.alert("Success", "Tree verified.");
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to verify tree.");
    }
  };

  const onReject = async (treeId: string) => {
    if (!appUser?.uid) return;

    Alert.alert("Reject Tree", "Are you sure you want to reject this tree?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            await rejectTree(treeId, appUser.uid);
            Alert.alert("Success", "Tree rejected.");
          } catch (error: any) {
            Alert.alert("Error", error?.message ?? "Failed to reject tree.");
          }
        },
      },
    ]);
  };

  const onDeleteTree = async (treeId: string) => {
    Alert.alert(
      "Delete Tree",
      "Are you sure you want to permanently remove this tree?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTree(treeId);
              Alert.alert("Success", "Tree deleted.");
            } catch (error: any) {
              Alert.alert("Error", error?.message ?? "Failed to delete tree.");
            }
          },
        },
      ],
    );
  };

  const onPromoteDemote = async (user: UserProfile) => {
    const nextRole = user.role === "admin" ? "user" : "admin";

    Alert.alert(
      nextRole === "admin" ? "Promote User" : "Remove Admin Access",
      `Change ${user.email} to ${nextRole}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await setUserRole(user.uid, nextRole);
              Alert.alert("Success", `User role changed to ${nextRole}.`);
            } catch (error: any) {
              Alert.alert("Error", error?.message ?? "Failed to update role.");
            }
          },
        },
      ],
    );
  };

  const onBlockUnblock = async (user: UserProfile) => {
    const nextDisabled = !user.disabled;

    Alert.alert(
      nextDisabled ? "Block User" : "Unblock User",
      nextDisabled
        ? "This user will no longer be able to use the app."
        : "This user will be allowed to use the app again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: nextDisabled ? "destructive" : "default",
          onPress: async () => {
            try {
              await setUserDisabled(user.uid, nextDisabled);
              Alert.alert(
                "Success",
                nextDisabled ? "User blocked." : "User unblocked.",
              );
            } catch (error: any) {
              Alert.alert("Error", error?.message ?? "Failed to update user.");
            }
          },
        },
      ],
    );
  };

  const onRemoveUserFromSystem = async (user: UserProfile) => {
    if (user.uid === appUser?.uid) {
      Alert.alert("Not allowed", "You cannot remove your own admin record.");
      return;
    }

    Alert.alert(
      "Remove User From System",
      "This will remove the user profile and their submitted trees from Realtime Database. The Firebase Authentication account itself will remain.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeUserFromSystem(user.uid);
              Alert.alert("Success", "User data removed from system.");
            } catch (error: any) {
              Alert.alert("Error", error?.message ?? "Failed to remove user.");
            }
          },
        },
      ],
    );
  };

  const onRemoveImage = async (treeId: string, imageIndex: number) => {
    Alert.alert(
      "Remove Image",
      "Remove this image from Firebase Realtime Database?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeTreeImageByIndex(treeId, imageIndex);
              Alert.alert("Success", "Image removed.");
            } catch (error: any) {
              Alert.alert("Error", error?.message ?? "Failed to remove image.");
            }
          },
        },
      ],
    );
  };

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Text style={styles.deniedTitle}>Admin only</Text>
        <Text style={styles.deniedText}>
          Login using the admin account to access the admin panel.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Admin Panel</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabs}
      >
        {[
          { key: "pending", label: "Pending Trees" },
          { key: "users", label: "Users" },
          { key: "images", label: "Images" },
          { key: "map", label: "Map Control" },
          { key: "risk", label: "Risk Panel" },
          { key: "activity", label: "Activity" },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.sectionBtn,
              activeSection === item.key && styles.sectionBtnActive,
            ]}
            onPress={() => setActiveSection(item.key as AdminSection)}
          >
            <Text
              style={[
                styles.sectionBtnText,
                activeSection === item.key && styles.sectionBtnTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {activeSection === "pending" && (
          <>
            {pendingTrees.length === 0 ? (
              <Text style={styles.empty}>No pending trees.</Text>
            ) : (
              pendingTrees.map((tree) => (
                <View key={tree.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{tree.species}</Text>
                  <Text style={styles.meta}>Health: {tree.health}</Text>
                  <Text style={styles.meta}>Risk: {tree.riskLevel}</Text>
                  <Text style={styles.meta}>
                    Submitted by:{" "}
                    {tree.createdByName ?? tree.createdBy ?? "Unknown"}
                  </Text>
                  <Text style={styles.meta}>
                    Location: {tree.latitude.toFixed(5)},{" "}
                    {tree.longitude.toFixed(5)}
                  </Text>
                  <Text style={styles.meta}>
                    Images attached: {tree.photoUrls?.length ?? 0}
                  </Text>

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.verifyBtn}
                      onPress={() => onVerify(tree.id)}
                    >
                      <Text style={styles.btnText}>Verify</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => onReject(tree.id)}
                    >
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeSection === "users" && (
          <>
            {users.length === 0 ? (
              <Text style={styles.empty}>No users found.</Text>
            ) : (
              users.map((user) => (
                <View key={user.uid} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {user.name || "Unnamed User"}
                  </Text>
                  <Text style={styles.meta}>{user.email}</Text>
                  <Text style={styles.meta}>Role: {user.role}</Text>
                  <Text style={styles.meta}>
                    Status: {user.disabled ? "Blocked" : "Active"}
                  </Text>

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.smallGreenBtn}
                      onPress={() => onPromoteDemote(user)}
                    >
                      <Text style={styles.btnText}>
                        {user.role === "admin" ? "Make User" : "Make Admin"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.smallDarkBtn}
                      onPress={() => onBlockUnblock(user)}
                    >
                      <Text style={styles.btnText}>
                        {user.disabled ? "Unblock" : "Block"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => onRemoveUserFromSystem(user)}
                  >
                    <Text style={styles.btnText}>Remove User Data</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {activeSection === "images" && (
          <>
            {treesWithImages.length === 0 ? (
              <Text style={styles.empty}>No tree images found.</Text>
            ) : (
              treesWithImages.map((tree) => (
                <View key={tree.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{tree.species}</Text>
                  <Text style={styles.meta}>
                    Owner: {tree.createdByName ?? tree.createdBy ?? "Unknown"}
                  </Text>
                  <Text style={styles.meta}>
                    Image count: {tree.photoUrls.length}
                  </Text>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {tree.photoUrls.map((uri, index) => (
                      <View
                        key={`${tree.id}-${index}`}
                        style={styles.imageWrap}
                      >
                        <Image source={{ uri }} style={styles.image} />
                        <TouchableOpacity
                          style={styles.imageRemoveBtn}
                          onPress={() => onRemoveImage(tree.id, index)}
                        >
                          <Text style={styles.imageRemoveText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ))
            )}
          </>
        )}

        {activeSection === "map" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Admin Map Control</Text>
            <Text style={styles.meta}>
              Tap any tree marker and use the popup to review or delete it.
            </Text>

            <View style={styles.mapContainer}>
              <MapView style={styles.map} initialRegion={initialMapRegion}>
                {allTrees.map((tree) => (
                  <Marker
                    key={tree.id}
                    coordinate={{
                      latitude: Number(tree.latitude),
                      longitude: Number(tree.longitude),
                    }}
                    pinColor={getPinColor(tree.riskLevel)}
                  >
                    <Callout tooltip>
                      <View style={styles.calloutCard}>
                        {tree.photoUrls?.[0] ? (
                          <Image
                            source={{ uri: tree.photoUrls[0] }}
                            style={styles.calloutImage}
                          />
                        ) : null}
                        <Text style={styles.calloutTitle}>{tree.species}</Text>
                        <Text style={styles.calloutText}>
                          Risk: {tree.riskLevel}
                        </Text>
                        <Text style={styles.calloutText}>
                          Health: {tree.health}
                        </Text>
                        <Text style={styles.calloutText}>
                          Lat: {Number(tree.latitude).toFixed(5)}
                        </Text>
                        <Text style={styles.calloutText}>
                          Lng: {Number(tree.longitude).toFixed(5)}
                        </Text>

                        <TouchableOpacity
                          style={styles.deleteTreeBtn}
                          onPress={() => onDeleteTree(tree.id)}
                        >
                          <Text style={styles.btnText}>Delete Tree</Text>
                        </TouchableOpacity>
                      </View>
                    </Callout>
                  </Marker>
                ))}
              </MapView>
            </View>
          </View>
        )}

        {activeSection === "risk" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>High Risk Trees</Text>
              <Text style={styles.meta}>
                Total high risk trees: {highRiskTrees.length}
              </Text>
              <Text style={styles.meta}>
                Total alerts in system: {alerts.length}
              </Text>
            </View>

            {highRiskTrees.length === 0 ? (
              <Text style={styles.empty}>No high risk trees found.</Text>
            ) : (
              highRiskTrees.map((tree) => (
                <View key={tree.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{tree.species}</Text>
                  <Text style={styles.meta}>Risk Level: {tree.riskLevel}</Text>
                  <Text style={styles.meta}>Health: {tree.health}</Text>
                  <Text style={styles.meta}>
                    Location: {tree.latitude.toFixed(5)},{" "}
                    {tree.longitude.toFixed(5)}
                  </Text>
                  <Text style={styles.meta}>
                    Submitted by:{" "}
                    {tree.createdByName ?? tree.createdBy ?? "Unknown"}
                  </Text>

                  <View style={styles.btnRow}>
                    {tree.verificationStatus !== "verified" ? (
                      <TouchableOpacity
                        style={styles.verifyBtn}
                        onPress={() => onVerify(tree.id)}
                      >
                        <Text style={styles.btnText}>Verify</Text>
                      </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => onDeleteTree(tree.id)}
                    >
                      <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeSection === "activity" && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>User Activity Monitoring</Text>
              <Text style={styles.meta}>
                Marker click logs: {markerClicks.length}
              </Text>
            </View>

            {markerClicks.length === 0 ? (
              <Text style={styles.empty}>No activity logs found.</Text>
            ) : (
              markerClicks.map((log) => (
                <View key={log.id} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {log.treeName ?? "Unknown Tree"}
                  </Text>
                  <Text style={styles.meta}>
                    Scientific Name: {log.scientificName ?? "N/A"}
                  </Text>
                  <Text style={styles.meta}>
                    Risk Level: {log.riskLevel ?? "N/A"}
                  </Text>
                  <Text style={styles.meta}>
                    Location: {log.latitude ?? "N/A"}, {log.longitude ?? "N/A"}
                  </Text>
                  <Text style={styles.meta}>
                    Clicked At: {formatDate(log.clickedAt)}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: 14,
  },
  center: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  deniedTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  deniedText: {
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  sectionTabs: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },

  sectionBtn: {
    backgroundColor: "#e6e6e6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionBtnActive: {
    backgroundColor: "#1b6e21",
  },

  sectionBtnText: {
    color: "#333",
    fontWeight: "700",
    fontSize: 14,
  },

  sectionBtnTextActive: {
    color: "#fff",
  },
  content: {
    padding: 12,
    paddingBottom: 40,
  },
  empty: {
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e4e4e4",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },
  meta: {
    color: "#555",
    marginBottom: 4,
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  verifyBtn: {
    flex: 1,
    backgroundColor: "#1b6e21",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#b10000",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  smallGreenBtn: {
    flex: 1,
    backgroundColor: "#1b6e21",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  smallDarkBtn: {
    flex: 1,
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  removeBtn: {
    marginTop: 10,
    backgroundColor: "#8a0000",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
  },
  imageWrap: {
    marginTop: 12,
    marginRight: 12,
    width: 150,
  },
  image: {
    width: 150,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },
  imageRemoveBtn: {
    marginTop: 8,
    backgroundColor: "#b10000",
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  imageRemoveText: {
    color: "#fff",
    fontWeight: "800",
  },
  mapContainer: {
    marginTop: 12,
    height: 420,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  calloutCard: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
  },
  calloutImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#ddd",
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 2,
    fontWeight: "600",
  },
  deleteTreeBtn: {
    marginTop: 10,
    backgroundColor: "#8a0000",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});
