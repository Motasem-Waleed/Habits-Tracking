import Home from "../screens/HomeScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AddEdit from "../screens/AddEditHabitScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


const getScreenOptions = (navOpts) => {
  return {
    tabBarIcon: (tabOpts) => {
      let iconName = "";

      switch (navOpts.route.name) {
        case "Home":
          iconName = tabOpts.focused ? 'home' : 'home-outline';
          break;
        case "Add Habit":
          iconName = tabOpts.focused ? 'add-circle' : 'add-circle-outline';
          break;
        case "Statistics Screen":
          iconName = tabOpts.focused ? 'chart' : 'chart-outline';
          break;
      };
      return <MaterialCommunityIcons name={iconName} size={24} color={tabOpts.focused ? "blue" : "black"} />
    }
  }
}
const Tabs = createBottomTabNavigator();
const TabNav = ({route} ) =>
   {

    const email  = route.params.email;
    return (
      
      <Tabs.Navigator screenOptions={getScreenOptions}>
        <Tabs.Screen name="Home" component={Home} 
          initialParams={{ email: email}}
          />
        <Tabs.Screen name="Add Habit" component={AddEdit} />
        <Tabs.Screen name="Statistics Screen" component={StatisticsScreen}/>
        
      </Tabs.Navigator>
  
    );
};


export default TabNav;