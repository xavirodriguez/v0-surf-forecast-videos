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

interface NoaaData {
  tides: TideEvent[];
  waterTemp: number;
}

export async function fetchSurfData(
  params: FetchParams,
  clients: FetchClients = createDefaultClients()
): Promise<SurfForecastProps> {
  const { lat, lon, spotMeta } = params;

  const [atmosphericData, noaaData] = await Promise.all([
    fetchAtmosphericData(lat, lon, clients.openMeteo),
    fetchNoaaData(spotMeta.noaaStationId, clients.noaa),
  ]);

  const props = transformToSurfProps({
    ...atmosphericData,
    tidesData: noaaData.tides,
    waterTemp: noaaData.waterTemp,
    spotMeta,
    targetDate: getFormattedDate(),
  });

  return surfForecastSchema.parse(props);
}

function createDefaultClients(): FetchClients {
  return {
    openMeteo: new OpenMeteoClient(),
    noaa: new NoaaTidesClient(),
  };
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
): Promise<NoaaData> {
  if (!stationId) {
    return { tides: [], waterTemp: 0 };
  }

  try {
    return await fetchStationData(stationId, client);
  } catch (error) {
    return { tides: [], waterTemp: 0 };
  }
}

async function fetchStationData(
  stationId: string,
  client: NoaaTidesClient
): Promise<NoaaData> {
  const [tides, waterTemp] = await Promise.all([
    client.fetchTides(stationId, new Date()),
    client.fetchWaterTemp(stationId, new Date()),
  ]);
  return { tides, waterTemp };
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
