import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2e7d32",
        tabBarStyle: {
          bottom: 15,
          height: 65,
          left: 20,
          right: 20,
          borderRadius: 15,
          paddingBottom: 20,
          backgroundColor: "#ffffffe3",
          elevation: 10,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "dashboard") iconName = "home";
          else if (route.name === "map") iconName = "map";
          else if (route.name === "analytics") iconName = "analytics";
          else if (route.name === "alerts") iconName = "warning";
          else if (route.name === "add-tree") iconName = "add-circle";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Map" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
      <Tabs.Screen name="add-tree" options={{ title: "Add Tree" }} />
    </Tabs>
  );
}
