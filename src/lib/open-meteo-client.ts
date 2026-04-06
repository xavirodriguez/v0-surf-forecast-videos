import { z } from 'zod';

const MarineDataSchema = z.object({
  hourly: z.object({
    time: z.array(z.string()),
    wave_height: z.array(z.number()),
    wave_period: z.array(z.number()),
    wave_direction: z.array(z.number()),
    swell_wave_height: z.array(z.number()),
    swell_wave_period: z.array(z.number()),
    swell_wave_direction: z.array(z.number()),
    wind_wave_height: z.array(z.number()),
  }),
});

export type MarineData = z.infer<typeof MarineDataSchema>;

const WeatherDataSchema = z.object({
  hourly: z.object({
    time: z.array(z.string()),
    windspeed_10m: z.array(z.number()),
    winddirection_10m: z.array(z.number()),
    temperature_2m: z.array(z.number()),
  }),
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;

export class OpenMeteoClient {
  private readonly MARINE_BASE_URL = 'https://marine-api.open-meteo.com/v1/marine';
  private readonly WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  async fetchMarineData(lat: number, lon: number): Promise<MarineData> {
    const url = this.buildMarineUrl(lat, lon);
    const data = await this.fetchJson(url, 'marine data');
    return MarineDataSchema.parse(data);
  }

  async fetchWindData(lat: number, lon: number): Promise<WeatherData> {
    const url = this.buildWeatherUrl(lat, lon);
    const data = await this.fetchJson(url, 'wind data');
    return WeatherDataSchema.parse(data);
  }

  private async fetchJson(url: string, dataType: string): Promise<unknown> {
    console.log(`[v0] Fetching ${dataType} from: ${url}`);
    const response = await fetch(url);
    this.ensureResponseOk(response, dataType);
    return response.json();
  }

  private buildMarineUrl(lat: number, lon: number): string {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,swell_wave_direction,wind_wave_height',
      forecast_days: '3',
      timezone: 'auto',
    });
    return `${this.MARINE_BASE_URL}?${params}`;
  }

  private buildWeatherUrl(lat: number, lon: number): string {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'windspeed_10m,winddirection_10m,temperature_2m',
      forecast_days: '3',
      timezone: 'auto',
      wind_speed_unit: 'mph',
    });
    return `${this.WEATHER_BASE_URL}?${params}`;
  }

  private ensureResponseOk(response: Response, dataType: string): void {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${dataType}: ${response.status} ${response.statusText}`);
    }
  }
}
