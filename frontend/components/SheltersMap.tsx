import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Shelter } from '../utils/types';

interface SheltersMapProps {
  currentLocation: { latitude: number; longitude: number };
  locationName: string;
  shelters: Shelter[];
  onNavigate: (latitude: number, longitude: number) => void;
}

const SheltersMap: React.FC<SheltersMapProps> = ({ currentLocation, locationName, shelters, onNavigate }) => {
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
        {/* Current location marker */}
        <Marker
          coordinate={currentLocation}
          title={locationName}
        />

        {/* Shelters markers with Callout */}
        {shelters.map((shelter) => (
          <Marker
            key={`${shelter.id}-${shelter.latitude}-${shelter.longitude}`}  
            coordinate={{
              latitude: shelter.latitude,
              longitude: shelter.longitude,
            }}
            pinColor="darkred"  // Change marker color to dark red
            onPress={() => onNavigate(shelter.latitude, shelter.longitude)}  // Direct navigation on press
          >
            {/* Callout is shown only when pressing the marker */}
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.title}>{shelter.title || 'Unknown Shelter'}</Text>
                <Text style={styles.description}>{shelter.description}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  calloutContainer: {
    padding: 5,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
  description: {
    fontSize: 12,
    color: '#777',
  },
});

export default SheltersMap;