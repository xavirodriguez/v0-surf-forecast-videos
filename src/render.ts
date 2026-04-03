import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, renderStill } from "@remotion/renderer";
import { FORMAT_CONFIGS, STILL_CONFIG } from "./lib/format-configs.js";
import { defaultSurfData, SurfForecastProps } from "./schemas/surf-forecast.js";
import { fetchSurfData } from "./lib/fetch-surf-data.js";
import { getSpotByName, SpotMeta, SpotExample } from "./lib/spots.js";

const OUT_DIR = path.resolve(process.cwd(), "out");

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result: {
    live: boolean;
    lat?: number;
    lon?: number;
    spot?: string;
    location?: string;
    spotName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    brandName?: string;
    waveUnit?: "ft" | "m";
    tempUnit?: "C" | "F";
    noaaStationId?: string;
  } = { live: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--live") {
      result.live = true;
    } else if (arg === "--lat" && args[i + 1]) {
      result.lat = parseFloat(args[++i]);
    } else if (arg === "--lon" && args[i + 1]) {
      result.lon = parseFloat(args[++i]);
    } else if (arg === "--spot" && args[i + 1]) {
      result.spot = args[++i];
    } else if (arg === "--location" && args[i + 1]) {
      result.location = args[++i];
    } else if (arg === "--name" && args[i + 1]) {
      result.spotName = args[++i];
    } else if (arg === "--brand" && args[i + 1]) {
      result.brandName = args[++i];
    } else if (arg === "--primary-color" && args[i + 1]) {
      result.primaryColor = args[++i];
    } else if (arg === "--secondary-color" && args[i + 1]) {
      result.secondaryColor = args[++i];
    } else if (arg === "--bg-color" && args[i + 1]) {
      result.backgroundColor = args[++i];
    } else if (arg === "--wave-unit" && args[i + 1]) {
      result.waveUnit = (args[++i] as "ft" | "m");
    } else if (arg === "--temp-unit" && args[i + 1]) {
      result.tempUnit = (args[++i] as "C" | "F");
    } else if (arg === "--noaa-station" && args[i + 1]) {
      result.noaaStationId = args[++i];
    }
  }

  return result;
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log("Bundling Remotion project...");
  const bundleLocation = await bundle({
    entryPoint: path.resolve(process.cwd(), "src/index.ts"),
    // Ignore node_modules from bundling — only relevant for Web worker context
    webpackOverride: (config) => config,
  });
  console.log("Bundle complete:", bundleLocation);

  const cliArgs = parseArgs();
  let inputProps: SurfForecastProps;

  if (cliArgs.live) {
    console.log("\n🌊 Fetching live surf data...");

    // Try to get spot from predefined examples
    let spotMeta: SpotMeta | undefined;
    if (cliArgs.spot) {
      spotMeta = getSpotByName(cliArgs.spot);
    }

    if (!spotMeta) {
      // Build custom spot metadata
      if (!cliArgs.lat || !cliArgs.lon) {
        console.error(
          "Error: --live requires either --spot <name> or both --lat and --lon"
        );
        process.exit(1);
      }

      spotMeta = {
        spotName: cliArgs.spotName || "Custom Spot",
        spotLocation: cliArgs.location || `${cliArgs.lat}, ${cliArgs.lon}`,
        primaryColor: cliArgs.primaryColor || "#0066cc",
        secondaryColor: cliArgs.secondaryColor || "#00bfff",
        backgroundColor: cliArgs.backgroundColor || "#001a4d",
        brandName: cliArgs.brandName || "Surf Forecast",
        currentWaveHeightUnit: cliArgs.waveUnit || "m",
        waterTempUnit: cliArgs.tempUnit || "C",
        noaaStationId: cliArgs.noaaStationId,
      };
    }

    try {
      const spot = spotMeta as SpotExample;
      const lat = spot.lat || cliArgs.lat!;
      const lon = spot.lon || cliArgs.lon!;
      inputProps = await fetchSurfData(lat, lon, spotMeta);
      console.log("✓ Live data fetched and ready to render");
    } catch (error) {
      console.error("Failed to fetch live data:", error);
      process.exit(1);
    }
  } else {
    console.log("\nUsing default demo data (use --live flag for real data)");
    inputProps = defaultSurfData;
  }

  // ── Render video formats ────────────────────────────────────────────────────
  for (const format of FORMAT_CONFIGS) {
    console.log(`\nRendering [${format.id}] (${format.width}x${format.height})...`);

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

  // ── Render still thumbnail ───────────────────────────────────────────────────
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
  });

  console.log(`  Saved → ${stillOutputLocation}`);

  console.log("\nAll renders complete!");
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
