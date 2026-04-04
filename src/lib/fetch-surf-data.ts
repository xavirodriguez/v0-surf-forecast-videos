import { SurfForecastProps, surfForecastSchema } from '../schemas/surf-forecast';
import { fetchMarineData, fetchWindData, MarineData, WeatherData } from './open-meteo-client';
import { fetchTides, fetchWaterTemp, TideEvent } from './noaa-tides-client';
import { SpotMeta } from './spots';
import { transformToSurfProps } from './transform-to-schema';

export interface FetchParams {
  lat: number;
  lon: number;
  spotMeta: SpotMeta;
}

export async function fetchSurfData(params: FetchParams): Promise<SurfForecastProps> {
  const { lat, lon, spotMeta } = params;
  const { marineData, windData } = await fetchAtmosphericData(lat, lon);
  const { tides, waterTemp } = await fetchNoaaData(spotMeta.noaaStationId);

  const props = transformToSurfProps({
    marineData,
    windData,
    tidesData: tides,
    waterTemp,
    spotMeta,
    targetDate: getFormattedDate(),
  });

  return surfForecastSchema.parse(props);
}

async function fetchAtmosphericData(lat: number, lon: number): Promise<{
  marineData: MarineData;
  windData: WeatherData;
}> {
  const [marineData, windData] = await Promise.all([
    fetchMarineData(lat, lon),
    fetchWindData(lat, lon),
  ]);
  return { marineData, windData };
}

async function fetchNoaaData(stationId?: string): Promise<{
  tides: TideEvent[];
  waterTemp: number | undefined;
}> {
  if (!stationId) {
    return { tides: [], waterTemp: undefined };
  }

  try {
    const [tides, waterTemp] = await Promise.all([
      fetchTides(stationId, new Date()),
      fetchWaterTemp(stationId, new Date()),
    ]);
    return { tides, waterTemp: waterTemp ?? undefined };
  } catch (error) {
    console.warn(`[v0] Failed to fetch NOAA data: ${error}`);
    return { tides: [], waterTemp: undefined };
  }
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
