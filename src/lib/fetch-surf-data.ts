import { SurfForecastProps, surfForecastSchema } from '../schemas/surf-forecast';
import { OpenMeteoClient, MarineData, WeatherData } from './open-meteo-client';
import { NoaaTidesClient, TideEvent } from './noaa-tides-client';
import { SpotMeta } from './spots';
import { transformToSurfProps } from './transform-to-schema';

export interface FetchParams {
  lat: number;
  lon: number;
  spotMeta: SpotMeta;
}

interface FetchClients {
  openMeteo: OpenMeteoClient;
  noaa: NoaaTidesClient;
}

export async function fetchSurfData(
  params: FetchParams,
  clients: FetchClients = { openMeteo: new OpenMeteoClient(), noaa: new NoaaTidesClient() }
): Promise<SurfForecastProps> {
  const { lat, lon, spotMeta } = params;
  const atmosphericData = await fetchAtmosphericData(lat, lon, clients.openMeteo);
  const { tides, waterTemp } = await fetchNoaaData(spotMeta.noaaStationId, clients.noaa);

  const props = transformToSurfProps({
    ...atmosphericData,
    tidesData: tides,
    waterTemp,
    spotMeta,
    targetDate: getFormattedDate(),
  });

  return surfForecastSchema.parse(props);
}

async function fetchAtmosphericData(
  lat: number,
  lon: number,
  client: OpenMeteoClient
): Promise<{
  marineData: MarineData;
  windData: WeatherData;
}> {
  const [marineData, windData] = await Promise.all([
    client.fetchMarineData(lat, lon),
    client.fetchWindData(lat, lon),
  ]);
  return { marineData, windData };
}

async function fetchNoaaData(
  stationId: string | undefined,
  client: NoaaTidesClient
): Promise<{
  tides: TideEvent[];
  waterTemp: number | undefined;
}> {
  if (!stationId) return { tides: [], waterTemp: undefined };

  try {
    const [tides, waterTemp] = await Promise.all([
      client.fetchTides(stationId, new Date()),
      client.fetchWaterTemp(stationId, new Date()),
    ]);
    return { tides, waterTemp };
  } catch (error) {
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
