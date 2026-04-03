import { fetchMarineData, fetchWindData } from '../src/lib/open-meteo-client';
import { fetchTides, fetchWaterTemp } from '../src/lib/noaa-tides-client';
import { getSpotByName } from '../src/lib/spots';
import { fetchSurfData } from '../src/lib/fetch-surf-data';

async function testAPIs() {
  console.log('Testing API clients...\n');

  // Test with Zurriola spot (no NOAA station)
  const zurriola = getSpotByName('Playa de Zurriola');
  if (!zurriola) {
    console.error('Failed to find Zurriola spot');
    process.exit(1);
  }

  console.log(`Testing with ${zurriola.spotName} (${zurriola.spotLocation})`);
  console.log(`Coordinates: ${zurriola.lat}, ${zurriola.lon}\n`);

  try {
    console.log('Fetching Open-Meteo Marine Data...');
    const marineData = await fetchMarineData(zurriola.lat, zurriola.lon);
    console.log(
      `✓ Marine data fetched: ${marineData.hourly.wave_height.length} hours of data`
    );
    console.log(
      `  Wave heights: ${marineData.hourly.wave_height.slice(0, 3).join(', ')} m`
    );

    console.log('\nFetching Open-Meteo Wind Data...');
    const windData = await fetchWindData(zurriola.lat, zurriola.lon);
    console.log(
      `✓ Wind data fetched: ${windData.hourly.windspeed_10m.length} hours of data`
    );
    console.log(
      `  Wind speeds: ${windData.hourly.windspeed_10m.slice(0, 3).join(', ')} mph`
    );

    console.log('\nTransforming to SurfForecastProps...');
    const surfData = await fetchSurfData(zurriola.lat, zurriola.lon, {
      spotName: zurriola.spotName,
      spotLocation: zurriola.spotLocation,
      primaryColor: zurriola.primaryColor,
      secondaryColor: zurriola.secondaryColor,
      backgroundColor: zurriola.backgroundColor,
      brandName: zurriola.brandName,
      currentWaveHeightUnit: zurriola.currentWaveHeightUnit,
      waterTempUnit: zurriola.waterTempUnit,
    });

    console.log('\n✓ Full surf data fetched and validated!');
    console.log(`  Current wave height: ${surfData.currentWaveHeight} ${surfData.currentWaveHeightUnit}`);
    console.log(`  Current period: ${surfData.currentPeriod}s`);
    console.log(`  Wind speed: ${surfData.windSpeed} mph`);
    console.log(`  Water temp: ${surfData.waterTemp}°${surfData.waterTempUnit}`);
    console.log(`  Overall rating: ${surfData.overallRating}`);
    console.log(`  Hourly forecast entries: ${surfData.hourlyForecast.length}`);
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }

  // Test Pipeline with NOAA
  console.log('\n\n--- Testing Pipeline with NOAA ---\n');
  const pipeline = getSpotByName('Pipeline');
  if (!pipeline) {
    console.error('Failed to find Pipeline spot');
    process.exit(1);
  }

  console.log(`Testing with ${pipeline.spotName} (${pipeline.spotLocation})`);
  console.log(`NOAA Station ID: ${pipeline.noaaStationId}\n`);

  try {
    if (pipeline.noaaStationId) {
      console.log('Fetching NOAA Tides...');
      const tides = await fetchTides(pipeline.noaaStationId, new Date());
      console.log(`✓ Tides fetched: ${tides.length} events`);
      if (tides.length > 0) {
        console.log(`  First tide: ${tides[0].time} (${tides[0].type}) - ${tides[0].height}m`);
      }

      console.log('\nFetching NOAA Water Temperature...');
      const waterTemp = await fetchWaterTemp(pipeline.noaaStationId, new Date());
      if (waterTemp !== null) {
        console.log(`✓ Water temp: ${waterTemp}°C`);
      } else {
        console.log('✓ No water temp data available');
      }
    }

    console.log('\nFetching complete Pipeline data...');
    const pipelineData = await fetchSurfData(
      pipeline.lat,
      pipeline.lon,
      {
        spotName: pipeline.spotName,
        spotLocation: pipeline.spotLocation,
        noaaStationId: pipeline.noaaStationId,
        primaryColor: pipeline.primaryColor,
        secondaryColor: pipeline.secondaryColor,
        backgroundColor: pipeline.backgroundColor,
        brandName: pipeline.brandName,
        currentWaveHeightUnit: pipeline.currentWaveHeightUnit,
        waterTempUnit: pipeline.waterTempUnit,
      }
    );

    console.log('\n✓ Pipeline data fetched!');
    console.log(`  Current wave height: ${pipelineData.currentWaveHeight} ${pipelineData.currentWaveHeightUnit}`);
    console.log(`  Water temp: ${pipelineData.waterTemp}°${pipelineData.waterTempUnit}`);
    console.log(`  Tides data points: ${pipelineData.tides.length}`);
  } catch (error) {
    console.error('\n✗ Pipeline test failed:', error);
    process.exit(1);
  }

  console.log('\n\n✓ All API tests passed!');
}

testAPIs();
