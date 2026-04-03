import { z } from 'zod';

// Type definitions for NOAA Tides API
const TideEventSchema = z.object({
  t: z.string(),
  v: z.string(),
  type: z.enum(['H', 'L']),
});

const NOAATidesResponseSchema = z.object({
  predictions: z.array(TideEventSchema),
});

export type TideEvent = {
  time: string;
  height: number;
  type: 'high' | 'low';
};

const WaterTempResponseSchema = z.object({
  data: z.array(
    z.object({
      t: z.string(),
      v: z.string(),
    })
  ),
});

/**
 * Format date as YYYYMMDD for NOAA API
 */
function formatDateForNOAA(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Fetch tide predictions from NOAA
 */
export async function fetchTides(
  stationId: string,
  date: Date
): Promise<TideEvent[]> {
  const beginDate = formatDateForNOAA(date);
  const endDate = formatDateForNOAA(
    new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000)
  );

  const params = new URLSearchParams({
    begin_date: beginDate,
    end_date: endDate,
    station: stationId,
    product: 'predictions',
    datum: 'MLLW',
    time_zone: 'lst_ldt',
    interval: 'hilo',
    units: 'metric',
    application: 'surf_forecast',
    format: 'json',
  });

  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params}`;

  console.log(`[v0] Fetching tides from NOAA: ${stationId}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `[v0] NOAA tides fetch failed: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();

    // Check for NOAA error responses
    if (data.error) {
      console.warn(`[v0] NOAA API error: ${data.error.message}`);
      return [];
    }

    // Validate and transform
    const validated = NOAATidesResponseSchema.parse(data);

    return validated.predictions.map((pred) => ({
      time: pred.t,
      height: parseFloat(pred.v),
      type: pred.type === 'H' ? ('high' as const) : ('low' as const),
    }));
  } catch (error) {
    console.warn(`[v0] Failed to fetch tides: ${error}`);
    return [];
  }
}

/**
 * Fetch water temperature from NOAA
 */
export async function fetchWaterTemp(
  stationId: string,
  date: Date
): Promise<number | null> {
  const beginDate = formatDateForNOAA(date);
  const endDate = formatDateForNOAA(
    new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000)
  );

  const params = new URLSearchParams({
    begin_date: beginDate,
    end_date: endDate,
    station: stationId,
    product: 'water_temperature',
    datum: 'MLLW',
    time_zone: 'lst_ldt',
    interval: 'h',
    units: 'metric',
    application: 'surf_forecast',
    format: 'json',
  });

  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?${params}`;

  console.log(`[v0] Fetching water temperature from NOAA: ${stationId}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `[v0] NOAA water temp fetch failed: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Check for NOAA error responses
    if (data.error) {
      console.warn(`[v0] NOAA API error: ${data.error.message}`);
      return null;
    }

    // Validate and extract most recent value
    const validated = WaterTempResponseSchema.parse(data);

    if (validated.data.length === 0) {
      return null;
    }

    // Get the most recent value
    const mostRecent = validated.data[validated.data.length - 1];
    return parseFloat(mostRecent.v);
  } catch (error) {
    console.warn(`[v0] Failed to fetch water temperature: ${error}`);
    return null;
  }
}
