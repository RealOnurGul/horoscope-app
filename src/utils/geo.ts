import majorCitiesData from '../data/majorCities.json';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type MajorCity = Coordinates & {
  country: string;
  countryCode: string;
  name: string;
  population: number;
};

export type GlobeSelection = Coordinates & {
  city: MajorCity;
  distanceKm: number;
};

const majorCities = majorCitiesData as MajorCity[];
const EARTH_RADIUS_KM = 6371;

export function findNearestMajorCity(latitude: number, longitude: number): GlobeSelection {
  let nearest = majorCities[0];
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const city of majorCities) {
    const distance = haversineDistance(latitude, longitude, city.latitude, city.longitude);
    if (distance < nearestDistance) {
      nearest = city;
      nearestDistance = distance;
    }
  }

  return {
    city: nearest,
    distanceKm: nearestDistance,
    latitude,
    longitude,
  };
}

export function formatCoordinate(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(3)}° ${value >= 0 ? positive : negative}`;
}

export function normalizeLongitude(longitude: number) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

function haversineDistance(latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number) {
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
