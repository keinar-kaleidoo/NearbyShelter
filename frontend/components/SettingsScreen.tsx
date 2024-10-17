import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert, I18nManager } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
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
      Alert.alert(t('success'), t('location_updated_successfully'));
    } else {
      Alert.alert(t('error'), t('please_select_address'));
    }
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder={t('settings_screen.enter_address')}
        onPress={handleLocationSelect}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'en',
          components: 'country:il', // Limits search to Israel
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
      <Button title={t('settings_screen.update_location')} onPress={handleAddressSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});

export default SettingsScreen;