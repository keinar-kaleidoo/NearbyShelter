import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import ShelterMarker from './ShelterMarker';
import {findClosestShelter} from './utils/utils';
import {openNavigation} from './utils/NavigationHelper';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgWZ19mRPIeban1W8rLbkeksHCXQ19qs';

interface Shelter {
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description: string;
  }
  
  const MapScreen: React.FC = () => {
    const [currentLocation, setCurrentLocation] = useState<Region | null>(null);
    const [locationName, setLocationName] = useState<string>('Current Location');
    const [shelters, setShelters] = useState<Shelter[]>([]);  // מוגדר כעת מערך של אובייקטים מסוג Shelter
  
    useEffect(() => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setCurrentLocation({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
  
          // Reverse Geocoding לקבלת שם המיקום הנוכחי
          axios
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
            )
            .then(response => {
              const address = response.data.results[0]?.formatted_address || 'Unknown Location';
              setLocationName(address);
            });
  
          // שלב שליפת המרחבים המוגנים הקרובים
          fetchNearbyShelters(latitude, longitude);
        },
        error => console.log(error),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
    }, []);
  
    // שלב שליפת המרחבים המוגנים בסביבה
    const fetchNearbyShelters = async (latitude: number, longitude: number) => {
      try {
        const radius = 5000;
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=bomb+shelter&key=${GOOGLE_MAPS_API_KEY}`,
        );
  
        const detailedShelters: Shelter[] = await Promise.all(
          response.data.results.map(async (place: any) => {
            const lat = place.geometry.location.lat;
            const lng = place.geometry.location.lng;
            const reverseGeocodeResponse = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
            );
            const formattedAddress = reverseGeocodeResponse.data.results[0]?.formatted_address || place.vicinity;
  
            return {
              id: place.place_id,
              latitude: lat,
              longitude: lng,
              title: place.name,
              description: formattedAddress,
            };
          })
        );
  
        setShelters(detailedShelters);  // שימוש במערך מסוג Shelter
  
        // מציאת המיקום הקרוב ביותר
        const closestShelter = findClosestShelter(latitude, longitude, detailedShelters);
  
        if (closestShelter) {
          // הצגת התראה עם המיקום הקרוב ביותר
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
  
      } catch (error) {
        console.error('Error fetching nearby shelters:', error);
      }
    };
  
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation?.latitude || 32.908562,
            longitude: currentLocation?.longitude || 35.284914,
            latitudeDelta: 0.8,
            longitudeDelta: 0.8,
          }}
          region={currentLocation || undefined}>
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title={locationName}
              description="Your Location"
            />
          )}
          {shelters.map(shelter => (
            <ShelterMarker
              key={shelter.id}
              shelter={shelter}
              onNavigate={() => openNavigation(shelter.latitude, shelter.longitude)}
            />
          ))}
        </MapView>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
  });
  
  export default MapScreen;