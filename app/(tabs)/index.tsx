import { View, Text, StyleSheet } from "react-native";
import { TreePine } from "lucide-react-native";

export default function TreeMappingHome() {
  return (
    <View style={styles.container}>
      <TreePine size={48} color="green" />
      <Text style={styles.title}>Smart Urban Tree Mapping</Text>
      <Text style={styles.subtitle}>
        Analyze, manage & visualize urban trees
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
});
