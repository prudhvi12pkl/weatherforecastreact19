import { useActionState } from "react";
import { fetchWeather, fetchForecast } from "../api/weather";

export function useWeather() {
  const [state, searchAction, isPending] = useActionState(
    async (_prevState, formData) => {
      const city = formData.get("city")?.trim();
      if (!city) return { error: "Please enter a city name." };

      try {
        const [weather, forecast] = await Promise.all([
          fetchWeather(city),
          fetchForecast(city),
        ]);
        return { data: weather, forecast, error: null };
      } catch (err) {
        if (err.response?.status === 404)
          return { error: `City "${city}" not found.` };
        return { error: "Something went wrong. Try again." };
      }
    },
    { data: null, forecast: null, error: null },
  );

  return { state, searchAction, isPending };
}
