import { View, TextInput, Button, Alert } from "react-native";
import { useState } from "react";
import axios from "axios";
import { Link, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://192.168.1.100:5000/api/auth/login", {
        email,
        password,
      });

      await SecureStore.setItemAsync("token", res.data.token);

      router.replace("./app/Dashboard"); // use absolute paths from app/ root
    } catch (err: any) {
      Alert.alert("Done", "Loged in successfully");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Link
        href="../app/Dashboard"
        style={{ color: "blue", marginTop: 10 }}
      ></Link>
    </View>
  );
}
