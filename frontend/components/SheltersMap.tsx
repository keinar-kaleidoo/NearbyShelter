import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, I18nManager } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { Shelter } from '../utils/types';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SheltersMapProps {
  initialLocation?: { latitude: number; longitude: number };
  locationName: string;
  shelters: Shelter[];
  onNavigate: (latitude: number, longitude: number) => void;
}

const SheltersMap: React.FC<SheltersMapProps> = ({ initialLocation, locationName, shelters, onNavigate }) => {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(initialLocation || null);
  const [defaultLocation, setDefaultLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [sheltersData, setSheltersData] = useState<Shelter[]>(shelters);
  const { t } = useTranslation();
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const loadDefaultLocation = async () => {
        const latitude = await AsyncStorage.getItem('defaultLatitude');
        const longitude = await AsyncStorage.getItem('defaultLongitude');

        if (latitude && longitude) {
            console.log("Using stored default location:", { latitude, longitude });
            setDefaultLocation({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            });
            setCurrentLocation({
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            });
        } else if (!currentLocation) {
            console.log("Fetching current GPS location...");
            Geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    console.log("Fetched GPS location:", { latitude, longitude });
                    setCurrentLocation({ latitude, longitude });
                },
                error => {
                    console.error('Error fetching GPS location:', error);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        }
    };
    loadDefaultLocation();
}, [initialLocation]);

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
    if (!currentLocation) {
        console.log("No current location set, skipping refresh..."); // דיבוג: אין מיקום מוגדר
        return;
    }
    console.log("Refreshing shelters for location:", currentLocation); // דיבוג תחילת רענון

    setIsLoading(true);
    setErrorOccurred(false);
    try {
        const savedRadius = await AsyncStorage.getItem('radius');
        const radius = savedRadius ? parseInt(savedRadius, 10) : 5000;

        const mongoResponse = await axios.get('https://saferoute.digital-solution.co.il/api/shelters', {
            params: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
            },
        });
        console.log("Mongo shelters fetched:", mongoResponse.data); // דיבוג: תוצאה מהבקשה ל-MongoDB

        const googleResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${currentLocation.latitude},${currentLocation.longitude}&radius=${radius}&keyword=bomb+shelter&key=${GOOGLE_MAPS_API_KEY}`);
        console.log("Google shelters fetched:", googleResponse.data.results); // דיבוג: תוצאה מהבקשה ל-Google

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
    if (currentLocation) {
        refreshShelters();
    }
}, [currentLocation]);

  const goToDefaultLocation = () => {
    console.log("goToDefaultLocation called");
    const location = defaultLocation || currentLocation;

    if (location) {
      console.log("Navigating to location:", location);
      setSelectedShelter(null);
      mapRef.current?.animateToRegion({
        ...location,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      console.log("No GPS location available.");
    }
  };

  if (!currentLocation) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
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

      <TouchableOpacity onPress={goToDefaultLocation} style={styles.customLocationButton}>
          <Icon name="my-location" size={24} color="white" />
      </TouchableOpacity>

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
          <Text>{t('refresh_shelters')}</Text>
          <TouchableOpacity onPress={refreshShelters}>
            <Text style={styles.refreshText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
    </View>
  );
};

const styles = StyleSheet.create({
  customLocationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  address: {
    fontSize: 14,
    color: '#000',
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
  refreshContainer: {
    position: 'absolute',
    bottom: 90,
    width: '100%',
    alignItems: 'center',
  },
  refreshText: {
    color: '#007AFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginTop: 8,
  },
});

export default SheltersMap;