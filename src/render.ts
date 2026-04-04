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
import { parseArgs, CliArgs } from "./lib/cli-parser";
import { SpotMetaFactory } from "./lib/spot-meta-factory";

const OUT_DIR = path.resolve(process.cwd(), "out");
const spotMetaFactory = new SpotMetaFactory();

async function main() {
  ensureOutputDir();
  const bundleLocation = await bundleProject();
  const inputProps = await getInputProps(parseArgs(process.argv.slice(2)));

  await renderAll(bundleLocation, inputProps);

  console.log("\nAll renders complete!");
}

function ensureOutputDir() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
}

async function bundleProject() {
  console.log("Bundling Remotion project...");
  return bundle({
    entryPoint: path.resolve(process.cwd(), "src/index.ts"),
    webpackOverride: (config) => config,
  });
}

async function getInputProps(cliArgs: CliArgs): Promise<SurfForecastProps> {
  if (!cliArgs.live) {
    console.log("\nUsing default demo data (use --live flag for real data)");
    return defaultSurfData;
  }

  console.log("\n🌊 Fetching live surf data...");
  const spotMeta = spotMetaFactory.fromCliArgs(cliArgs);
  const { lat, lon } = spotMetaFactory.getCoordinates(cliArgs, spotMeta);

  return fetchSurfData({ lat, lon, spotMeta });
}

async function renderAll(bundleLocation: string, inputProps: SurfForecastProps) {
  for (const format of FORMAT_CONFIGS) {
    await renderVideo(bundleLocation, inputProps, format);
  }
  await renderThumbnail(bundleLocation, inputProps);
}

async function renderVideo(
  bundleLocation: string,
  inputProps: SurfForecastProps,
  format: typeof FORMAT_CONFIGS[number]
) {
  console.log(`\nRendering [${format.id}] (${format.width}x${format.height})...`);

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: format.id,
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: path.join(OUT_DIR, format.outputFilename),
    inputProps,
  });
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

  await renderStill({
    composition: stillComposition,
    serveUrl: bundleLocation,
    output: path.join(OUT_DIR, STILL_CONFIG.outputFilename),
    inputProps,
    imageFormat: "jpeg",
    jpegQuality: 92,
  });
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
