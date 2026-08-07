import { useWeather } from "./hooks/useWeather";
import { useGeoWeather } from "./hooks/useGeoWeather";
import WeatherCard from "./components/WeatherCard";
import ForecastCard from "./components/ForecastCard"; // ← add

export default function App() {
  const { state, searchAction, isPending } = useWeather();
  const geo = useGeoWeather();

  const displayData = state.data ?? geo.data;
  const displayForecast = state.forecast ?? null; // geo doesn't fetch forecast yet
  const displayError = state.error ?? geo.error;
  const isLoading = isPending || geo.isPending;

  return (
    <main className="container">
      <h1 className="title">Weather santh nagar</h1>
      <form action={searchAction} className="search-form">
        <input
          name="city"
          type="text"
          placeholder="Search city..."
          className="search-input"
          autoComplete="off"
        />
        <button type="submit" className="search-btn" disabled={isLoading}>
          {isPending ? "Searching..." : "Search"}
        </button>
      </form>
      {isLoading && !displayData && (
        <p className="loading">Detecting your location...</p>
      )}
      {displayError && <p className="error">{displayError}</p>}
      {displayData && <WeatherCard data={displayData} />}
      {displayForecast && <ForecastCard forecastData={displayForecast} />}{" "}
      {/* ← add */}
    </main>
  );
}
