import { groupByDay } from "../utils/groupForecast";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ForecastCard({ forecastData }) {
  const days = groupByDay(forecastData.list);

  return (
    <div className="forecast-card">
      <h3 className="forecast-title">5-day forecast</h3>
      <div className="forecast-list">
        {days.map((day) => {
          const d = new Date(day.date);
          const label = DAYS[d.getUTCDay()];
          const iconUrl = `https://openweathermap.org/img/wn/${day.icon}.png`;

          return (
            <div key={day.date} className="forecast-row">
              <span className="forecast-day">{label}</span>
              <img src={iconUrl} alt={day.description} width={36} height={36} />
              <span className="forecast-desc">{day.description}</span>
              <span className="forecast-temps">
                <span className="temp-high">{day.maxTemp}°</span>
                <span className="temp-low">{day.minTemp}°</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
