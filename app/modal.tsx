import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

export default function ModalScreen() {
  const [treeData, setTreeData] = useState({
    species: "",
    latitude: "",
    longitude: "",
    health: "healthy",
    notes: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const healthOptions = [
    {
      value: "healthy",
      label: "Healthy",
      color: "#2e7d32",
      icon: "checkmark-circle",
    },
    { value: "at-risk", label: "At Risk", color: "#f57c00", icon: "warning" },
    {
      value: "critical",
      label: "Critical",
      color: "#d32f2f",
      icon: "alert-circle",
    },
  ];

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to add tree location."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setTreeData({
        ...treeData,
        latitude: location.coords.latitude.toFixed(6),
        longitude: location.coords.longitude.toFixed(6),
      });

      Alert.alert("Success", "Location captured successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to get current location. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera roll permission is required to add photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
      console.error(error);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
      console.error(error);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    // Validation
    if (!treeData.species.trim()) {
      Alert.alert("Validation Error", "Please enter the tree species.");
      return;
    }

    if (!treeData.latitude || !treeData.longitude) {
      Alert.alert("Validation Error", "Please capture the tree location.");
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Replace with your MongoDB API endpoint
      // const response = await fetch('YOUR_API_ENDPOINT/trees', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...treeData,
      //     photos: photos,
      //     timestamp: new Date().toISOString(),
      //   }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success!", "Tree data has been saved successfully.", [
        {
          text: "Add Another",
          onPress: () => {
            setTreeData({
              species: "",
              latitude: "",
              longitude: "",
              health: "healthy",
              notes: "",
            });
            setPhotos([]);
          },
        },
        { text: "Done", style: "cancel" },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save tree data. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="leaf" size={48} color="#2e7d32" />
          <Text style={styles.headerTitle}>Add New Tree</Text>
          <Text style={styles.headerSubtitle}>
            Record tree information and location
          </Text>
        </View>

        {/* Tree Species */}
        <View style={styles.section}>
          <Text style={styles.label}>Tree Species *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Mango, Coconut, Jak"
            value={treeData.species}
            onChangeText={(text) => setTreeData({ ...treeData, species: text })}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <View style={styles.locationContainer}>
            <View style={styles.coordinateInputs}>
              <View style={styles.coordinateInput}>
                <Text style={styles.coordinateLabel}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.000000"
                  value={treeData.latitude}
                  onChangeText={(text) =>
                    setTreeData({ ...treeData, latitude: text })
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.coordinateInput}>
                <Text style={styles.coordinateLabel}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.000000"
                  value={treeData.longitude}
                  onChangeText={(text) =>
                    setTreeData({ ...treeData, longitude: text })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isLoading}
            >
              <Ionicons name="locate" size={20} color="#fff" />
              <Text style={styles.locationButtonText}>
                {isLoading ? "Getting Location..." : "Use Current Location"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Status */}
        <View style={styles.section}>
          <Text style={styles.label}>Health Status *</Text>
          <View style={styles.healthOptions}>
            {healthOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.healthOption,
                  treeData.health === option.value && {
                    borderColor: option.color,
                    backgroundColor: `${option.color}10`,
                  },
                ]}
                onPress={() =>
                  setTreeData({ ...treeData, health: option.value })
                }
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={
                    treeData.health === option.value ? option.color : "#757575"
                  }
                />
                <Text
                  style={[
                    styles.healthOptionText,
                    treeData.health === option.value && {
                      color: option.color,
                      fontWeight: "600",
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="#2e7d32" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Ionicons name="images" size={24} color="#2e7d32" />
              <Text style={styles.photoButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {photos.length > 0 && (
            <View style={styles.photoGallery}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add any observations or details..."
            value={treeData.notes}
            onChangeText={(text) => setTreeData({ ...treeData, notes: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.submitButtonText}>
            {isLoading ? "Saving..." : "Save Tree Data"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  locationContainer: {
    gap: 12,
  },
  coordinateInputs: {
    flexDirection: "row",
    gap: 12,
  },
  coordinateInput: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 4,
  },
  locationButton: {
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  healthOptions: {
    gap: 12,
  },
  healthOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    gap: 12,
  },
  healthOptionText: {
    fontSize: 16,
    color: "#212121",
  },
  photoButtons: {
    flexDirection: "row",
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderWidth: 2,
    borderColor: "#2e7d32",
    borderRadius: 8,
    gap: 8,
  },
  photoButtonText: {
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "600",
  },
  photoGallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  photoContainer: {
    position: "relative",
    width: 100,
    height: 100,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 20,
    marginTop: 12,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#9e9e9e",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
