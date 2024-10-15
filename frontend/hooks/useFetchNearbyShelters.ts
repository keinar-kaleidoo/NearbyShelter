import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shelter } from '../utils/types';
import { findClosestShelter } from '../utils/utils';
import { useTranslation } from 'react-i18next';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDNgWZ19mRPIeban1W8rLbkeksHCXQ19qs';

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
          // קריאה מקבילה ל-MongoDB ול-Google Places
          const [mongoResponse, googleResponse] = await Promise.all([
            axios.get('https://saferoute.digital-solution.co.il/api/shelters', { params: { latitude, longitude } }), // קריאה ל-MongoDB
            axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=bomb+shelter&key=${GOOGLE_MAPS_API_KEY}`) // קריאה ל-Google Places
          ]);

          // עיבוד מקלטים ממאגר MongoDB
          const mongoShelters = mongoResponse.data.map((shelter: Shelter) => ({
            ...shelter,
            title: t('bomb_shelter'), // תרגום לשם המקלט
          }));

          // עיבוד מקלטים מ-Google Places במקביל
          const detailedGoogleShelters: Shelter[] = await Promise.all(
            googleResponse.data.results.map(async (place: any) => {
              const lat = place.geometry.location.lat;
              const lng = place.geometry.location.lng;

              // שימוש ישיר בשם הכתובת מ-Google Places (ללא קריאת Geocoding נוספת)
              const formattedAddress = place.vicinity || 'Unknown address';

              return {
                id: place.place_id,
                latitude: lat,
                longitude: lng,
                title: t('bomb_shelter'), // תרגום לשם המקלט
                description: formattedAddress,
              };
            })
          );

          // שילוב בין המקלטים ממאגר MongoDB ו-Google Places
          const combinedShelters = [...mongoShelters, ...detailedGoogleShelters];

          setShelters(combinedShelters);

          // מציאת המקלט הקרוב ביותר
          const closest = findClosestShelter(latitude, longitude, combinedShelters);
          setClosestShelter(closest);

        } catch (error) {
          // טיפול שגיאות מפורט יותר
          if (error.response) {
            // The server responded with a status code that falls out of the range of 2xx
            console.error('Server responded with an error:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error in setting up the request:', error.message);
          }

          // הדפסת קונפיגורציית הקריאה כדי לקבל עוד מידע על השגיאה
          console.error('Error config:', error.config);
        } finally {
          setSheltersLoading(false);
        }
      }
    };

    // הרצת הפונקציה
    fetchShelters();
  }, [latitude, longitude, setSheltersLoading, t]); // ריצה מחדש כאשר הקואורדינטות או השפה משתנים

  return { shelters, closestShelter };
};

export default useFetchNearbyShelters;