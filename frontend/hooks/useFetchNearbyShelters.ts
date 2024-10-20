import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shelter } from '../utils/types';
import { findClosestShelter } from '../utils/utils';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { GOOGLE_MAPS_API_KEY } from '@env';

// Function to deduplicate shelters based on coordinates
function deduplicateShelters(shelters: Shelter[]) {
  const uniqueShelters = shelters.reduce((unique: Shelter[], current) => {
    const isDuplicate = unique.some(
      (shelter) =>
        Math.abs(shelter.latitude - current.latitude) < 0.0001 &&
        Math.abs(shelter.longitude - current.longitude) < 0.0001
    );
    if (!isDuplicate) {
      unique.push(current);
    }
    return unique;
  }, []);
  return uniqueShelters;
}

const useFetchNearbyShelters = (
  latitude: number | undefined,
  longitude: number | undefined,
  setSheltersLoading: (loading: boolean) => void
) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [closestShelter, setClosestShelter] = useState<Shelter | null>(null);
  const { t } = useTranslation(); // Access the translation function

  useEffect(() => {
    const fetchShelters = async () => {
      if (latitude && longitude) {
        setSheltersLoading(true);
        try {
          const [mongoResponse, googleResponse] = await Promise.all([
            axios.get('https://saferoute.digital-solution.co.il/api/shelters', { params: { latitude, longitude } }), // MongoDB fetch
            axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=bomb+shelter&key=${GOOGLE_MAPS_API_KEY}`)
          ]);

          const mongoShelters = mongoResponse.data.map((shelter: Shelter) => ({
            ...shelter,
            title: t('bomb_shelter'),
          }));

          const detailedGoogleShelters: Shelter[] = await Promise.all(
            googleResponse.data.results.map(async (place: any) => {
              const lat = place.geometry.location.lat;
              const lng = place.geometry.location.lng;

              const formattedAddress = place.vicinity || 'Unknown address';

              return {
                id: place.place_id,
                latitude: lat,
                longitude: lng,
                title: t('bomb_shelter'),
                description: formattedAddress,
              };
            })
          );

          const combinedShelters = [...mongoShelters, ...detailedGoogleShelters];
          const uniqueShelters = deduplicateShelters(combinedShelters);

          setShelters(uniqueShelters);

          const closest = findClosestShelter(latitude, longitude, uniqueShelters);
          setClosestShelter(closest);

        } catch (error: unknown) { // explicitly typing 'error' as 'unknown'
          if (axios.isAxiosError(error)) {
            if (error.response) {
              console.error('Server responded with an error:', error.response.status);
              console.error('Response data:', error.response.data);
              console.error('Response headers:', error.response.headers);
            } else if (error.request) {
              console.error('No response received:', error.request);
            } else {
              console.error('Error message:', error.message);
            }

            // Safe access to error.config after casting to AxiosError
            console.error('Error config:', (error as AxiosError).config);
          } else {
            console.error('An unexpected error occurred:', error);
          }
        } finally {
          setSheltersLoading(false);
        }
      }
    };

    fetchShelters();
  }, [latitude, longitude, setSheltersLoading, t]);

  return { shelters, closestShelter };
};

export default useFetchNearbyShelters;