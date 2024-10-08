import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import SheltersMap from './SheltersMap';
import useFetchNearbyShelters from '../frontend/hooks/useFetchNearbyShelters';
import { openNavigation } from '../utils/NavigationHelper';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgWZ19mRPIeban1W8rLbkeksHCXQ19qs';

const MapScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Loading location...');
  const [loading, setLoading] = useState<boolean>(true);
  const [sheltersLoading, setSheltersLoading] = useState<boolean>(false);  // Shelters are not loading by default

  useEffect(() => {
    // Get the user's current location
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLoading(false);  // Stop loading the map

        // Get the current location name via Reverse Geocoding
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`)
          .then(response => {
            const address = response.data.results[0]?.formatted_address || 'Unknown Location';
            setLocationName(address);
          })
          .catch(error => {
            console.error('Error fetching location name:', error);
            setLocationName('Unknown Location');
          });
      },
      error => {
        console.log('Error fetching location:', error);
        setLocationName('Unable to retrieve location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  // Fetch shelters only if the current location is available
  const { shelters, closestShelter } = useFetchNearbyShelters(
    currentLocation?.latitude,
    currentLocation?.longitude,
    setSheltersLoading
  );

  useEffect(() => {
    if (closestShelter) {
      Alert.alert(
        'Closest Shelter Found',
        `The closest shelter is at: ${closestShelter.description}`,
        [
          {
            text: 'Navigate',
            onPress: () => openNavigation(closestShelter.latitude, closestShelter.longitude),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  }, [closestShelter]);

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={{ position: 'absolute', top: '50%', left: '50%' }} />
      )}
      {!loading && !sheltersLoading && (
        <SheltersMap
          currentLocation={currentLocation || { latitude: 32.908562, longitude: 35.284914 }}  // Default location if not loaded
          locationName={locationName}
          shelters={shelters}
          onNavigate={openNavigation}
        />
      )}
      {!loading && sheltersLoading && (
        <ActivityIndicator size="large" color="#00ff00" style={{ position: 'absolute', top: '50%', left: '50%' }} />
      )}
    </View>
  );
};

export default MapScreen;
