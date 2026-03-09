import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { storage } from "./FirebaseConfig";
import { useAuth } from "./context/AuthContext";
import {
  createAlert,
  createTree,
  HealthStatus,
  RiskLevel,
} from "./Services/rtdb";

const healthOptions: { label: string; value: HealthStatus }[] = [
  { label: "Healthy", value: "healthy" },
  { label: "At Risk", value: "at-risk" },
  { label: "Critical", value: "critical" },
];

function getRiskLevelFromHealth(health: HealthStatus): RiskLevel {
  if (health === "critical") return "High";
  if (health === "at-risk") return "Medium";
  return "Low";
}

function buildAlert(health: HealthStatus) {
  if (health === "critical") {
    return {
      level: "High" as RiskLevel,
      type: "critical" as const,
      message: "Critical tree detected. Immediate inspection is required.",
    };
  }

  if (health === "at-risk") {
    return {
      level: "Medium" as RiskLevel,
      type: "warning" as const,
      message: "At-risk tree detected. Maintenance is recommended.",
    };
  }

  return null;
}

export default function AddTreeModal() {
  const router = useRouter();
  const { firebaseUser, appUser } = useAuth();

  const [species, setSpecies] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [notes, setNotes] = useState("");
  const [health, setHealth] = useState<HealthStatus>("healthy");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const chooseFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (result.canceled) return;

    const uris = result.assets.map((asset) => asset.uri);
    setImages((prev) => [...prev, ...uris].slice(0, 5));
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (result.canceled) return;
    setImages((prev) => [...prev, result.assets[0].uri].slice(0, 5));
  };

  const useCurrentLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Location permission is required.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLatitude(String(location.coords.latitude));
    setLongitude(String(location.coords.longitude));
  };

  const uploadImageAsync = async (uri: string, uid: string, index: number) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const path = `tree-photos/${uid}/${Date.now()}-${index}.jpg`;
    const fileRef = storageRef(storage, path);

    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const submit = async () => {
    if (!firebaseUser?.uid) {
      Alert.alert("Login required", "Please login first.");
      return;
    }

    if (!species.trim() || !latitude.trim() || !longitude.trim()) {
      Alert.alert(
        "Missing details",
        "Please fill species, latitude and longitude.",
      );
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      Alert.alert(
        "Invalid coordinates",
        "Latitude and longitude must be valid numbers.",
      );
      return;
    }

    try {
      setBusy(true);

      const photoUrls: string[] = [];
      for (let i = 0; i < images.length; i += 1) {
        const url = await uploadImageAsync(images[i], firebaseUser.uid, i);
        photoUrls.push(url);
      }

      const treeId = await createTree({
        species: species.trim(),
        notes: notes.trim(),
        health,
        riskLevel: getRiskLevelFromHealth(health),
        latitude: lat,
        longitude: lng,
        photoUrls,
        verified: false,
        verificationStatus: "pending",
        verifiedAt: null,
        verifiedBy: null,
        createdBy: firebaseUser.uid,
        createdByName:
          appUser?.name ?? firebaseUser.displayName ?? "Unknown User",
      });

      const alertData = buildAlert(health);
      if (alertData) {
        await createAlert({
          treeId,
          level: alertData.level,
          type: alertData.type,
          message: alertData.message,
          latitude: lat,
          longitude: lng,
        });
      }

      Alert.alert("Success", "Tree data saved successfully.");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to save tree data.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.leafCircle}>
          <Ionicons name="leaf-outline" size={34} color="#1b6e21" />
        </View>
        <Text style={styles.headerTitle}>Add Tree Data</Text>
        <Text style={styles.headerSub}>Submit a new tree for verification</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Species / Tree Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter tree species"
          value={species}
          onChangeText={setSpecies}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Location</Text>

        <View style={styles.locRow}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Latitude"
            keyboardType="numeric"
            value={latitude}
            onChangeText={setLatitude}
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="Longitude"
            keyboardType="numeric"
            value={longitude}
            onChangeText={setLongitude}
          />
        </View>

        <TouchableOpacity style={styles.greenBtn} onPress={useCurrentLocation}>
          <Ionicons name="locate-outline" size={20} color="#fff" />
          <Text style={styles.greenBtnText}>Use Current Location</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Health Status</Text>
        {healthOptions.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.statusCard,
              health === item.value && styles.statusCardSelected,
            ]}
            onPress={() => setHealth(item.value)}
          >
            <Text style={styles.statusText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Photos</Text>
        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={takePhoto}>
            <Text style={styles.outlineBtnText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={chooseFromGallery}
          >
            <Text style={styles.outlineBtnText}>Choose Gallery</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.meta}>
          Selected: {images.length} photo{images.length === 1 ? "" : "s"}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
        >
          {images.map((uri, index) => (
            <Image
              key={`${uri}-${index}`}
              source={{ uri }}
              style={styles.preview}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          placeholder="Add any observations or details..."
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, busy && { opacity: 0.7 }]}
        onPress={submit}
        disabled={busy}
      >
        <Text style={styles.saveText}>
          {busy ? "Saving..." : "Save Tree Data"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f7f7f7" },
  container: { padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 24 },
  leafCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#eaf6ed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  headerTitle: { fontSize: 26, fontWeight: "800" },
  headerSub: { color: "#666", marginTop: 4 },

  section: { marginBottom: 18 },
  label: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#d7d7d7",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
  },
  locRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  half: { flex: 1 },

  greenBtn: {
    backgroundColor: "#1b6e21",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  greenBtnText: { color: "#fff", fontWeight: "700" },

  statusCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d7d7d7",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  statusCardSelected: {
    borderColor: "#1b6e21",
    backgroundColor: "#edf7ef",
  },
  statusText: { fontSize: 18, fontWeight: "700" },

  photoRow: { flexDirection: "row", gap: 10 },
  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1b6e21",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  outlineBtnText: { color: "#1b6e21", fontWeight: "700" },

  meta: { marginTop: 8, color: "#555" },
  preview: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#ddd",
  },

  notes: { minHeight: 110, textAlignVertical: "top" },

  saveBtn: {
    backgroundColor: "#1b6e21",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  saveText: { color: "#fff", fontSize: 17, fontWeight: "800" },

  cancel: {
    alignItems: "center",
    marginTop: 14,
    padding: 10,
  },
  cancelText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
  },
});
