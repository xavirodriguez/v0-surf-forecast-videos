import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, renderStill } from "@remotion/renderer";
import { FORMAT_CONFIGS, STILL_CONFIG } from "./lib/format-configs.js";
import { defaultSurfData } from "./schemas/surf-forecast.js";

const OUT_DIR = path.resolve(process.cwd(), "out");

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

  const inputProps = defaultSurfData;

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
    quality: 92,
  });

  console.log(`  Saved → ${stillOutputLocation}`);

  console.log("\nAll renders complete!");
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
