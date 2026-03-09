import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./FirebaseConfig";

function prettyError(message: string) {
  if (message.includes("invalid-credential")) {
    return "Invalid email or password.";
  }
  if (message.includes("user-not-found")) {
    return "No user found for this email.";
  }
  if (message.includes("wrong-password")) {
    return "Incorrect password.";
  }
  if (message.includes("invalid-email")) {
    return "Invalid email address.";
  }
  return message;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Please enter email and password.");
      return;
    }

    try {
      setBusy(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)/Dashboard");
    } catch (error: any) {
      Alert.alert(
        "Login failed",
        prettyError(error?.message ?? "Unknown error"),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, busy && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={busy}
      >
        <Text style={styles.buttonText}>
          {busy ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/Register")}>
        <Text style={styles.link}>Already no account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 14,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d8d8d8",
    borderRadius: 12,
    padding: 14,
  },
  button: {
    backgroundColor: "#1b6e21",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    color: "#1b6e21",
    fontWeight: "700",
    marginTop: 6,
  },
});
