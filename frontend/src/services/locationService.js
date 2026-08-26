/**
 * HealthFlow AI - Reusable Location & Geolocation Service
 * Provides browser GPS location detection, fallback handling, distance calculation (Haversine formula),
 * and spatial filter helpers for Hospitals, Blood Banks, and Emergency Triage.
 */

// Default Fallback Coordinates (Hyderabad, TS / Center India)
export const DEFAULT_LOCATION = {
  latitude: 17.3850,
  longitude: 78.4867,
  city: "Hyderabad",
  state: "Telangana",
  address: "Hyderabad Center, Telangana",
  isFallback: true
};

/**
 * Calculates the Haversine distance between two geographical points in kilometers.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Retrieves the user's current GPS location with error fallback.
 */
export function getUserLocation(options = { timeout: 10000, highAccuracy: true }) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation API not supported by browser. Using default center.");
      return resolve(DEFAULT_LOCATION);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          city: "Detected Location",
          state: "",
          address: `GPS (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
          isFallback: false
        });
      },
      (error) => {
        console.warn("Geolocation error or permission denied:", error.message);
        resolve(DEFAULT_LOCATION);
      },
      {
        enableHighAccuracy: options.highAccuracy,
        timeout: options.timeout,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Radius options in kilometers for location filtering
 */
export const RADIUS_OPTIONS = [
  { label: "2 km", value: 2 },
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "All Facilities", value: 500 }
];
