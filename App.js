// App.js
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HabitsProvider } from "./context/HabitContext";

import Login from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import TabNav from "./navigation/AppNavigator";
import AddEditHabitScreen from "./screens/AddEditHabitScreen";
import { initDb } from "./utils/storage";

import HabitDetailsScreen from "./screens/HabitDetailsScreen";


const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDb();
      setReady(true);
    })().catch((e) => console.log("SQLite init error:", e));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <HabitsProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Tabs" component={TabNav} />
        <Stack.Screen name="AddEditHabit" component={AddEditHabitScreen} />
        <Stack.Screen name="HabitDetails" component={HabitDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </HabitsProvider>
  );
}
