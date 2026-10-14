import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react';

interface Props {
  code: string;
  className?: string;
  isDay?: boolean;
}

export function WeatherIcon({ code, className = 'h-6 w-6', isDay = true }: Props) {
  const iconMap: Record<string, typeof Sun> = {
    sun: isDay ? Sun : Moon,
    'cloud-sun': CloudSun,
    cloud: Cloud,
    'cloud-fog': CloudFog,
    'cloud-drizzle': CloudDrizzle,
    'cloud-rain': CloudRain,
    'cloud-snow': CloudSnow,
    'cloud-lightning': CloudLightning,
  };

  const Icon = iconMap[code] ?? Cloud;
  return <Icon className={className} />;
}
