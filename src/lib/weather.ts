export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  isDay: boolean;
  hourly: {
    time: string[];
    temperature: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    weatherCode: number[];
  };
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
}

const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: 'sun' },
  1: { label: 'Mainly clear', icon: 'sun' },
  2: { label: 'Partly cloudy', icon: 'cloud-sun' },
  3: { label: 'Overcast', icon: 'cloud' },
  45: { label: 'Fog', icon: 'cloud-fog' },
  48: { label: 'Rime fog', icon: 'cloud-fog' },
  51: { label: 'Light drizzle', icon: 'cloud-drizzle' },
  53: { label: 'Drizzle', icon: 'cloud-drizzle' },
  55: { label: 'Heavy drizzle', icon: 'cloud-drizzle' },
  56: { label: 'Freezing drizzle', icon: 'cloud-drizzle' },
  57: { label: 'Freezing drizzle', icon: 'cloud-drizzle' },
  61: { label: 'Light rain', icon: 'cloud-rain' },
  63: { label: 'Rain', icon: 'cloud-rain' },
  65: { label: 'Heavy rain', icon: 'cloud-rain' },
  66: { label: 'Freezing rain', icon: 'cloud-rain' },
  67: { label: 'Freezing rain', icon: 'cloud-rain' },
  71: { label: 'Light snow', icon: 'cloud-snow' },
  73: { label: 'Snow', icon: 'cloud-snow' },
  75: { label: 'Heavy snow', icon: 'cloud-snow' },
  77: { label: 'Snow grains', icon: 'cloud-snow' },
  80: { label: 'Rain showers', icon: 'cloud-rain' },
  81: { label: 'Rain showers', icon: 'cloud-rain' },
  82: { label: 'Violent showers', icon: 'cloud-rain' },
  85: { label: 'Snow showers', icon: 'cloud-snow' },
  86: { label: 'Snow showers', icon: 'cloud-snow' },
  95: { label: 'Thunderstorm', icon: 'cloud-lightning' },
  96: { label: 'Thunderstorm', icon: 'cloud-lightning' },
  99: { label: 'Thunderstorm', icon: 'cloud-lightning' },
};

export function getWeatherInfo(code: number): { label: string; icon: string } {
  return WEATHER_CODES[code] ?? { label: 'Unknown', icon: 'cloud' };
}

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchBerlinWeather(): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: '52.52',
    longitude: '13.405',
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,is_day',
    hourly: 'temperature_2m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'Europe/Berlin',
    forecast_days: '5',
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params.toString()}`);
  if (!res.ok) throw new Error('Weather request failed');
  const data = await res.json();

  return {
    temperature: Math.round(data.current.temperature_2m),
    apparentTemperature: Math.round(data.current.apparent_temperature),
    weatherCode: data.current.weather_code,
    windSpeed: Math.round(data.current.wind_speed_10m),
    humidity: data.current.relative_humidity_2m,
    isDay: data.current.is_day === 1,
    hourly: {
      time: data.hourly.time,
      temperature: data.hourly.temperature_2m,
      weatherCode: data.hourly.weather_code,
    },
    daily: {
      time: data.daily.time,
      tempMax: data.daily.temperature_2m_max,
      tempMin: data.daily.temperature_2m_min,
      weatherCode: data.daily.weather_code,
    },
  };
}

export function getNext12Hours(weather: WeatherData): { time: string; temp: number; code: number }[] {
  const now = new Date();
  const idx = weather.hourly.time.findIndex((t) => new Date(t) >= now);
  const start = idx === -1 ? 0 : idx;
  return Array.from({ length: 12 }, (_, i) => {
    const j = start + i;
    return {
      time: weather.hourly.time[j] ?? '',
      temp: Math.round(weather.hourly.temperature[j] ?? 0),
      code: weather.hourly.weatherCode[j] ?? 0,
    };
  });
}
