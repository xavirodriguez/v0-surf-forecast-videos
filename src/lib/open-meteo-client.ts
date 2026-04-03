import { z } from 'zod';

// Type definitions for Open-Meteo Marine API
const MarineDataSchema = z.object({
  hourly: z.object({
    time: z.array(z.string()),
    wave_height: z.array(z.number()),
    wave_period: z.array(z.number()),
    wave_direction: z.array(z.number()),
    swell_wave_height: z.array(z.number()),
    swell_wave_period: z.array(z.number()),
    swell_wave_direction: z.array(z.number()),
    wind_wave_height: z.array(z.number()),
  }),
});

export type MarineData = z.infer<typeof MarineDataSchema>;

// Type definitions for Open-Meteo Weather API
const WeatherDataSchema = z.object({
  hourly: z.object({
    time: z.array(z.string()),
    windspeed_10m: z.array(z.number()),
    winddirection_10m: z.array(z.number()),
    temperature_2m: z.array(z.number()),
  }),
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;

/**
 * Fetch marine data (waves, swell) from Open-Meteo
 */
export async function fetchMarineData(
  lat: number,
  lon: number
): Promise<MarineData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly:
      'wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction,wind_wave_height',
    forecast_days: '3',
    timezone: 'auto',
  });

  const url = `https://marine-api.open-meteo.com/v1/marine?${params}`;

  console.log(`[v0] Fetching marine data from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch marine data: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return MarineDataSchema.parse(data);
}

/**
 * Fetch wind and weather data from Open-Meteo
 */
export async function fetchWindData(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: 'windspeed_10m,winddirection_10m,temperature_2m',
    forecast_days: '3',
    timezone: 'auto',
    wind_speed_unit: 'mph',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;

  console.log(`[v0] Fetching wind data from: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch wind data: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return WeatherDataSchema.parse(data);
}
