import { CliArgs } from "./cli-parser";
import { getSpotByName, SpotMeta } from "./spots";

export class SpotMetaFactory {
  fromCliArgs(cliArgs: CliArgs): SpotMeta {
    if (cliArgs.spot) {
      return getSpotByName(cliArgs.spot);
    }

    this.validateCustomSpot(cliArgs);
    return this.createCustomSpot(cliArgs);
  }

  private validateCustomSpot(cliArgs: CliArgs): void {
    if (!cliArgs.lat || !cliArgs.lon) {
      throw new Error(
        "Error: --live requires either --spot <name> or both --lat and --lon"
      );
    }
  }

  private createCustomSpot(cliArgs: CliArgs): SpotMeta {
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

  getCoordinates(cliArgs: CliArgs, spotMeta: SpotMeta): { lat: number; lon: number } {
    const spot = spotMeta as { lat?: number; lon?: number };
    return {
      lat: spot.lat ?? cliArgs.lat!,
      lon: spot.lon ?? cliArgs.lon!,
    };
  }
}
