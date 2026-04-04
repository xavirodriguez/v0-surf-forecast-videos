export type SpotMeta = {
  spotName: string;
  spotLocation: string;
  noaaStationId?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  brandName: string;
  logoUrl?: string;
  currentWaveHeightUnit: 'ft' | 'm';
  waterTempUnit: 'C' | 'F';
};

export type SpotExample = SpotMeta & {
  lat: number;
  lon: number;
};

export const spotExamples: SpotExample[] = [
  {
    spotName: 'Playa de Zurriola',
    spotLocation: 'San Sebastián, España',
    lat: 43.32,
    lon: -1.98,
    primaryColor: '#0066cc',
    secondaryColor: '#00bfff',
    backgroundColor: '#001a4d',
    brandName: 'Zurriola Forecast',
    currentWaveHeightUnit: 'm',
    waterTempUnit: 'C',
  },
  {
    spotName: 'Supertubes',
    spotLocation: 'Peniche, Portugal',
    lat: 39.35,
    lon: -9.38,
    primaryColor: '#ff6b35',
    secondaryColor: '#f7931e',
    backgroundColor: '#1a0f05',
    brandName: 'Supertubes Forecast',
    currentWaveHeightUnit: 'm',
    waterTempUnit: 'C',
  },
  {
    spotName: 'Pipeline',
    spotLocation: 'Oahu, Hawaii',
    lat: 21.66,
    lon: -158.05,
    noaaStationId: '1612340',
    primaryColor: '#e74c3c',
    secondaryColor: '#3498db',
    backgroundColor: '#0a0a0a',
    brandName: 'Pipeline Forecast',
    currentWaveHeightUnit: 'ft',
    waterTempUnit: 'F',
  },
];

export function getSpotByName(name: string): SpotExample {
  const spot = spotExamples.find(
    (s) =>
      s.spotName.toLowerCase() === name.toLowerCase() ||
      s.spotLocation.toLowerCase() === name.toLowerCase()
  );

  if (!spot) {
    throw new Error(`Spot not found: ${name}`);
  }

  return spot;
}
