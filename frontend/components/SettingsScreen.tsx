import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, I18nManager, Button, KeyboardAvoidingView, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface SettingsScreenProps {
  onLocationUpdate: (latitude: number, longitude: number) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLocationUpdate }) => {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const currentLanguage = i18n.language;
    const isLanguageRTL = currentLanguage === 'he';
    setIsRTL(isLanguageRTL);
  }, [i18n.language]);

  const handleLocationSelect = (data: any, details: any) => {
    const lat = details.geometry.location.lat;
    const lng = details.geometry.location.lng;

    setAddress(data.description);
    setCoordinates({ latitude: lat, longitude: lng });
  };

  const handleAddressSubmit = () => {
    if (coordinates) {
      onLocationUpdate(coordinates.latitude, coordinates.longitude);
      Alert.alert(t('success'), t('settings_screen.location_updated_successfully'));
    } else {
      Alert.alert(t('error'), t('please_select_address'));
    }
  };

  const handleUseCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        onLocationUpdate(latitude, longitude);
        Alert.alert(t('success'), t('settings_screen.location_set_to_current_gps'));
      },
      error => {
        console.error('Error fetching GPS location:', error);
        Alert.alert(t('error'), t('settings_screen.unable_to_fetch_gps_location'));
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.headerText}>{t('settings_screen.header')}</Text>

        {/* Google Places Autocomplete Input */}
        <GooglePlacesAutocomplete
          placeholder={t('settings_screen.enter_address')}
          onPress={handleLocationSelect}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: i18n.language,
            components: 'country:il',
            region: 'il',
          }}
          fetchDetails={true}
          styles={{
            textInput: {
              width: '100%',
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 5,
              color: 'black',
              placeholderTextColor: 'black',
              textAlign: isRTL ? 'right' : 'left',
            },
            textInputContainer: {
              borderTopWidth: 0,
              borderBottomWidth: 0,
              paddingHorizontal: 10,
              zIndex: 9, 
            },
            listView: {
              zIndex: 9, 
            },
            predefinedPlacesDescription: {
              color: 'black',
            },
            description: {
              color: 'black',
            },
          }}
        />

        <Text style={styles.description}>{t('settings_screen.description')}</Text>

        <TouchableOpacity style={styles.updateButton} onPress={handleAddressSubmit}>
          <Text style={styles.updateButtonText}>{t('settings_screen.update_location')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gpsButton} onPress={handleUseCurrentLocation}>
          <Text style={styles.gpsButtonText}>{t('settings_screen.use_gps_location')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.aboutButton}>
          <Text style={styles.aboutButtonText}>{t('settings_screen.about_app')}</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>v1.0.0</Text>

        <Modal
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t('settings_screen.about_title')}</Text>
              <Text style={styles.modalContent}>{t('settings_screen.about_content.part1')}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: 'black'
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black'
  },
  updateButton: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 5,
    marginVertical: 10,
  },
  updateButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gpsButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  gpsButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  aboutButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
    marginVertical: 10,
  },
  aboutButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
    marginTop: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
  },
  modalContent: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: 'black',
  },
  closeButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
