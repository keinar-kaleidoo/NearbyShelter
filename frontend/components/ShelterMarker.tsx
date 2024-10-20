import React from 'react';
import { Marker } from 'react-native-maps';

interface Shelter {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description: string;
}

interface Props {
  shelter: Shelter;
  onNavigate: () => void;
}

const ShelterMarker: React.FC<Props> = ({ shelter, onNavigate }) => {
  return (
    <Marker
      key={`${shelter.id}-${shelter.latitude}-${shelter.longitude}`}
      coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
      title={shelter.title || 'Unknown Shelter'}
      description={shelter.description}
      onPress={onNavigate}
    />
  );
};

export default ShelterMarker;