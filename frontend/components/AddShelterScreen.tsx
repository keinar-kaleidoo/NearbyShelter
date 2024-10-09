import React, { useState } from 'react';
import { View, Text, Button, Alert, TextInput, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgWZ19mRPIeban1W8rLbkeksHCXQ19qs';

const AddShelterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleSubmit = async () => {
    if (coordinates && description) {
      try {
        const response = await axios.post('http://192.168.1.49:5001/api/shelters', {
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
      <Text>{t('login_button')}</Text>
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
          language: 'he',
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
            textAlign: 'right',
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
        style={styles.input}
        placeholder={t('add_shelter_screen.description_placeholder')}
        value={description}
        onChangeText={setDescription}
        textAlign="right"
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
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    textAlign: 'right',
  },
});

export default AddShelterScreen;