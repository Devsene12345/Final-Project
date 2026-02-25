import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { TreePine } from "lucide-react-native";
import { Link, useRouter } from "expo-router";

export default function TreeMappingHome() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TreePine size={48} color="green" />
      <Text style={styles.title}>Smart Urban Tree Mapping</Text>
      <Text style={styles.subtitle}>
        Analyze, manage & visualize urban trees
      </Text>

      {/*Buttons */}
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => router.push("../Pages/Login")}
      >
        <Text style={styles.btnText}>Login</Text>
        <Link href="../Pages/Login" style={{ color: "white", fontSize: 16 }} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerBtn}
        onPress={() => router.push("../Pages/Register")}
      >
        <Text style={styles.btnText}>Register</Text>
        <Link
          href="../Pages/Register"
          style={{ color: "white", fontSize: 16 }}
        />
      </TouchableOpacity>
      {/*DashBoard*/}
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
  loginBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
  },
  registerBtn: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 12,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
