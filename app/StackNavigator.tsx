import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapScreen from "./MapView";
import Dashboard from "./(tabs)/Dashboard";
import Analytics from "./(tabs)/Analytics";
import Login from "./Login";
import Register from "./Register";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Analytics" component={Analytics} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}
