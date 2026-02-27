import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Urban Tree Mapping</Text>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => router.push("/Login")}
      >
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerBtn}
        onPress={() => router.push("/Register")}
      >
        <Text style={styles.btnText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, marginBottom: 40 },
  loginBtn: {
    backgroundColor: "green",
    padding: 15,
    width: 200,
    marginBottom: 15,
  },
  registerBtn: { backgroundColor: "blue", padding: 15, width: 200 },
  btnText: { color: "white", textAlign: "center" },
});
