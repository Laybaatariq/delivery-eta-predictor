import axios from 'axios';
import { AREAS } from '../config/areas.js';

const TTL_MS = 10 * 60 * 1000;
const cache = new Map();
const PROVIDER = process.env.WEATHER_PROVIDER || 'open-meteo';

// WMO weather codes (Open-Meteo)
const isRainCode = (c) => (c >= 51 && c <= 67) || (c >= 80 && c <= 82) || (c >= 95 && c <= 99);

const describeCode = (c) => {
  if (c === 0) return 'Clear sky';
  if (c <= 3) return 'Partly cloudy';
  if (c <= 48) return 'Fog';
  if (c <= 57) return 'Drizzle';
  if (c <= 67) return 'Rain';
  if (c <= 77) return 'Snow';
  if (c <= 82) return 'Rain showers';
  if (c <= 86) return 'Snow showers';
  return 'Thunderstorm';
};

async function fromOpenMeteo(area) {
  const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: area.lat,
      longitude: area.lng,
      current: 'temperature_2m,precipitation,weather_code',
    },
    timeout: 5000,
  });
  const c = data.current;
  return {
    description: describeCode(c.weather_code),
    tempC: Math.round(c.temperature_2m),
    raining: isRainCode(c.weather_code) || c.precipitation > 0,
  };
}

async function fromOpenWeather(area) {
  const { data } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: {
      lat: area.lat,
      lon: area.lng,
      appid: process.env.WEATHER_API_KEY,
      units: 'metric',
    },
    timeout: 5000,
  });
  const main = data.weather?.[0]?.main ?? '';
  return {
    description: data.weather?.[0]?.description ?? main,
    tempC: Math.round(data.main?.temp ?? 0),
    raining: ['Rain', 'Drizzle', 'Thunderstorm'].includes(main) || (data.rain?.['1h'] ?? 0) > 0,
  };
}

async function fetchArea(area) {
  const w = PROVIDER === 'openweather' ? await fromOpenWeather(area) : await fromOpenMeteo(area);
  return { area: area.name, lat: area.lat, lng: area.lng, error: false, ...w };
}

export async function getAreaWeather() {
  if (PROVIDER === 'openweather' && !process.env.WEATHER_API_KEY) {
    return {
      updatedAt: null,
      areas: AREAS.map((a) => ({
        area: a.name, lat: a.lat, lng: a.lng,
        error: true, message: 'WEATHER_API_KEY not set',
      })),
    };
  }

  const now = Date.now();
  const results = await Promise.allSettled(
    AREAS.map(async (area) => {
      const hit = cache.get(area.name);
      if (hit && now - hit.at < TTL_MS) return hit.data;
      try {
        const data = await fetchArea(area);
        cache.set(area.name, { at: now, data });
        return data;
      } catch {
        if (hit) return hit.data;
        return {
          area: area.name, lat: area.lat, lng: area.lng,
          error: true, message: 'Weather unavailable',
        };
      }
    })
  );

  return {
    updatedAt: new Date(now).toISOString(),
    areas: results.map((r) => r.value),
  };
}