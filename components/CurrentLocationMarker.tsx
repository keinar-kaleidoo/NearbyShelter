import React from 'react';
import { Marker } from 'react-native-maps';

interface Props {
  location: { latitude: number; longitude: number };
  locationName: string;
}

const CurrentLocationMarker: React.FC<Props> = ({ location, locationName }) => {
  return (
    <Marker
      coordinate={location}
      title={locationName}
      description="Your Location"
    />
  );
};

export default CurrentLocationMarker;