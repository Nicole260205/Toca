import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "../../constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.moss,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.paper,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={String(color)} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="shelf"
        options={{
          title: "Estante",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="library-outline"
              color={String(color)}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Adicionar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="add-circle-outline"
              color={String(color)}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Estatísticas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="stats-chart-outline"
              color={String(color)}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
