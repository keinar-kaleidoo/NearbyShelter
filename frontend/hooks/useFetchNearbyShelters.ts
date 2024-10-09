import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shelter } from '../utils/types';
import { findClosestShelter } from '../utils/utils';
import { useTranslation } from 'react-i18next';  // Import i18n hook

const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgWZ19mRPIeban1W8rLbkeksHCXQ19qs';

const useFetchNearbyShelters = (
  latitude: number | undefined,
  longitude: number | undefined,
  setSheltersLoading: (loading: boolean) => void
) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [closestShelter, setClosestShelter] = useState<Shelter | null>(null);
  const { t } = useTranslation();  // Access the translation function

  useEffect(() => {
    const fetchShelters = async () => {
      if (latitude && longitude) {
        setSheltersLoading(true);
        try {
          // Fetch shelters from MongoDB (approved shelters)
          const responseFromMongo = await axios.get('http://192.168.1.49:5001/api/shelters', {
            params: { latitude, longitude },
          });

          const mongoShelters = responseFromMongo.data.map((shelter: Shelter) => ({
            ...shelter,
            title: t('bomb_shelter'),  // Use translation for "Bomb Shelter"
          }));

          // Fetch shelters from Google Places API
          const radius = 5000;
          const responseFromGoogle = await axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=bomb+shelter&key=${GOOGLE_MAPS_API_KEY}`
          );

          // Combine the shelters from MongoDB and Google
          const detailedGoogleShelters: Shelter[] = await Promise.all(
            responseFromGoogle.data.results.map(async (place: any) => {
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
                title: t('bomb_shelter'),
                description: formattedAddress,
              };
            })
          );

          // Combine MongoDB shelters and Google shelters
          const combinedShelters = [...mongoShelters, ...detailedGoogleShelters];

          setShelters(combinedShelters);
          const closest = findClosestShelter(latitude, longitude, combinedShelters);
          setClosestShelter(closest);
        } catch (error) {
          console.error('Error fetching shelters:', error);
        } finally {
          setSheltersLoading(false);
        }
      }
    };

    fetchShelters();
  }, [latitude, longitude, setSheltersLoading, t]);  // Re-run if the translation function changes (language switch)

  return { shelters, closestShelter };
};

export default useFetchNearbyShelters;