import { OpenMeteoClient } from '../src/lib/open-meteo-client';
import { NoaaTidesClient } from '../src/lib/noaa-tides-client';
import { getSpotByName } from '../src/lib/spots';
import { fetchSurfData } from '../src/lib/fetch-surf-data';

const openMeteoClient = new OpenMeteoClient();
const noaaClient = new NoaaTidesClient();

async function testAPIs() {
  console.log('Testing API clients...\n');

  try {
    const zurriola = getSpotByName('Playa de Zurriola');
    console.log(`Testing with ${zurriola.spotName} (${zurriola.spotLocation})`);
    console.log(`Coordinates: ${zurriola.lat}, ${zurriola.lon}\n`);

    console.log('Fetching Open-Meteo Marine Data...');
    const marineData = await openMeteoClient.fetchMarineData(zurriola.lat, zurriola.lon);
    console.log(`✓ Marine data fetched: ${marineData.hourly.wave_height.length} hours of data`);

    console.log('\nFetching Open-Meteo Wind Data...');
    const windData = await openMeteoClient.fetchWindData(zurriola.lat, zurriola.lon);
    console.log(`✓ Wind data fetched: ${windData.hourly.windspeed_10m.length} hours of data`);

    console.log('\nTransforming to SurfForecastProps...');
    const surfData = await fetchSurfData({
      lat: zurriola.lat,
      lon: zurriola.lon,
      spotMeta: zurriola,
    });

    console.log('\n✓ Full surf data fetched and validated!');
    console.log(`  Current wave height: ${surfData.currentWaveHeight} ${surfData.currentWaveHeightUnit}`);
    console.log(`  Overall rating: ${surfData.overallRating}`);
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }

  console.log('\n\n--- Testing Pipeline with NOAA ---\n');
  try {
    const pipeline = getSpotByName('Pipeline');
    console.log(`Testing with ${pipeline.spotName} (${pipeline.spotLocation})`);
    console.log(`NOAA Station ID: ${pipeline.noaaStationId}\n`);

    if (pipeline.noaaStationId) {
      console.log('Fetching NOAA Tides...');
      const tides = await noaaClient.fetchTides(pipeline.noaaStationId, new Date());
      console.log(`✓ Tides fetched: ${tides.length} events`);

      console.log('\nFetching NOAA Water Temperature...');
      try {
        const waterTemp = await noaaClient.fetchWaterTemp(pipeline.noaaStationId, new Date());
        console.log(`✓ Water temp: ${waterTemp !== null ? waterTemp + '°C' : 'N/A'}`);
      } catch (error) {
        console.log('✓ Water temp: N/A (Handled error)');
      }
    }

    console.log('\nFetching complete Pipeline data...');
    const pipelineData = await fetchSurfData({
      lat: pipeline.lat,
      lon: pipeline.lon,
      spotMeta: pipeline,
    });

    console.log('\n✓ Pipeline data fetched!');
    console.log(`  Current wave height: ${pipelineData.currentWaveHeight} ${pipelineData.currentWaveHeightUnit}`);
    console.log(`  Tides data points: ${pipelineData.tides.length}`);
  } catch (error) {
    console.error('\n✗ Pipeline test failed:', error);
    process.exit(1);
  }

  console.log('\n\n✓ All API tests passed!');
}

testAPIs();
