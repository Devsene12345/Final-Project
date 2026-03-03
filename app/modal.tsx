// app/modal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, getStorage } from "firebase/storage";
import { db } from "./FirebaseConfig";
import { useAuth } from "./context/AuthContext";

const storage = getStorage();

export default function AddTreeModal() {
  const router = useRouter();
  const { appUser } = useAuth();

  const [species, setSpecies] = useState("");
  const [notes, setNotes] = useState("");

  const [health, setHealth] = useState("healthy");
  const [riskLevel, setRiskLevel] = useState("Low");

  const [lat, setLat] = useState(0.0);
  const [lng, setLng] = useState(0.0);

  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // -------- PICK IMAGE --------
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission denied", "Please enable gallery access.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!res.canceled) {
      setImages(res.assets.map((a) => a.uri));
    }
  };

  // -------- TAKE PHOTO --------
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission denied", "Please enable camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([result.assets[0].uri]);
    }
  };

  // -------- GET LOCATION --------
  const getCurrentLocation = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission", "Location permission is required.");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLat(loc.coords.latitude);
    setLng(loc.coords.longitude);
  };

  // -------- UPLOAD PHOTOS --------
  const uploadPhotos = async (treeId: string) => {
    const urls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const response = await fetch(images[i]);
      const blob = await response.blob();

      const imageRef = ref(
        storage,
        `trees/${appUser?.uid}/${treeId}/img${i}.jpg`,
      );
      await uploadBytes(imageRef, blob);
      const url = await getDownloadURL(imageRef);
      urls.push(url);
    }
    return urls;
  };

  // -------- SUBMIT TREE --------
  const submit = async () => {
    if (!species.trim()) {
      Alert.alert("Missing", "Tree species is required.");
      return;
    }

    try {
      setBusy(true);

      const treeRef = await addDoc(collection(db, "trees"), {
        species,
        health,
        riskLevel,
        notes,
        latitude: lat,
        longitude: lng,
        verified: false,
        createdBy: appUser?.uid,
        createdAt: serverTimestamp(),
        photoUrls: [],
      });

      const photoUrls = await uploadPhotos(treeRef.id);

      if (photoUrls.length > 0) {
        const { updateDoc, doc } = await import("firebase/firestore");
        await updateDoc(doc(db, "trees", treeRef.id), { photoUrls });
      }

      Alert.alert("Success", "Tree added successfully!");
      router.back();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      Alert.alert("Error", errorMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🍃</Text>
        <Text style={styles.headerTitle}>Add New Tree</Text>
        <Text style={styles.headerSub}>
          Record tree information and location
        </Text>
      </View>

      {/* SPECIES */}
      <Text style={styles.label}>Tree Species *</Text>
      <TextInput
        style={styles.input}
        value={species}
        onChangeText={setSpecies}
        placeholder="e.g., Mango, Coconut, Jak"
      />

      {/* LOCATION */}
      <Text style={styles.label}>Location *</Text>
      <View style={styles.locationRow}>
        <TextInput
          style={styles.locationInput}
          value={lat.toFixed(6)}
          editable={false}
        />
        <TextInput
          style={styles.locationInput}
          value={lng.toFixed(6)}
          editable={false}
        />
      </View>

      <TouchableOpacity style={styles.bigButton} onPress={getCurrentLocation}>
        <Text style={styles.bigButtonText}>Use Current Location</Text>
      </TouchableOpacity>

      {/* HEALTH STATUS */}
      <Text style={styles.label}>Health Status *</Text>

      <TouchableOpacity
        style={[
          styles.healthCard,
          health === "healthy" && styles.selectedHealthy,
        ]}
        onPress={() => setHealth("healthy")}
      >
        <Text style={styles.healthIcon}>✔️</Text>
        <Text style={[styles.healthText, { color: "#1b6e21" }]}>Healthy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.healthCard, health === "at-risk" && styles.selectedRisk]}
        onPress={() => setHealth("at-risk")}
      >
        <Text style={styles.healthIcon}>⚠️</Text>
        <Text style={[styles.healthText, { color: "#b57f00" }]}>At Risk</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.healthCard,
          health === "critical" && styles.selectedCritical,
        ]}
        onPress={() => setHealth("critical")}
      >
        <Text style={styles.healthIcon}>❗</Text>
        <Text style={[styles.healthText, { color: "#8a0000" }]}>Critical</Text>
      </TouchableOpacity>

      {/* PHOTOS */}
      <Text style={styles.label}>Photos</Text>

      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.outlineBtn} onPress={takePhoto}>
          <Text style={styles.outlineText}>📸 Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={pickImage}>
          <Text style={styles.outlineText}>🖼️ Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* NOTES */}
      <Text style={styles.label}>Additional Notes</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Add any observations or details…"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {/* SAVE BUTTON */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={submit}
        disabled={busy}
      >
        <Text style={styles.saveButtonText}>
          {busy ? "Saving..." : "✔ Save Tree Data"}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  container: { padding: 16 },

  header: { alignItems: "center", marginBottom: 20 },
  headerIcon: { fontSize: 36 },
  headerTitle: { fontSize: 28, fontWeight: "800", marginTop: 4 },
  headerSub: { fontSize: 14, color: "#777" },

  label: { fontSize: 16, fontWeight: "700", marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },

  locationRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  locationInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    textAlign: "center",
    fontWeight: "bold",
  },

  bigButton: {
    backgroundColor: "#1b6e21",
    padding: 16,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 10,
  },
  bigButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  healthCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  healthIcon: { fontSize: 22, marginRight: 12 },
  healthText: { fontSize: 18, fontWeight: "700" },

  selectedHealthy: { backgroundColor: "#e8f8ee", borderColor: "#1b6e21" },
  selectedRisk: { backgroundColor: "#fff5d6", borderColor: "#d8a300" },
  selectedCritical: { backgroundColor: "#ffe5e5", borderColor: "#a80000" },

  photoRow: { flexDirection: "row", gap: 12, marginTop: 10 },

  outlineBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#1b6e21",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  outlineText: { color: "#1b6e21", fontWeight: "700" },

  notesInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    height: 120,
  },

  saveButton: {
    backgroundColor: "#1b6e21",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: { color: "#fff", fontSize: 20, fontWeight: "800" },
});
