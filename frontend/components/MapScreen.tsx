import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View, Button } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import SheltersMap from './SheltersMap';
import useFetchNearbyShelters from '../hooks/useFetchNearbyShelters';
import { openNavigation } from '../utils/NavigationHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { GOOGLE_MAPS_API_KEY } from '@env';
import i18n from '../i18n';

interface MapScreenProps {
  customLocation: { latitude: number; longitude: number } | null;
}

const MapScreen: React.FC<MapScreenProps> = ({ customLocation }) => {
  const { t } = useTranslation();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>(t('you_are_here'));
  const [loading, setLoading] = useState<boolean>(true);
  const [sheltersLoading, setSheltersLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const loadCustomLocation = async () => {
    try {
      if (customLocation) {
        console.log('Using custom location:', customLocation);
        setCurrentLocation(customLocation);
        return true;
      }

      const storedCustomLocation = await AsyncStorage.getItem('customLocation');
      if (storedCustomLocation) {
        const { latitude, longitude } = JSON.parse(storedCustomLocation);
        console.log('Setting stored custom location:', latitude, longitude);
        setCurrentLocation({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading custom location:', error);
      setHasError(true);
      return false;
    }
  };

  const fetchAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      // Use i18n language setting to set the address language
      const language = i18n.language === 'he' ? 'he' : 'en';
  
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=${language}`);
      const addressComponents = response.data.results[0].address_components;
  
      // Extract street number, route (street name), and locality (city)
      const streetNumber = addressComponents.find((component: any) =>
        component.types.includes('street_number')
      )?.long_name;
      const route = addressComponents.find((component: any) =>
        component.types.includes('route')
      )?.long_name;
      const locality = addressComponents.find((component: any) =>
        component.types.includes('locality')
      )?.long_name;
  
      // Format the address without the country
      const formattedAddress = `${streetNumber ? streetNumber + ' ' : ''}${route ? route + ', ' : ''}${locality || ''}`.trim();
      return formattedAddress || t('unknown_location');
    } catch (error) {
      console.error('Error fetching address:', error);
      return t('unknown_location');
    }
  };
  
  

  useEffect(() => {
    const fetchLocation = async () => {
      const customLocationSet = await loadCustomLocation();
      if (!customLocationSet) {
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            console.log('Setting GPS location:', latitude, longitude);
            setCurrentLocation({ latitude, longitude });
            setLoading(false);
            setHasError(false);

            axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`)
              .then(response => {
                const address = response.data.results[0]?.formatted_address || t('unknown_location');
                setLocationName(t('you_are_here'));
              })
              .catch(error => {
                console.error('Error fetching location name:', error);
                setLocationName(t('unknown_location'));
                setHasError(true);
              });
          },
          error => {
            console.log('Error fetching location:', error);
            setLocationName(t('location_retrieval_error'));
            setLoading(false);
            setHasError(true);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      } else {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [t, customLocation]);

  const { shelters, closestShelter } = useFetchNearbyShelters(
    currentLocation?.latitude,
    currentLocation?.longitude,
    setSheltersLoading
  );

  useEffect(() => {
    const showClosestShelterAlert = async () => {
      if (closestShelter) {
        const address = await fetchAddressFromCoordinates(closestShelter.latitude, closestShelter.longitude);
        Alert.alert(
          t('closest_shelter_found'),
          `${t('closest_shelter_is_at')} ${address}`,
          [
            {
              text: t('navigate'),
              onPress: () => openNavigation(closestShelter.latitude, closestShelter.longitude),
            },
            { text: t('cancel'), style: 'cancel' },
          ]
        );
      }
    };

    showClosestShelterAlert();
  }, [closestShelter, t]);

  const handleRefresh = async () => {
    console.log('Refreshing location...');
    setLoading(true);
    const customLocationSet = await loadCustomLocation();
    if (!customLocationSet) {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          console.log('Setting GPS location on refresh:', latitude, longitude);
          setCurrentLocation({ latitude, longitude });
          setLoading(false);
          setHasError(false);
        },
        error => {
          console.log('Error fetching location:', error);
          setLoading(false);
          setHasError(true);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    } else {
      setLoading(false);
      setHasError(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={{ position: 'absolute', top: '50%', left: '50%' }} />
      )}
      {!loading && !sheltersLoading && (
        <SheltersMap
          currentLocation={currentLocation || { latitude: 32.908562, longitude: 35.284914 }}
          locationName={locationName}
          shelters={shelters}
          onNavigate={openNavigation}
        />
      )}
      {!loading && sheltersLoading && (
        <ActivityIndicator size="large" color="#00ff00" style={{ position: 'absolute', top: '50%', left: '50%' }} />
      )}
      {!loading && hasError && (
        <View style={{ position: 'absolute', top: 20, left: 20}}>
          <Button title={t('refresh_location')} onPress={handleRefresh}/>
        </View>
      )}
    </View>
  );
};

export default MapScreen;