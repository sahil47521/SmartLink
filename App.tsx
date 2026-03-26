import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ScanScreen from './src/screens/ScanScreen';
import DeviceScreen from './src/screens/DeviceScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Scan"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Scan" 
          component={ScanScreen} 
          options={{ title: 'Scan Devices' }} 
        />
        <Stack.Screen 
          name="Device" 
          component={DeviceScreen} 
          options={{ title: 'Device Details' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;