import { useState, useEffect } from "react";
import { fetchWeatherByCoords } from "../api/weather";

export function useGeoWeather() {
  const [geoState, setGeoState] = useState({
    data: null,
    error: null,
    isPending: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setTimeout(() => {
        setGeoState({
          data: null,
          isPending: false,
          error: "Geolocation is not supported by your browser.",
        });
      }, 0);
      return;
    }

    setTimeout(() => {
      setGeoState((s) => ({ ...s, isPending: true }));
    }, 0);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await fetchWeatherByCoords(latitude, longitude);
          setGeoState({ data, error: null, isPending: false });
        } catch {
          setGeoState({
            data: null,
            isPending: false,
            error: "Could not fetch weather for your location.",
          });
        }
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location access denied. Allow permission and try again."
            : "Could not get your location.";
        setGeoState({ data: null, isPending: false, error: msg });
      },
      { timeout: 10000 },
    );
  }, []);

  return geoState;
}
