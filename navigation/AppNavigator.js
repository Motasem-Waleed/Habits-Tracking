import Home from "../screens/HomeScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AddEdit from "../screens/AddEditHabitScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const Tabs = createBottomTabNavigator();

const getScreenOptions = ({ route }) => ({
  tabBarIcon: ({ focused, size }) => {
    let iconName = "home-outline";
    if (route.name === "Home") iconName = focused ? "home" : "home-outline";
    if (route.name === "Add Habit") iconName = focused ? "plus-circle" : "plus-circle-outline";
    if (route.name === "Statistics Screen") iconName = "chart-bar";

    return (
      <MaterialCommunityIcons
        name={iconName}
        size={size ?? 24}
        color={focused ? "blue" : "black"}
      />
    );
  },
});

const TabNav = ({ route }) => {
  const email = route?.params?.email || "";

  return (
    <Tabs.Navigator screenOptions={getScreenOptions}>
      <Tabs.Screen name="Home" component={Home} initialParams={{ email }} />
      <Tabs.Screen name="Add Habit" component={AddEdit} initialParams={{ userId: email }} />
      <Tabs.Screen name="Statistics Screen" component={StatisticsScreen} initialParams={{ email }} />
    </Tabs.Navigator>
  );
};

export default TabNav;
