import { SurfForecastProps } from "../schemas/surf-forecast";
import { MarineData, WeatherData } from "./open-meteo-client";
import { TideEvent } from "./noaa-tides-client";
import { SpotMeta } from "./spots";
import { degreesToCardinal } from "./degrees-to-cardinal";
import { ratingFromWaveData } from "./rating-calculator";

interface TransformContext {
  marineData: MarineData;
  windData: WeatherData;
  spotMeta: SpotMeta;
  startHourIndex: number;
}

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
  const startHourIndex = getStartHourIndex(targetDate);
  const context: TransformContext = { marineData, windData, spotMeta, startHourIndex };

  const hourlyForecast = buildHourlyForecast(context);
  const currentConditions = calculateCurrentConditions(context, waterTemp);
  const swellData = buildSwellData(context);
  const tides = transformTides(tidesData, spotMeta.currentWaveHeightUnit);

  return {
    spotName: spotMeta.spotName,
    spotLocation: spotMeta.spotLocation,
    date: targetDate,
    ...currentConditions,
    overallRating: ratingFromWaveData(
      currentConditions.rawHeight,
      currentConditions.currentPeriod,
      currentConditions.windSpeed
    ),
    hourlyForecast,
    swellData,
    tides,
    primaryColor: spotMeta.primaryColor,
    secondaryColor: spotMeta.secondaryColor,
    backgroundColor: spotMeta.backgroundColor,
    brandName: spotMeta.brandName,
    logoUrl: spotMeta.logoUrl,
  };
}

function getStartHourIndex(targetDate: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDate);

  if (target.getTime() === today.getTime()) {
    return now.getHours();
  }
  if (target.getTime() > today.getTime()) {
    return 6; // Default to 6 AM for future dates
  }
  return 0;
}

function buildHourlyForecast(context: TransformContext) {
  const { marineData, windData, spotMeta, startHourIndex } = context;
  const isFeet = spotMeta.currentWaveHeightUnit === "ft";

  return Array.from({ length: 8 })
    .map((_, i) => {
      const idx = startHourIndex + i;
      if (idx >= marineData.hourly.wave_height.length) return null;

      const waveHeight = marineData.hourly.wave_height[idx];
      const period = marineData.hourly.wave_period[idx];
      const windSpeed = windData.hourly.windspeed_10m[idx];

      return {
        hour: new Date(marineData.hourly.time[idx]).toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        waveHeight: isFeet ? waveHeight * 3.28084 : waveHeight,
        period,
        windSpeed,
        windDirection: degreesToCardinal(windData.hourly.winddirection_10m[idx]),
        rating: ratingFromWaveData(waveHeight, period, windSpeed),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function calculateCurrentConditions(context: TransformContext, waterTemp: number | null) {
  const { marineData, windData, spotMeta, startHourIndex } = context;
  const h = marineData.hourly;

  const rawHeight = (h.wave_height[startHourIndex] + (h.wave_height[startHourIndex + 1] ?? h.wave_height[startHourIndex])) / 2;
  const currentPeriod = (h.wave_period[startHourIndex] + (h.wave_period[startHourIndex + 1] ?? h.wave_period[startHourIndex])) / 2;

  const tempCelsius = waterTemp ?? windData.hourly.temperature_2m[startHourIndex];
  const displayTemp = spotMeta.waterTempUnit === "F" ? (tempCelsius * 9) / 5 + 32 : tempCelsius;

  return {
    rawHeight,
    currentWaveHeight: spotMeta.currentWaveHeightUnit === "ft" ? rawHeight * 3.28084 : rawHeight,
    currentWaveHeightUnit: spotMeta.currentWaveHeightUnit,
    currentPeriod: Math.round(currentPeriod * 10) / 10,
    currentDirection: degreesToCardinal(h.wave_direction[startHourIndex]),
    currentDirectionDegrees: h.wave_direction[startHourIndex],
    waterTemp: Math.round(displayTemp * 10) / 10,
    waterTempUnit: spotMeta.waterTempUnit,
    windSpeed: Math.round(windData.hourly.windspeed_10m[startHourIndex] * 10) / 10,
    windDirection: degreesToCardinal(windData.hourly.winddirection_10m[startHourIndex]),
    windDirectionDegrees: windData.hourly.winddirection_10m[startHourIndex],
  };
}

function buildSwellData(context: TransformContext) {
  const { marineData, startHourIndex } = context;
  const h = marineData.hourly;
  const swellData = [];

  if (h.swell_wave_height[startHourIndex] > 0) {
    swellData.push({
      height: h.swell_wave_height[startHourIndex],
      period: h.swell_wave_period[startHourIndex],
      direction: degreesToCardinal(h.swell_wave_direction[startHourIndex]),
      directionDegrees: h.swell_wave_direction[startHourIndex],
    });
  }
  return swellData;
}

function transformTides(tidesData: TideEvent[], unit: "ft" | "m") {
  return tidesData.slice(0, 4).map((tide) => ({
    ...tide,
    height: unit === "ft" ? tide.height * 3.28084 : tide.height,
  }));
}
