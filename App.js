// App.js
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./screens/LoginScreen";
import TabNav from "./navigation/AppNavigator";
import AddEditHabitScreen from "./screens/AddEditHabitScreen";
import { initDb } from "./utils/storage";

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initDb();
        console.log("SQLite ready");
        setReady(true);
      } catch (e) {
        console.log("SQLite init error:", e);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Tabs" component={TabNav} />
        <Stack.Screen name="AddEditHabit" component={AddEditHabitScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
