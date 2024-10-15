import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { Shelter } from '../utils/types';
import { GOOGLE_MAPS_API_KEY } from '@env';


interface SheltersMapProps {
  currentLocation: { latitude: number; longitude: number };
  locationName: string;
  shelters: Shelter[];
  onNavigate: (latitude: number, longitude: number) => void;
}

const SheltersMap: React.FC<SheltersMapProps> = ({ currentLocation, locationName, shelters, onNavigate }) => {
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');

  const getExactAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const addressComponents = response.data.results[0].address_components;

      // שליפת מרכיבי הרחוב והמספר
      const streetNumber = addressComponents.find((component: any) =>
        component.types.includes('street_number')
      );
      const route = addressComponents.find((component: any) =>
        component.types.includes('route')
      );

      const formattedAddress = `${streetNumber?.long_name || ''} ${route?.long_name || ''}`;
      setSelectedAddress(formattedAddress.trim());
    } catch (error) {
      console.error('Error fetching address:', error);
      setSelectedAddress('Unknown Address');
    }
  };

  const handleMarkerPress = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    getExactAddress(shelter.latitude, shelter.longitude);
  };

  const handleNavigatePress = () => {
    if (selectedShelter) {
      onNavigate(selectedShelter.latitude, selectedShelter.longitude);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker
          coordinate={currentLocation}
          title={locationName}
        />

        {shelters.map((shelter) => (
          <Marker
            key={`${shelter.id}-${shelter.latitude}-${shelter.longitude}`}  
            coordinate={{
              latitude: shelter.latitude,
              longitude: shelter.longitude,
            }}
            pinColor="darkred"  
            onPress={() => handleMarkerPress(shelter)}
          />
        ))}
      </MapView>

      {selectedShelter && (
        <View style={styles.shelterInfo}>
          <Text style={styles.title}>{selectedShelter.title || 'Shelter'}</Text>
          <Text style={styles.description}>{selectedShelter.description || 'No description available'}</Text>
          <Text style={styles.address}>{selectedAddress}</Text>
          <Button title="Navigate" onPress={handleNavigatePress} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shelterInfo: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginVertical: 5,
  },
  address: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
});

export default SheltersMap;