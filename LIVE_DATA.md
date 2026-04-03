# Live Surf Data Layer

This document describes the real-time data fetching layer for the surf forecast video generator.

## Overview

The application can fetch live oceanographic and meteorological data from free public APIs:

- **Open-Meteo Marine API**: Wave heights, periods, directions, and swell components
- **Open-Meteo Weather API**: Wind speed, wind direction, and air temperature  
- **NOAA Tides & Currents API**: Tide predictions and water temperature (US coasts only)

## Architecture

### API Clients

#### `src/lib/open-meteo-client.ts`

Fetches marine and weather data from Open-Meteo (free, no API key required):

```typescript
// Marine data: waves, periods, directions, swell
const marineData = await fetchMarineData(latitude, longitude);

// Wind and temperature
const weatherData = await fetchWindData(latitude, longitude);
```

- Returns 3 days of hourly forecast data
- No authentication required
- Global coverage

#### `src/lib/noaa-tides-client.ts`

Fetches tides and water temperature from NOAA (free, no API key required):

```typescript
// Tide predictions (high/low events)
const tides = await fetchTides(stationId, date);

// Water temperature
const waterTemp = await fetchWaterTemp(stationId, date);
```

- Requires NOAA station ID (US coasts only)
- Returns null gracefully if station unavailable
- Fallback to air temperature if water temp unavailable

### Utilities

#### `src/lib/degrees-to-cardinal.ts`

Converts compass degrees to 16-point cardinal directions (N, NNE, NE, etc.):

```typescript
degreesToCardinal(340) // → 'NNW'
```

#### `src/lib/rating-calculator.ts`

Calculates surf quality ratings based on wave height, period, and wind:

```typescript
ratingFromWaveData(
  height: 6.5,    // meters
  period: 14,     // seconds
  windSpeed: 8    // mph
) // → 'good'
```

Ratings:
- **epic**: height ≥ 6m, period ≥ 14s, wind < 10mph
- **good**: height ≥ 4m, period ≥ 12s, wind < 15mph
- **fair-good**: height ≥ 3m, period ≥ 10s
- **fair**: height ≥ 2m, period ≥ 8s
- **poor-fair**: height ≥ 1m
- **poor**: height > 0
- **flat**: no waves

#### `src/lib/transform-to-schema.ts`

Transforms raw API data into the `SurfForecastProps` schema with:
- Unit conversions (meters to feet, Celsius to Fahrenheit)
- Cardinal direction calculations
- Hourly forecast extraction (8 hours)
- Swell component aggregation
- Overall rating calculation

#### `src/lib/spots.ts`

Predefined spot metadata for quick testing:

```typescript
type SpotExample = SpotMeta & { lat: number; lon: number };

// Example spots:
// - Playa de Zurriola (San Sebastián, Spain)
// - Supertubes (Peniche, Portugal)  
// - Pipeline (Oahu, Hawaii) - includes NOAA station

getSpotByName('Pipeline') // → SpotExample
```

### Main Data Fetching

#### `src/lib/fetch-surf-data.ts`

Orchestrates all API calls and transformations:

```typescript
const surfData = await fetchSurfData(
  latitude,
  longitude,
  spotMeta
);
// Returns validated SurfForecastProps
```

- Calls Open-Meteo APIs in parallel
- Calls NOAA APIs if station ID available
- Transforms to schema
- Validates against Zod schema
- Throws descriptive errors on validation failure

## Usage

### Option 1: CLI with --live flag

```bash
# Use predefined spot
npm run render -- --live --spot "Pipeline"

# Custom coordinates with custom metadata
npm run render -- --live \
  --lat=40.5 \
  --lon=-74.0 \
  --name="Custom Beach" \
  --location="New Jersey" \
  --brand="My Forecast" \
  --primary-color="#0066cc" \
  --secondary-color="#00bfff" \
  --bg-color="#001a4d" \
  --wave-unit=ft \
  --temp-unit=F
```

### Option 2: Programmatic

```typescript
import { fetchSurfData } from './src/lib/fetch-surf-data';
import { spotExamples } from './src/lib/spots';

const pipeline = spotExamples[2]; // Pipeline example
const surfData = await fetchSurfData(pipeline.lat, pipeline.lon, pipeline);
```

### Option 3: Default demo data

```bash
# No --live flag uses defaultSurfData (Pipeline, Hawaii)
npm run render
```

## Testing

Run the test suite to verify all APIs:

```bash
npm run test:apis
```

Tests:
1. Zuriola (Spain) - Open-Meteo only
2. Pipeline (Hawaii) - Full NOAA + Open-Meteo

## Adding New Spots

Edit `src/lib/spots.ts` and add to `spotExamples`:

```typescript
{
  spotName: 'Bells Beach',
  spotLocation: 'Victoria, Australia',
  lat: -38.65,
  lon: 144.40,
  primaryColor: '#ff6b35',
  secondaryColor: '#f7931e',
  backgroundColor: '#1a0f05',
  brandName: 'Bells Forecast',
  currentWaveHeightUnit: 'm',
  waterTempUnit: 'C',
  // Optional:
  // noaaStationId: '1234567', // if available for your spot
  // logoUrl: 'https://...'
}
```

## Error Handling

### API Failures

- Open-Meteo failures: Fatal (required data)
- NOAA failures: Graceful degradation (optional)
- If NOAA unavailable: Uses estimated values or sensible defaults

### Validation Failures

All transformed data is validated against `surfForecastSchema`:
- Throws `ZodError` with field-level details
- Check console output for specific validation errors

## Data Freshness

- Open-Meteo: Updates hourly
- NOAA Tides: Predictions updated daily
- NOAA Water Temp: Updates hourly

Rendered videos always contain the latest available data at render time.

## Unit Conversions

The layer automatically converts based on `SpotMeta`:

- **Wave Height**: 1m = 3.28084 ft
- **Temperature**: °C × 1.8 + 32 = °F
- **Tides**: Same conversion as wave height

## Debugging

Enable detailed logging:

```bash
# All debug output goes to console
npm run render -- --live --spot "Supertubes" 2>&1 | grep "\[v0\]"
```

Debug output includes:
- API URLs being called
- Data validation stages
- Error messages with context
