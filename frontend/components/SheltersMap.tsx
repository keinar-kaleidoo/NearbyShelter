import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Shelter } from '../utils/types';

interface SheltersMapProps {
  currentLocation: { latitude: number; longitude: number };
  locationName: string;
  shelters: Shelter[];
  onNavigate: (latitude: number, longitude: number) => void;
}

const SheltersMap: React.FC<SheltersMapProps> = ({ currentLocation, locationName, shelters, onNavigate }) => {
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  const handleMarkerPress = (shelter: Shelter) => {
    setSelectedShelter(shelter);  // עדכון המקלט שנבחר
  };

  const handleNavigatePress = () => {
    if (selectedShelter) {
      onNavigate(selectedShelter.latitude, selectedShelter.longitude);  // ניווט למקלט הנבחר
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
        {/* Current location marker */}
        <Marker
          coordinate={currentLocation}
          title={locationName}
        />

        {/* Shelters markers */}
        {shelters.map((shelter) => (
          <Marker
            key={`${shelter.id}-${shelter.latitude}-${shelter.longitude}`}
            coordinate={{
              latitude: shelter.latitude,
              longitude: shelter.longitude,
            }}
            pinColor="darkred"  // שינוי צבע המרקר לאדום כהה
            onPress={() => handleMarkerPress(shelter)}  // הצגת פרטים בלחיצה
          />
        ))}
      </MapView>

      {/* הצגת פרטי המקלט שנבחר בתחתית המסך עם כפתור ניווט */}
      {selectedShelter && (
        <View style={styles.shelterInfo}>
          <Text style={styles.title}>{selectedShelter.title || 'Shelter'}</Text>
          <Text style={styles.description}>{selectedShelter.description || 'No description available'}</Text>
          {/* כפתור ניווט */}
          <Button title="Navigate" onPress={handleNavigatePress} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shelterInfo: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
});

export default SheltersMap;