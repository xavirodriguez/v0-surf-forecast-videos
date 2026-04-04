import { SurfForecastProps } from "../schemas/surf-forecast";
import { MarineData, WeatherData } from "./open-meteo-client";
import { TideEvent } from "./noaa-tides-client";
import { SpotMeta } from "./spots";
import { degreesToCardinal } from "./degrees-to-cardinal";
import { ratingFromWaveData } from "./rating-calculator";
import { UnitConverter } from "./unit-converter";

interface TransformContext {
  marineData: MarineData;
  windData: WeatherData;
  spotMeta: SpotMeta;
  startHourIndex: number;
}

export interface TransformParams {
  marineData: MarineData;
  windData: WeatherData;
  tidesData: TideEvent[];
  waterTemp: number | undefined;
  spotMeta: SpotMeta;
  targetDate: string;
}

const converter = new UnitConverter();

export function transformToSurfProps(params: TransformParams): SurfForecastProps {
  const { marineData, windData, tidesData, waterTemp, spotMeta, targetDate } = params;
  const context: TransformContext = {
    marineData,
    windData,
    spotMeta,
    startHourIndex: getStartHourIndex(targetDate),
  };

  const currentConditions = calculateCurrentConditions(context, waterTemp);
  const overallRating = ratingFromWaveData(
    currentConditions.rawHeight,
    currentConditions.currentPeriod,
    currentConditions.windSpeed
  );

  return {
    spotName: spotMeta.spotName,
    spotLocation: spotMeta.spotLocation,
    date: targetDate,
    ...currentConditions,
    overallRating,
    hourlyForecast: buildHourlyForecast(context),
    swellData: buildSwellData(context),
    tides: transformTides(tidesData, spotMeta.currentWaveHeightUnit),
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

  if (target.getTime() === today.getTime()) return now.getHours();
  return target.getTime() > today.getTime() ? 6 : 0;
}

function buildHourlyForecast(context: TransformContext) {
  const { marineData, windData, spotMeta, startHourIndex } = context;

  return Array.from({ length: 8 })
    .map((_, i) => {
      const index = startHourIndex + i;
      if (index >= marineData.hourly.wave_height.length) return undefined;

      const waveHeight = marineData.hourly.wave_height[index];
      const period = marineData.hourly.wave_period[index];
      const windSpeed = windData.hourly.windspeed_10m[index];

      return {
        hour: formatTime(marineData.hourly.time[index]),
        waveHeight: converter.convertHeight(waveHeight, spotMeta.currentWaveHeightUnit),
        period,
        windSpeed,
        windDirection: degreesToCardinal(windData.hourly.winddirection_10m[index]),
        rating: ratingFromWaveData(waveHeight, period, windSpeed),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== undefined);
}

function formatTime(timeString: string): string {
  return new Date(timeString).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function calculateCurrentConditions(context: TransformContext, waterTemp: number | undefined) {
  const { marineData, windData, spotMeta, startHourIndex } = context;
  const h = marineData.hourly;

  const rawHeight = (h.wave_height[startHourIndex] + (h.wave_height[startHourIndex + 1] ?? h.wave_height[startHourIndex])) / 2;
  const currentPeriod = (h.wave_period[startHourIndex] + (h.wave_period[startHourIndex + 1] ?? h.wave_period[startHourIndex])) / 2;

  const tempCelsius = waterTemp ?? windData.hourly.temperature_2m[startHourIndex];

  return {
    rawHeight,
    currentWaveHeight: converter.convertHeight(rawHeight, spotMeta.currentWaveHeightUnit),
    currentWaveHeightUnit: spotMeta.currentWaveHeightUnit,
    currentPeriod: Math.round(currentPeriod * 10) / 10,
    currentDirection: degreesToCardinal(h.wave_direction[startHourIndex]),
    currentDirectionDegrees: h.wave_direction[startHourIndex],
    waterTemp: Math.round(converter.convertTemp(tempCelsius, spotMeta.waterTempUnit) * 10) / 10,
    waterTempUnit: spotMeta.waterTempUnit,
    windSpeed: Math.round(windData.hourly.windspeed_10m[startHourIndex] * 10) / 10,
    windDirection: degreesToCardinal(windData.hourly.winddirection_10m[startHourIndex]),
    windDirectionDegrees: windData.hourly.winddirection_10m[startHourIndex],
  };
}

function buildSwellData(context: TransformContext) {
  const { marineData, startHourIndex } = context;
  const h = marineData.hourly;

  if (h.swell_wave_height[startHourIndex] <= 0) return [];

  return [{
    height: h.swell_wave_height[startHourIndex],
    period: h.swell_wave_period[startHourIndex],
    direction: degreesToCardinal(h.swell_wave_direction[startHourIndex]),
    directionDegrees: h.swell_wave_direction[startHourIndex],
  }];
}

function transformTides(tidesData: TideEvent[], unit: "ft" | "m") {
  return tidesData.slice(0, 4).map((tide) => ({
    ...tide,
    height: converter.convertHeight(tide.height, unit),
  }));
}
