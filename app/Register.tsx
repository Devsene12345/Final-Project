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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./FirebaseConfig";
import { upsertUserProfile } from "./Services/rtdb";

function prettyError(message: string) {
  if (message.includes("email-already-in-use")) {
    return "This email is already registered.";
  }
  if (message.includes("weak-password")) {
    return "Password should be at least 6 characters.";
  }
  if (message.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  return message;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Please fill all fields.");
      return;
    }

    try {
      setBusy(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });

      await upsertUserProfile({
        uid: userCredential.user.uid,
        name: name.trim(),
        email: userCredential.user.email,
        role: "user",
      });

      Alert.alert("Success", "Successfully registered.");
      router.replace("/Login");
    } catch (error: any) {
      Alert.alert(
        "Register failed",
        prettyError(error?.message ?? "Unknown error"),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
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
        onPress={handleRegister}
        disabled={busy}
      >
        <Text style={styles.buttonText}>
          {busy ? "Registering..." : "Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
