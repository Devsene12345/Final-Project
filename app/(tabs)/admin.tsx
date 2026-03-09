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
import { useAuth } from "../context/AuthContext";
import {
  TreeRecord,
  UserProfile,
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

type AdminTabKey = "pending" | "users" | "images";

export default function AdminScreen() {
  const { isAdmin, appUser } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTabKey>("pending");
  const [pendingTrees, setPendingTrees] = useState<TreeRecord[]>([]);
  const [allTrees, setAllTrees] = useState<TreeRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

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

    return () => {
      unsubPending();
      unsubUsers();
      unsubTrees();
    };
  }, []);

  const treesWithImages = useMemo(
    () =>
      allTrees.filter(
        (tree) => Array.isArray(tree.photoUrls) && tree.photoUrls.length > 0,
      ),
    [allTrees],
  );

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
        ? "This user will no longer be allowed to use the app."
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
      "This will remove the user profile and their submitted trees from Realtime Database. The Authentication account itself will remain in Firebase Authentication.",
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
      "Remove this image reference from Firebase Realtime Database?",
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
          Login using the admin email and password to access the admin panel.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Admin Panel</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "pending" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.tabTextActive,
            ]}
          >
            Pending Trees
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "users" && styles.tabBtnActive]}
          onPress={() => setActiveTab("users")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "users" && styles.tabTextActive,
            ]}
          >
            Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "images" && styles.tabBtnActive]}
          onPress={() => setActiveTab("images")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "images" && styles.tabTextActive,
            ]}
          >
            Images
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "pending" && (
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

        {activeTab === "users" && (
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
                    <Text style={styles.btnText}>
                      Remove User Data From System
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === "images" && (
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
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: "#eaeaea",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#1b6e21",
  },
  tabText: {
    fontWeight: "800",
    color: "#333",
    fontSize: 13,
  },
  tabTextActive: {
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
});
