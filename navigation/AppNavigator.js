import Home from "../screens/HomeScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AddEdit from "../screens/AddEditHabitScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const Tabs = createBottomTabNavigator();

const getScreenOptions = (navOpts) => {
  return {
    tabBarIcon: (tabOpts) => {
      let iconName = "";

      switch (navOpts.route.name) {
        case "Home":
          iconName = tabOpts.focused ? "home" : "home-outline";
          break;
        case "Add Habit":
          iconName = tabOpts.focused ? "plus-circle" : "plus-circle-outline";
          break;
        case "Statistics Screen":
          iconName = tabOpts.focused ? "chart-bar" : "chart-bar";
          break;
      }

      return (
        <MaterialCommunityIcons
          name={iconName}
          size={24}
          color={tabOpts.focused ? "blue" : "black"}
        />
      );
    },
  };
};

const TabNav = ({ route }) => {
  const email = route?.params?.email || "user@gmail.com";

  return (
    <Tabs.Navigator screenOptions={getScreenOptions}>
      <Tabs.Screen name="Home" component={Home} initialParams={{ email }} />
      <Tabs.Screen name="Add Habit" component={AddEdit} initialParams={{ userId: email }} />
      <Tabs.Screen name="Statistics Screen" component={StatisticsScreen} />
    </Tabs.Navigator>
  );
};

export default TabNav;
