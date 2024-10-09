import 'react-native-get-random-values';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from './components/MapScreen';
import AddShelterScreen from './components/AddShelterScreen';
import AdminLoginScreen from './components/AdminLoginScreen';
import AdminManagementScreen from './components/AdminManagementScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import i18n from './i18n';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const { t } = useTranslation();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageModalVisible(false); // Close modal after selection
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Nearby' || route.name === 'בסביבה') {
              iconName = 'place';
            } else if (route.name === 'New' || route.name === 'הוספה') {
              iconName = 'add-location';
            } else if (route.name === 'Admin Login' || route.name === 'התחברות אדמין') {
              iconName = 'lock';
            } else if (route.name === 'Settings' || route.name === 'הגדרות') {
              iconName = 'settings';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          headerRight: () => (
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setLanguageModalVisible(true)}
            >
              <Text style={styles.languageText}>{t('language')}</Text>
            </TouchableOpacity>
          ),
        })}
      >
        <Tab.Screen name={t('Nearby')} component={MapScreen} />
        <Tab.Screen name={t('New')} component={AddShelterScreen} />
        
        {!isAdminLoggedIn && (
          <Tab.Screen name={t('admin_login')}>
            {props => <AdminLoginScreen {...props} setIsAdminLoggedIn={setIsAdminLoggedIn} />}
          </Tab.Screen>
        )}

        {isAdminLoggedIn && (
          <Tab.Screen name={t('admin_management')} component={AdminManagementScreen} />
        )}
      </Tab.Navigator>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{t('select_language')}</Text>
            <TouchableOpacity onPress={() => changeLanguage('en')} style={styles.languageOption}>
              <Text style={styles.languageText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeLanguage('he')} style={styles.languageOption}>
              <Text style={styles.languageText}>עברית</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLanguageModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  languageButton: {
    marginRight: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  languageText: {
    fontSize: 14,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  languageOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
