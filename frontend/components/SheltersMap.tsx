import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, TouchableOpacity, I18nManager } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { Shelter } from '../utils/types';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface SheltersMapProps {
  currentLocation: { latitude: number; longitude: number };
  locationName: string;
  shelters: Shelter[];
  onNavigate: (latitude: number, longitude: number) => void;
}

const SheltersMap: React.FC<SheltersMapProps> = ({ currentLocation, locationName, shelters, onNavigate }) => {
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [sheltersData, setSheltersData] = useState<Shelter[]>(shelters);
  const { t } = useTranslation();
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    const currentLanguage = i18n.language;
    const isLanguageRTL = currentLanguage === 'he';
    setIsRTL(isLanguageRTL);
  }, [i18n.language]);

  const getExactAddress = async (latitude: number, longitude: number) => {
    try {
      const language = i18n.language === 'he' ? 'he' : 'en';
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=${language}`
      );
      const addressComponents = response.data.results[0].address_components;
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

  const refreshShelters = async () => {
    setIsLoading(true);
    setErrorOccurred(false);
    try {
      const mongoResponse = await axios.get('https://saferoute.digital-solution.co.il/api/shelters', {
        params: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
      });

      const googleResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentLocation.latitude},${currentLocation.longitude}&radius=5000&keyword=bomb+shelter&key=${GOOGLE_MAPS_API_KEY}`);

      const mongoShelters = mongoResponse.data.map((shelter: Shelter) => ({
        ...shelter,
        title: t('bomb_shelter'),
      }));

      const googleShelters = googleResponse.data.results.map((place: any) => ({
        id: place.place_id,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        title: t('bomb_shelter'),
        description: place.vicinity || 'Unknown Address',
      }));

      const combinedShelters = [...mongoShelters, ...googleShelters];
      setSheltersData(combinedShelters);
    } catch (error) {
      console.error('Error fetching shelters:', error);
      setErrorOccurred(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshShelters();
  }, []);

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
          pinColor="blue" 
        />
        {sheltersData.map((shelter, index) => (
          <Marker
            key={shelter.id ? `${shelter.id}-${shelter.latitude}-${shelter.longitude}` : `shelter-${index}`}
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
        <TouchableOpacity style={styles.shelterInfo}>
          <Text style={[styles.title, { textAlign: isRTL ? 'left' : 'right' }]}>
            {selectedShelter.title || t('bomb_shelter')}
          </Text>
          <Text style={[styles.address, { textAlign: isRTL ? 'left' : 'right' }]}>
            {selectedAddress}
          </Text>
          <Text onPress={handleNavigatePress} style={styles.navigate}>{t('navigate')}</Text>
        </TouchableOpacity>
      )}

      {errorOccurred && (
        <View style={styles.refreshContainer}>
          <Button title={t('refresh_shelters')} onPress={refreshShelters} />
        </View>
      )}

      {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
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
  refreshContainer: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    alignItems: 'center',
  },
  address: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  navigate: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 5,
    width: '100%',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SheltersMap;