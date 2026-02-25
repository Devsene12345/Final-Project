import { View, TextInput, Button, Alert } from "react-native";
import { useState } from "react";
import axios from "axios";
import { Link, useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post("http://YOUR_IP:5000/api/auth/register", {
        name,
        email,
        password,
      });

      Alert.alert("Success", "Account created");
      router.push("./Pages/Login");
    } catch (err: any) {
      Alert.alert(
        "Done",
        err.response?.data?.message || "Succesfully registered",
      );
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Name" onChangeText={setName} />
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title="Register" onPress={handleRegister} />
      <Link href="./Pages/Login" style={{ color: "blue", marginTop: 10 }}>
        Already have an account? Login
      </Link>
    </View>
  );
}
