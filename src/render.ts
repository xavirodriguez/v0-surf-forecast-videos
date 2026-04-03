import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  selectComposition,
  renderStill,
} from "@remotion/renderer";
import { FORMAT_CONFIGS, STILL_CONFIG } from "./lib/format-configs";
import {
  defaultSurfData,
  SurfForecastProps,
} from "./schemas/surf-forecast";
import { fetchSurfData } from "./lib/fetch-surf-data";
import { getSpotByName, SpotMeta } from "./lib/spots";
import { parseArgs, CliArgs } from "./lib/cli-parser";

const OUT_DIR = path.resolve(process.cwd(), "out");

async function main() {
  ensureOutputDir();
  const bundleLocation = await bundleProject();
  const inputProps = await getInputProps(parseArgs(process.argv.slice(2)));

  await renderAllVideos(bundleLocation, inputProps);
  await renderThumbnail(bundleLocation, inputProps);

  console.log("\nAll renders complete!");
}

function ensureOutputDir() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
}

async function bundleProject() {
  console.log("Bundling Remotion project...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve(process.cwd(), "src/index.ts"),
    webpackOverride: (config) => config,
  });
  console.log("Bundle complete:", bundleLocation);
  return bundleLocation;
}

async function getInputProps(cliArgs: CliArgs): Promise<SurfForecastProps> {
  if (!cliArgs.live) {
    console.log("\nUsing default demo data (use --live flag for real data)");
    return defaultSurfData;
  }

  console.log("\n🌊 Fetching live surf data...");
  const spotMeta = getSpotMeta(cliArgs);
  const { lat, lon } = getCoordinates(cliArgs, spotMeta);

  return fetchSurfData(lat, lon, spotMeta);
}

function getSpotMeta(cliArgs: CliArgs): SpotMeta {
  if (cliArgs.spot) {
    const spot = getSpotByName(cliArgs.spot);
    if (spot) return spot;
  }

  if (!cliArgs.lat || !cliArgs.lon) {
    console.error(
      "Error: --live requires either --spot <name> or both --lat and --lon"
    );
    process.exit(1);
  }

  return {
    spotName: cliArgs.spotName ?? "Custom Spot",
    spotLocation: cliArgs.location ?? `${cliArgs.lat}, ${cliArgs.lon}`,
    primaryColor: cliArgs.primaryColor ?? "#0066cc",
    secondaryColor: cliArgs.secondaryColor ?? "#00bfff",
    backgroundColor: cliArgs.backgroundColor ?? "#001a4d",
    brandName: cliArgs.brandName ?? "Surf Forecast",
    currentWaveHeightUnit: cliArgs.waveUnit ?? "m",
    waterTempUnit: cliArgs.tempUnit ?? "C",
    noaaStationId: cliArgs.noaaStationId,
  };
}

function getCoordinates(
  cliArgs: CliArgs,
  spotMeta: SpotMeta
): { lat: number; lon: number } {
  const spot = spotMeta as { lat?: number; lon?: number };
  const lat = spot.lat ?? cliArgs.lat!;
  const lon = spot.lon ?? cliArgs.lon!;
  return { lat, lon };
}

async function renderAllVideos(
  bundleLocation: string,
  inputProps: SurfForecastProps
) {
  for (const format of FORMAT_CONFIGS) {
    console.log(
      `\nRendering [${format.id}] (${format.width}x${format.height})...`
    );

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: format.id,
      inputProps,
    });

    const outputLocation = path.join(OUT_DIR, format.outputFilename);

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation,
      inputProps,
    });

    console.log(`  Saved → ${outputLocation}`);
  }
}

async function renderThumbnail(
  bundleLocation: string,
  inputProps: SurfForecastProps
) {
  console.log(`\nRendering still [${STILL_CONFIG.id}]...`);

  const stillComposition = await selectComposition({
    serveUrl: bundleLocation,
    id: STILL_CONFIG.id,
    inputProps,
  });

  const stillOutputLocation = path.join(OUT_DIR, STILL_CONFIG.outputFilename);

  await renderStill({
    composition: stillComposition,
    serveUrl: bundleLocation,
    output: stillOutputLocation,
    inputProps,
    imageFormat: "jpeg",
    jpegQuality: 92,
  });

  console.log(`  Saved → ${stillOutputLocation}`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
