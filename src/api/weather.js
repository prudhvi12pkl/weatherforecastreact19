import axios from "axios";

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export async function fetchWeather(city) {
  const { data } = await axios.get(`${BASE_URL}/weather`, {
    params: {
      q: city,
      appid: API_KEY,
      units: "metric", // use 'imperial' for °F
    },
  });
  return data;
}

export async function fetchWeatherByCoords(lat, lon) {
  const { data } = await axios.get(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: "metric",
    },
  });
  return data;
}

export async function fetchForecast(city) {
  const { data } = await axios.get(`${BASE_URL}/forecast`, {
    params: { q: city, appid: API_KEY, units: "metric" },
  });
  return data;
}

export async function fetchForecastByCoords(lat, lon) {
  const { data } = await axios.get(`${BASE_URL}/forecast`, {
    params: { lat, lon, appid: API_KEY, units: "metric" },
  });
  return data;
}
