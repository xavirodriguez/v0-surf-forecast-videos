import { SurfForecastProps } from "../schemas/surf-forecast";
import { MarineData, WeatherData } from "./open-meteo-client";
import { TideEvent } from "./noaa-tides-client";
import { SpotMeta } from "./spots";
import { degreesToCardinal } from "./degrees-to-cardinal";
import { ratingFromWaveData, SurfRating } from "./rating-calculator";
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

interface CurrentConditions {
  rawHeight: number;
  currentWaveHeight: number;
  currentWaveHeightUnit: "ft" | "m";
  currentPeriod: number;
  currentDirection: string;
  currentDirectionDegrees: number;
  waterTemp: number;
  waterTempUnit: "C" | "F";
  windSpeed: number;
  windDirection: string;
  windDirectionDegrees: number;
}

const converter = new UnitConverter();

export function transformToSurfProps(params: TransformParams): SurfForecastProps {
  const context = createTransformContext(params);
  const currentConditions = calculateCurrentConditions(context, params.waterTemp);
  const overallRating = calculateOverallRating(currentConditions);

  return {
    ...extractSpotMetadata(params.spotMeta),
    date: params.targetDate,
    ...currentConditions,
    overallRating,
    hourlyForecast: buildHourlyForecast(context),
    swellData: buildSwellData(context),
    tides: transformTides(params.tidesData, params.spotMeta.currentWaveHeightUnit),
  };
}

function extractSpotMetadata(spotMeta: SpotMeta) {
  return {
    spotName: spotMeta.spotName,
    spotLocation: spotMeta.spotLocation,
    primaryColor: spotMeta.primaryColor,
    secondaryColor: spotMeta.secondaryColor,
    backgroundColor: spotMeta.backgroundColor,
    brandName: spotMeta.brandName,
    logoUrl: spotMeta.logoUrl,
  };
}

function createTransformContext(params: TransformParams): TransformContext {
  return {
    marineData: params.marineData,
    windData: params.windData,
    spotMeta: params.spotMeta,
    startHourIndex: getStartHourIndex(params.targetDate),
  };
}

function getStartHourIndex(targetDate: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDate);

  if (target.getTime() === today.getTime()) return now.getHours();
  return target.getTime() > today.getTime() ? 6 : 0;
}

function calculateOverallRating(conditions: CurrentConditions): SurfRating {
  return ratingFromWaveData(
    conditions.rawHeight,
    conditions.currentPeriod,
    conditions.windSpeed
  );
}

function buildHourlyForecast(context: TransformContext) {
  const { marineData, startHourIndex } = context;
  const hoursToForecast = 8;

  return Array.from({ length: hoursToForecast })
    .map((_, i) => buildHourlyEntry(context, startHourIndex + i))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);
}

function buildHourlyEntry(context: TransformContext, index: number) {
  const { marineData } = context;
  if (index >= marineData.hourly.wave_height.length) {
    return undefined;
  }
  return assembleHourlyForecastItem(context, index);
}

function assembleHourlyForecastItem(context: TransformContext, index: number) {
  const { marineData, windData, spotMeta } = context;
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
}

function formatTime(timeString: string): string {
  return new Date(timeString).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function calculateCurrentConditions(context: TransformContext, waterTemp: number | undefined): CurrentConditions {
  const { marineData, windData, spotMeta, startHourIndex } = context;
  const h = marineData.hourly;

  const rawHeight = average(h.wave_height[startHourIndex], h.wave_height[startHourIndex + 1]);
  const currentPeriod = average(h.wave_period[startHourIndex], h.wave_period[startHourIndex + 1]);
  const tempCelsius = waterTemp ?? windData.hourly.temperature_2m[startHourIndex];

  return {
    rawHeight,
    currentWaveHeight: converter.convertHeight(rawHeight, spotMeta.currentWaveHeightUnit),
    currentWaveHeightUnit: spotMeta.currentWaveHeightUnit,
    currentPeriod: roundToOneDecimal(currentPeriod),
    ...calculateCurrentWaveDetails(h, startHourIndex),
    ...calculateCurrentWaterTemp(tempCelsius, spotMeta.waterTempUnit),
    ...calculateCurrentWindDetails(windData, startHourIndex),
  };
}

function calculateCurrentWaveDetails(hourly: MarineData['hourly'], index: number) {
  return {
    currentDirection: degreesToCardinal(hourly.wave_direction[index]),
    currentDirectionDegrees: hourly.wave_direction[index],
  };
}

function calculateCurrentWaterTemp(tempCelsius: number, unit: 'C' | 'F') {
  return {
    waterTemp: roundToOneDecimal(converter.convertTemp(tempCelsius, unit)),
    waterTempUnit: unit,
  };
}

function calculateCurrentWindDetails(windData: WeatherData, index: number) {
  return {
    windSpeed: roundToOneDecimal(windData.hourly.windspeed_10m[index]),
    windDirection: degreesToCardinal(windData.hourly.winddirection_10m[index]),
    windDirectionDegrees: windData.hourly.winddirection_10m[index],
  };
}

function average(val1: number, val2: number | undefined): number {
  return (val1 + (val2 ?? val1)) / 2;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
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
