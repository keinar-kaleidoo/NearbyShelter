import { Shelter } from "./types";

export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // רדיוס כדור הארץ בקילומטרים
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  export const findClosestShelter = (currentLat: number, currentLng: number, shelters: Shelter[]) => {
    let closestShelter = shelters[0];
    let closestDistance = getDistance(currentLat, currentLng, closestShelter.latitude, closestShelter.longitude);
  
    shelters.forEach(shelter => {
      const distance = getDistance(currentLat, currentLng, shelter.latitude, shelter.longitude);
      if (distance < closestDistance) {
        closestShelter = shelter;
        closestDistance = distance;
      }
    });
  
    return closestShelter;
  };
  