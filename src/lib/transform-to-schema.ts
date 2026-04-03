import { SurfForecastProps } from '../schemas/surf-forecast';
import { MarineData } from './open-meteo-client';
import { WeatherData } from './open-meteo-client';
import { TideEvent } from './noaa-tides-client';
import { SpotMeta } from './spots';
import { degreesToCardinal } from './degrees-to-cardinal';
import { ratingFromWaveData } from './rating-calculator';

/**
 * Transform API data to SurfForecastProps schema
 */
export function transformToSurfProps(
  marineData: MarineData,
  windData: WeatherData,
  tidesData: TideEvent[],
  waterTemp: number | null,
  spotMeta: SpotMeta,
  targetDate: string
): SurfForecastProps {
  // Get current time or use 6 AM for future dates
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDate);

  let startHourIndex = 0;

  if (target.getTime() === today.getTime()) {
    // For today, start from current hour or next hour
    startHourIndex = now.getHours();
  } else if (target.getTime() > today.getTime()) {
    // For future dates, start from 6 AM
    startHourIndex = 6;
  }

  // Extract the next 8 hours starting from startHourIndex
  const hourlyData = marineData.hourly;
  const weatherHourly = windData.hourly;

  // Build hourly forecast (8 hours)
  const hourlyForecast = Array.from({ length: 8 })
    .map((_, i) => {
      const hourIndex = startHourIndex + i;

      if (
        hourIndex >= hourlyData.wave_height.length ||
        hourIndex >= weatherHourly.windspeed_10m.length
      ) {
        return null;
      }

      const time = new Date(marineData.time[hourIndex]);
      const hour = time.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const waveHeight = hourlyData.wave_height[hourIndex];
      const period = hourlyData.wave_period[hourIndex];
      const windSpeed = weatherHourly.windspeed_10m[hourIndex];

      // Convert to feet if needed
      const displayHeight = spotMeta.currentWaveHeightUnit === 'ft'
        ? waveHeight * 3.28084
        : waveHeight;

      return {
        hour,
        waveHeight: displayHeight,
        period,
        windSpeed,
        windDirection: degreesToCardinal(weatherHourly.winddirection_10m[hourIndex]),
        rating: ratingFromWaveData(waveHeight, period, windSpeed),
      };
    })
    .filter((item) => item !== null);

  // Calculate current wave height and period as average of next 2 hours
  const currentHeight = Math.round(
    ((hourlyData.wave_height[startHourIndex] +
      (hourlyData.wave_height[startHourIndex + 1] || hourlyData.wave_height[startHourIndex])) /
      2) *
      100
  ) / 100;

  const currentPeriod = Math.round(
    ((hourlyData.wave_period[startHourIndex] +
      (hourlyData.wave_period[startHourIndex + 1] || hourlyData.wave_period[startHourIndex])) /
      2) *
      100
  ) / 100;

  const currentDirectionDegrees = hourlyData.wave_direction[startHourIndex];
  const currentDirectionCardinal = degreesToCardinal(currentDirectionDegrees);

  const windDirectionDegrees = weatherHourly.winddirection_10m[startHourIndex];
  const windDirectionCardinal = degreesToCardinal(windDirectionDegrees);
  const windSpeed = weatherHourly.windspeed_10m[startHourIndex];

  // Convert to display units
  const displayWaveHeight = spotMeta.currentWaveHeightUnit === 'ft'
    ? currentHeight * 3.28084
    : currentHeight;

  // Get water temperature, use air temp as fallback if available
  const tempCelsius = waterTemp ?? weatherHourly.temperature_2m[startHourIndex];
  const displayTemp = spotMeta.waterTempUnit === 'F'
    ? (tempCelsius * 9) / 5 + 32
    : tempCelsius;

  // Build swell data from Open-Meteo swell components
  const swellData = [];

  // Primary swell
  if (hourlyData.swell_wave_height[startHourIndex] > 0) {
    swellData.push({
      height: hourlyData.swell_wave_height[startHourIndex],
      period: hourlyData.swell_wave_period[startHourIndex],
      direction: degreesToCardinal(hourlyData.swell_wave_direction[startHourIndex]),
      directionDegrees: hourlyData.swell_wave_direction[startHourIndex],
    });
  }

  // Calculate overall rating
  const overallRating = ratingFromWaveData(currentHeight, currentPeriod, windSpeed);

  // Filter and transform tides
  const displayTides = tidesData
    .slice(0, 4)
    .map((tide) => ({
      ...tide,
      height: spotMeta.waterTempUnit === 'F' ? tide.height * 3.28084 : tide.height,
    }));

  return {
    spotName: spotMeta.spotName,
    spotLocation: spotMeta.spotLocation,
    date: targetDate,

    currentWaveHeight: displayWaveHeight,
    currentWaveHeightUnit: spotMeta.currentWaveHeightUnit,
    currentPeriod,
    currentDirection: currentDirectionCardinal,
    currentDirectionDegrees,

    waterTemp: Math.round(displayTemp * 10) / 10,
    waterTempUnit: spotMeta.waterTempUnit,

    windSpeed: Math.round(windSpeed * 10) / 10,
    windDirection: windDirectionCardinal,
    windDirectionDegrees,

    overallRating,

    hourlyForecast: hourlyForecast.slice(0, 8),
    swellData,
    tides: displayTides,

    primaryColor: spotMeta.primaryColor,
    secondaryColor: spotMeta.secondaryColor,
    backgroundColor: spotMeta.backgroundColor,
    brandName: spotMeta.brandName,
    logoUrl: spotMeta.logoUrl,
  };
}
