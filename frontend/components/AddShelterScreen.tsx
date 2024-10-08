import React, {useState} from 'react';
import {View, Text, Button, Alert, TextInput, StyleSheet} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgWZ19mRPIeban1W8rLbkeksHCXQ19qs';

const AddShelterScreen: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{latitude: number; longitude: number} | null>(null);

  const handleSubmit = () => {
    if (coordinates && description) {
      Alert.alert('Success', 'Shelter added successfully');
    } else {
      Alert.alert('Error', 'Please fill all fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text>הוסף מרחב מוגן חדש</Text>
      <GooglePlacesAutocomplete
        placeholder="Enter address"
        onPress={(data, details = null) => {
          const lat = details?.geometry.location.lat;
          const lng = details?.geometry.location.lng;
          setCoordinates({latitude: lat || 0, longitude: lng || 0});
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
        placeholder="תיאור"
        value={description}
        onChangeText={setDescription}
        textAlign="right"
      />
      <Button title="הוסף מרחב מוגן" onPress={handleSubmit} />
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
