import 'react-native-get-random-values';
import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Button, Alert, TextInput, I18nManager} from 'react-native';
import MapView, {Marker, Region} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/MaterialIcons';  // ייבוא אייקונים

const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgWZ19mRPIeban1W8rLbkeksHCXQ19qs';  // הכנס את מפתח ה-API שלך

interface Shelter {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description: string;
}

const MapScreen: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);
  const [locationName, setLocationName] = useState<string>('מיקום נוכחי');
  const [shelters, setShelters] = useState<Shelter[]>([
    {
      id: '1',
      latitude: 32.908562,
      longitude: 35.284914,
      description: 'Shelter near you',
    },
    {
      id: '2',
      latitude: 32.908562,
      longitude: 35.286914,
      description: 'Another nearby shelter',
    },
  ]);

  useEffect(() => {
    // הפעלת תמיכה ב-RTL
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
    }

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // בקשת Reverse Geocoding למיקום הנוכחי
        axios
          .get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
          )
          .then(response => {
            const address = response.data.results[0]?.formatted_address || 'מיקום לא ידוע';
            setLocationName(address);
          })
          .catch(error => {
            console.error('Error fetching location name:', error);
          });
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );

    // בקשת Reverse Geocoding עבור כל מרחב מוגן
    const fetchShelterNames = async () => {
      const updatedShelters = await Promise.all(
        shelters.map(async shelter => {
          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${shelter.latitude},${shelter.longitude}&key=${GOOGLE_MAPS_API_KEY}`,
            );
            const address = response.data.results[0]?.formatted_address || 'מיקום לא ידוע';
            return { ...shelter, title: address };
          } catch (error) {
            console.error('Error fetching shelter name:', error);
            return shelter;
          }
        })
      );
      setShelters(updatedShelters);
    };

    fetchShelterNames();
  }, []);

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
            description="המיקום שלך"
          />
        )}

        {shelters.map(shelter => (
          <Marker
            key={shelter.id}
            coordinate={{
              latitude: shelter.latitude,
              longitude: shelter.longitude,
            }}
            title={shelter.title || 'מיקום לא ידוע'}
            description={shelter.description}
          />
        ))}
      </MapView>
    </View>
  );
};

const AddShelterScreen: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleSubmit = () => {
    if (coordinates && description) {
      Alert.alert('Success', 'מרחב מוגן נוסף בהצלחה');
      // כאן נוכל בהמשך לשלוח את המידע ל-Backend
    } else {
      Alert.alert('Error', 'יש למלא את כל השדות');
    }
  };

  return (
    <View style={styles.container}>
      <Text>הוסף מרחב מוגן חדש</Text>
      <GooglePlacesAutocomplete
        placeholder="הזן כתובת"
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
            textAlign: 'right',  // הגדרת טקסט לימין
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
        textAlign="right"  // הגדרת טקסט לימין
      />
      <Button title="הוסף מרחב מוגן" onPress={handleSubmit} />
    </View>
  );
};

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'בסביבה') {
              iconName = 'place';  
            } else if (route.name === 'חדש') {
              iconName = 'add-location';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="בסביבה" component={MapScreen} />
        <Tab.Screen name="חדש" component={AddShelterScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    direction: 'rtl',  // כיווניות ימנית-שמאלית (RTL)
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    textAlign: 'right',  // כיוון הטקסט לימין
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;
