export const getUserLocation = async () => {
  const fallbackCoordinates = { lat: 59.3293, lng: 18.0686 }; // Stockholm fallback
  const cacheKey = "geolocation";
  const cacheExpiration = 15 * 60 * 1000; //15 min expiration

  const cachedLocation = localStorage.getItem(cacheKey)
  if (cachedLocation) {
    const { lat, lng, timestamp } = JSON.parse(cachedLocation)

    // Use cached location if it's still valid
    if (Date.now() - timestamp < cacheExpiration) {
      console.log("Using cached location:", lat, lng);
      return { lat, lng };
    }
  }

  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
          };

          // Save new location to cache
          localStorage.setItem(cacheKey, JSON.stringify(newLocation));
          console.log("Fetching new geolocation:", newLocation.lat, newLocation.lng);
          resolve({ lat: newLocation.lat, lng: newLocation.lng });
        },
        () => {
          console.warn("Geolocation denied, using fallback.");
          resolve(fallbackCoordinates);
        }
      );
    } else {
      console.warn("Geolocation not supported, using fallback.");
      resolve(fallbackCoordinates);
    }
  });
};