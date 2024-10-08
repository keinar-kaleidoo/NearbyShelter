import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shelter } from '../utils/types';
import { findClosestShelter } from '../utils/utils';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgWZ19mRPIeban1W8rLbkeksHCXQ19qs';

const useFetchNearbyShelters = (
  latitude: number | undefined,
  longitude: number | undefined,
  setSheltersLoading: (loading: boolean) => void
) => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [closestShelter, setClosestShelter] = useState<Shelter | null>(null);

  useEffect(() => {
    const fetchShelters = async () => {
      if (latitude && longitude) {
        setSheltersLoading(true);
        try {
          const radius = 5000;
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=bomb+shelter&key=${GOOGLE_MAPS_API_KEY}`
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

          setShelters(detailedShelters);
          const closest = findClosestShelter(latitude, longitude, detailedShelters);
          setClosestShelter(closest);
        } catch (error) {
          console.error('Error fetching nearby shelters:', error);
        } finally {
          setSheltersLoading(false);
        }
      }
    };

    fetchShelters();
  }, [latitude, longitude, setSheltersLoading]);

  return { shelters, closestShelter };
};

export default useFetchNearbyShelters;
