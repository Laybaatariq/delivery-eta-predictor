export default function WeatherPanel({ weather }) {
  if (!weather.length) {
    return <p className="weather">Loading weather...</p>;
  }

  const keyMissing = weather.every((w) => w.message === 'WEATHER_API_KEY not set');

  return (
    <>
      {keyMissing && (
        <p className="weather">
          Live weather is off. Set WEATHER_API_KEY in backend/.env and restart the backend.
        </p>
      )}
      <div className="wx-list">
        {weather.map((w) => (
          <div key={w.area} className={`wx-item ${w.raining ? 'rain' : ''}`}>
            <span>{w.area}</span>
            <span>
              {w.error ? 'Unavailable' : `${w.description || w.condition}, ${w.tempC}°C`}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}