import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, TextInput, StyleSheet, I18nManager } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from '@env';
import i18n from '../i18n';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgWZ19mRPIeban1W8rLbkeksHCXQ19qs';

const AddShelterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    const currentLanguage = i18n.language;
    const isLanguageRTL = currentLanguage === 'he'
    setIsRTL(isLanguageRTL); 
  }, [i18n.language]);

  const handleSubmit = async () => {
    if (coordinates && description) {
      try {
        const response = await axios.post(`${API_URL}/api/shelters`, {
          name: address,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          description,
        });
        
        Alert.alert(t('success'), t('add_shelter_screen.shelter_added_success'));
      } catch (error) {
        console.error('Error adding shelter:', error);
        Alert.alert(t('error'), t('add_shelter_screen.failed_to_add_shelter'));
      }
    } else {
      Alert.alert(t('error'), t('add_shelter_screen.fill_all_fields_error'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('add_shelter_screen.title')}</Text>
      <GooglePlacesAutocomplete
        placeholder={t('add_shelter_screen.enter_address')}
        onPress={(data, details = null) => {
          const lat = details?.geometry.location.lat;
          const lng = details?.geometry.location.lng;
          setCoordinates({ latitude: lat || 0, longitude: lng || 0 });
          setAddress(data.description);
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: i18n.language,
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
            textAlign: isRTL ? 'right' : 'left',
          },
          container: {
            flex: 0,
            width: '100%',
          },
          listView: {
            width: '100%',
          },
        }}
      />
      <TextInput
        style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
        placeholder={t('add_shelter_screen.description_placeholder')}
        value={description}
        onChangeText={setDescription}
      />
      <Button title={t('add_shelter_screen.add_shelter_button')} onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  input: {
    width: '100%',
    padding: 12,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  }
});

export default AddShelterScreen;