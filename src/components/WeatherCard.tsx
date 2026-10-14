import { useEffect, useState } from 'react';
import { CloudSun, Droplets, Loader2, RefreshCw, Sun, Thermometer, Wind } from 'lucide-react';
import { fetchBerlinWeather, getNext12Hours, getWeatherInfo, type WeatherData } from '@/lib/weather';
import { WeatherIcon } from './WeatherIcon';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchBerlinWeather();
      setWeather(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="glass rounded-3xl p-8 h-[480px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="glass rounded-3xl p-8 h-[480px] flex flex-col items-center justify-center gap-4">
        <p className="text-ink-300 text-sm">Couldn't load weather data.</p>
        <button
          onClick={() => load()}
          className="flex items-center gap-2 rounded-xl bg-brand-500/20 px-4 py-2 text-sm text-brand-300 hover:bg-brand-500/30 transition"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  const info = getWeatherInfo(weather.weatherCode);
  const hourly = getNext12Hours(weather);

  return (
    <div className="glass rounded-3xl p-8 animate-fade-in-up overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between mb-6 relative">
        <div>
          <p className="text-ink-400 text-xs font-medium uppercase tracking-widest mb-1">Berlin Weather</p>
          <h2 className="text-ink-50 font-display text-lg font-semibold">Current Conditions</h2>
        </div>
        <button
          onClick={() => load(true)}
          className="p-2 rounded-xl hover:bg-white/5 transition text-ink-400 hover:text-ink-100"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-6 mb-6 relative">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-2xl animate-pulse-slow" />
          <WeatherIcon code={info.icon} className="h-16 w-16 text-brand-300 relative" isDay={weather.isDay} />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-ink-50 font-display text-5xl font-bold">{weather.temperature}</span>
            <span className="text-ink-300 text-2xl font-light">°C</span>
          </div>
          <p className="text-ink-200 text-sm font-medium">{info.label}</p>
          <p className="text-ink-400 text-xs">Feels like {weather.apparentTemperature}°C</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat icon={Wind} label="Wind" value={`${weather.windSpeed} km/h`} />
        <Stat icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
        <Stat icon={Thermometer} label="Feels" value={`${weather.apparentTemperature}°C`} />
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-3">
          <CloudSun className="h-3.5 w-3.5 text-ink-400" />
          <span className="text-ink-400 text-xs font-medium uppercase tracking-wider">Next 12 Hours</span>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {hourly.map((h, i) => {
            const hi = getWeatherInfo(h.code);
            const time = new Date(h.time);
            return (
              <div
                key={i}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-2xl bg-white/[0.03] px-3 py-3 border border-white/[0.04] min-w-[52px]"
              >
                <span className="text-ink-400 text-[10px] font-medium">
                  {i === 0 ? 'Now' : time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                </span>
                <WeatherIcon code={hi.icon} className="h-5 w-5 text-brand-300" />
                <span className="text-ink-100 text-sm font-semibold">{h.temp}°</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Sun className="h-3.5 w-3.5 text-ink-400" />
          <span className="text-ink-400 text-xs font-medium uppercase tracking-wider">5-Day Forecast</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {weather.daily.time.map((t, i) => {
            const di = getWeatherInfo(weather.daily.weatherCode[i]);
            const date = new Date(t);
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/[0.03] px-2 py-3 border border-white/[0.04]"
              >
                <span className="text-ink-400 text-[10px] font-medium">
                  {i === 0 ? 'Today' : DAYS[date.getDay()]}
                </span>
                <WeatherIcon code={di.icon} className="h-6 w-6 text-brand-300" />
                <div className="flex flex-col items-center">
                  <span className="text-ink-100 text-sm font-semibold">{Math.round(weather.daily.tempMax[i])}°</span>
                  <span className="text-ink-500 text-xs">{Math.round(weather.daily.tempMin[i])}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wind;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-ink-400" />
        <span className="text-ink-400 text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-ink-100 text-sm font-semibold">{value}</p>
    </div>
  );
}

