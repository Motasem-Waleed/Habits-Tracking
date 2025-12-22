import { StyleSheet, Text, View } from 'react-native';
import Login from './screens/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNav from './navigation/AppNavigator';


const stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <stack.Navigator screenOptions={{headerShown : false}}>
        <stack.Screen name= "Login" component={Login}/>
        <stack.Screen name="Tabs" component={TabNav} h/>
      </stack.Navigator>

      

    

    
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
