import { SurfForecastProps, surfForecastSchema } from '../schemas/surf-forecast';
import { fetchMarineData, fetchWindData } from './open-meteo-client';
import { fetchTides, fetchWaterTemp } from './noaa-tides-client';
import { SpotMeta } from './spots';
import { transformToSurfProps } from './transform-to-schema';

/**
 * Main function to fetch live surf data and transform it to SurfForecastProps
 */
export async function fetchSurfData(
  lat: number,
  lon: number,
  spotMeta: SpotMeta
): Promise<SurfForecastProps> {
  console.log(`[v0] Fetching surf data for ${spotMeta.spotName}...`);

  const targetDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    // Fetch marine and wind data in parallel
    const [marineData, windData] = await Promise.all([
      fetchMarineData(lat, lon),
      fetchWindData(lat, lon),
    ]);

    console.log(`[v0] Marine and wind data fetched successfully`);

    // Fetch tides and water temp if NOAA station is available
    let tidesData = [];
    let waterTemp: number | null = null;

    if (spotMeta.noaaStationId) {
      try {
        const [tides, temp] = await Promise.all([
          fetchTides(spotMeta.noaaStationId, new Date()),
          fetchWaterTemp(spotMeta.noaaStationId, new Date()),
        ]);
        tidesData = tides;
        waterTemp = temp;
        console.log(`[v0] NOAA tides and water temp fetched`);
      } catch (error) {
        console.warn(`[v0] Failed to fetch NOAA data: ${error}`);
      }
    } else {
      console.log(
        `[v0] No NOAA station ID provided, skipping tides and water temp`
      );
    }

    // Transform to schema
    const props = transformToSurfProps(
      marineData,
      windData,
      tidesData,
      waterTemp,
      spotMeta,
      targetDate
    );

    // Validate against schema
    console.log(`[v0] Validating surf data against schema...`);
    const validated = surfForecastSchema.parse(props);
    console.log(`[v0] ✓ Surf data validated successfully`);

    return validated;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[v0] Error fetching surf data: ${error.message}`);
      if ('issues' in error) {
        console.error('[v0] Validation errors:', error.issues);
      }
    }
    throw error;
  }
}
