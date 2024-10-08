import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../components/MapScreen';
import AddShelterScreen from '../components/AddShelterScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Nearby') {
              iconName = 'place';  
            } else if (route.name === 'New') {
              iconName = 'add-location';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Nearby" component={MapScreen} />
        <Tab.Screen name="New" component={AddShelterScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;