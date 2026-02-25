import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapScreen from "./MapView";
import Dashboard from "./Dashboard";
import Analytics from "./Analytics";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Analytics" component={Analytics} />
    </Stack.Navigator>
  );
}
