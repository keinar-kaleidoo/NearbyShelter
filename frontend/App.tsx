import 'react-native-get-random-values';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from './components/MapScreen';
import AddShelterScreen from './components/AddShelterScreen';
import AdminLoginScreen from './components/AdminLoginScreen';
import AdminManagementScreen from './components/AdminManagementScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false); // סטייט כדי לעקוב אחרי התחברות האדמין

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
            } else if (route.name === 'Admin Login') {
              iconName = 'lock';  
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Nearby" component={MapScreen} />
        <Tab.Screen name="New" component={AddShelterScreen} />
        
        {/* הצגת מסך התחברות אם האדמין לא מחובר */}
        {!isAdminLoggedIn && (
          <Tab.Screen name="Admin Login">
            {props => <AdminLoginScreen {...props} setIsAdminLoggedIn={setIsAdminLoggedIn} />}
          </Tab.Screen>
        )}

        {/* הצגת מסך הניהול לאחר התחברות */}
        {isAdminLoggedIn && (
          <Tab.Screen name="AdminManagement" component={AdminManagementScreen} />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;