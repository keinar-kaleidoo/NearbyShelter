import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, I18nManager } from 'react-native';
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
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={t('settings_screen.enter_address')}
        onPress={handleLocationSelect}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'en',
          components: 'country:il',
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
            textAlign: isRTL ? 'right' : 'left',
          },
        }}
      />
      <TouchableOpacity style={styles.updateButton} onPress={handleAddressSubmit}>
        <Text style={styles.updateButtonText}>{t('settings_screen.update_location')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.gpsButton} onPress={handleUseCurrentLocation}>
        <Text style={styles.gpsButtonText}>{t('settings_screen.use_gps_location')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
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
});

export default SettingsScreen;
