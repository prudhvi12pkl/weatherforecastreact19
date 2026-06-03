export default function WeatherCard({ data }) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="city">
            {data.name}, {data.sys.country}
          </h2>
          <p className="description">{data.weather[0].description}</p>
        </div>
        <img
          src={iconUrl}
          alt={data.weather[0].description}
          width={80}
          height={80}
        />
      </div>

      <p className="temp">{Math.round(data.main.temp)}°C</p>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Feels like</span>
          <span className="stat-value">
            {Math.round(data.main.feels_like)}°C
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Humidity</span>
          <span className="stat-value">{data.main.humidity}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Wind</span>
          <span className="stat-value">{Math.round(data.wind.speed)} m/s</span>
        </div>
      </div>
    </div>
  );
}
