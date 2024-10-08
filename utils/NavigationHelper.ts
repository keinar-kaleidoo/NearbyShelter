import {Linking} from 'react-native';

export const openNavigation = (latitude: number, longitude: number) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  Linking.openURL(url).catch(err => console.error('Error opening maps: ', err));
};
