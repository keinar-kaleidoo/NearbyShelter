import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import SheltersMap from './SheltersMap';
import useFetchNearbyShelters from '../hooks/useFetchNearbyShelters';
import { openNavigation } from '../utils/NavigationHelper';
import axios from 'axios';
import { useTranslation } from 'react-i18next';  // Import i18n hook
import { GOOGLE_MAPS_API_KEY } from '@env';

const MapScreen: React.FC = () => {
  const { t } = useTranslation();  // Access the translation function
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>(t('loading_location'));  // Translatable text
  const [loading, setLoading] = useState<boolean>(true);
  const [sheltersLoading, setSheltersLoading] = useState<boolean>(false);

  useEffect(() => {
    // Get the user's current location
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLoading(false);

        // Get the current location name via Reverse Geocoding
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`)
          .then(response => {
            const address = response.data.results[0]?.formatted_address || t('unknown_location');
            setLocationName(address);
          })
          .catch(error => {
            console.error('Error fetching location name:', error);
            setLocationName(t('unknown_location'));
          });
      },
      error => {
        console.log('Error fetching location:', error);
        setLocationName(t('location_retrieval_error'));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, [t]);  // Add 't' as a dependency to re-run if language changes

  // Fetch shelters only if the current location is available
  const { shelters, closestShelter } = useFetchNearbyShelters(
    currentLocation?.latitude,
    currentLocation?.longitude,
    setSheltersLoading
  );

  useEffect(() => {
    if (closestShelter) {
      Alert.alert(
        t('closest_shelter_found'),  // Translated alert title
        `${t('closest_shelter_is_at')} ${closestShelter.description}`,  // Translated alert message
        [
          {
            text: t('navigate'),
            onPress: () => openNavigation(closestShelter.latitude, closestShelter.longitude),
          },
          { text: t('cancel'), style: 'cancel' },
        ]
      );
    }
  }, [closestShelter, t]);

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