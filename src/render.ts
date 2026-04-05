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

class RemotionBundler {
  async bundle(): Promise<string> {
    console.log("Bundling Remotion project...");
    return bundle({
      entryPoint: path.resolve(process.cwd(), "src/index.ts"),
      webpackOverride: (config) => config,
    });
  }
}

class RemotionRenderer {
  private readonly bundleLocation: string;
  private readonly inputProps: SurfForecastProps;

  constructor(bundleLocation: string, inputProps: SurfForecastProps) {
    this.bundleLocation = bundleLocation;
    this.inputProps = inputProps;
  }

  async renderAll(): Promise<void> {
    for (const format of FORMAT_CONFIGS) {
      await this.renderVideo(format);
    }
    await this.renderThumbnail();
  }

  private async renderVideo(format: typeof FORMAT_CONFIGS[number]): Promise<void> {
    console.log(`\nRendering [${format.id}] (${format.width}x${format.height})...`);
    const composition = await selectComposition({
      serveUrl: this.bundleLocation,
      id: format.id,
      inputProps: this.inputProps,
    });

    await renderMedia({
      composition,
      serveUrl: this.bundleLocation,
      codec: "h264",
      outputLocation: path.join(OUT_DIR, format.outputFilename),
      inputProps: this.inputProps,
    });
  }

  private async renderThumbnail(): Promise<void> {
    console.log(`\nRendering still [${STILL_CONFIG.id}]...`);
    const stillComposition = await selectComposition({
      serveUrl: this.bundleLocation,
      id: STILL_CONFIG.id,
      inputProps: this.inputProps,
    });

    await renderStill({
      composition: stillComposition,
      serveUrl: this.bundleLocation,
      output: path.join(OUT_DIR, STILL_CONFIG.outputFilename),
      inputProps: this.inputProps,
      imageFormat: "jpeg",
      jpegQuality: 92,
    });
  }
}

async function main() {
  ensureOutputDir();
  const cliArgs = parseArgs(process.argv.slice(2));
  const inputProps = await resolveInputProps(cliArgs);
  const bundleLocation = await new RemotionBundler().bundle();

  await new RemotionRenderer(bundleLocation, inputProps).renderAll();
  console.log("\nAll renders complete!");
}

async function resolveInputProps(cliArgs: CliArgs): Promise<SurfForecastProps> {
  if (!cliArgs.live) {
    console.log("\nUsing default demo data (use --live flag for real data)");
    return defaultSurfData;
  }
  return fetchLiveSurfData(cliArgs);
}

async function fetchLiveSurfData(cliArgs: CliArgs): Promise<SurfForecastProps> {
  console.log("\n🌊 Fetching live surf data...");
  const spotMeta = spotMetaFactory.fromCliArgs(cliArgs);
  const { lat, lon } = spotMetaFactory.getCoordinates(cliArgs, spotMeta);
  return fetchSurfData({ lat, lon, spotMeta });
}

function ensureOutputDir() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
