import { z } from 'zod';

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

export class NoaaTidesClient {
  private readonly BASE_URL = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

  async fetchTides(stationId: string, date: Date): Promise<TideEvent[]> {
    const url = this.buildTidesUrl(stationId, date);
    try {
      const data = await this.fetchJson(url, `tides for station ${stationId}`);
      if (this.hasError(data)) return [];
      return this.parseTidePredictions(data);
    } catch (error) {
      console.warn(`[v0] Failed to fetch tides: ${error}`);
      return [];
    }
  }

  async fetchWaterTemp(stationId: string, date: Date): Promise<number | undefined> {
    const url = this.buildWaterTempUrl(stationId, date);
    try {
      const data = await this.fetchJson(url, `water temp for station ${stationId}`);
      if (this.hasError(data)) return undefined;
      return this.parseWaterTemp(data);
    } catch (error) {
      console.warn(`[v0] Failed to fetch water temperature: ${error}`);
      return undefined;
    }
  }

  private hasError(data: unknown): boolean {
    return !data || (typeof data === 'object' && 'error' in data);
  }

  private async fetchJson(url: string, description: string): Promise<unknown> {
    console.log(`[v0] Fetching ${description} from NOAA`);
    const response = await fetch(url);
    this.ensureResponseOk(response, description);
    return response.json();
  }

  private ensureResponseOk(response: Response, description: string): void {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${description}: ${response.status} ${response.statusText}`);
    }
  }

  private buildTidesUrl(stationId: string, date: Date): string {
    const params = this.buildBaseParams(stationId, date);
    params.set('product', 'predictions');
    params.set('interval', 'hilo');
    return `${this.BASE_URL}?${params}`;
  }

  private buildWaterTempUrl(stationId: string, date: Date): string {
    const params = this.buildBaseParams(stationId, date);
    params.set('product', 'water_temperature');
    params.set('interval', 'h');
    return `${this.BASE_URL}?${params}`;
  }

  private buildBaseParams(stationId: string, date: Date): URLSearchParams {
    return new URLSearchParams({
      begin_date: this.formatDate(date),
      end_date: this.formatDate(new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000)),
      station: stationId,
      datum: 'MLLW',
      time_zone: 'lst_ldt',
      units: 'metric',
      application: 'surf_forecast',
      format: 'json',
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private parseTidePredictions(data: unknown): TideEvent[] {
    const validated = NOAATidesResponseSchema.parse(data);
    return validated.predictions.map((pred) => ({
      time: pred.t,
      height: parseFloat(pred.v),
      type: pred.type === 'H' ? 'high' : 'low',
    }));
  }

  private parseWaterTemp(data: unknown): number {
    const validated = WaterTempResponseSchema.parse(data);
    if (validated.data.length === 0) {
      throw new Error('No water temperature data available');
    }
    return parseFloat(validated.data[validated.data.length - 1].v);
  }
}
