import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        Alert.alert("Error", "No registered user found");
        return;
      }

      const user = JSON.parse(storedUser);

      if (email === user.email && password === user.password) {
        Alert.alert("Success", "Login Successful");
        router.replace("/(tabs)/Dashboard");
      } else {
        Alert.alert("Error", "Invalid Credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
      />
      <Button title="LOGIN" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { borderWidth: 1, marginBottom: 15, padding: 10 },
});
