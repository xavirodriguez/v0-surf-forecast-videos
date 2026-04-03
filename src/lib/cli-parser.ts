export interface CliArgs {
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
}

export function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = { live: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case "--live":
        result.live = true;
        break;
      case "--lat":
        if (nextArg) result.lat = parseFloat(args[++i]);
        break;
      case "--lon":
        if (nextArg) result.lon = parseFloat(args[++i]);
        break;
      case "--spot":
        if (nextArg) result.spot = args[++i];
        break;
      case "--location":
        if (nextArg) result.location = args[++i];
        break;
      case "--name":
        if (nextArg) result.spotName = args[++i];
        break;
      case "--brand":
        if (nextArg) result.brandName = args[++i];
        break;
      case "--primary-color":
        if (nextArg) result.primaryColor = args[++i];
        break;
      case "--secondary-color":
        if (nextArg) result.secondaryColor = args[++i];
        break;
      case "--bg-color":
        if (nextArg) result.backgroundColor = args[++i];
        break;
      case "--wave-unit":
        if (nextArg) result.waveUnit = nextArg as "ft" | "m";
        i++;
        break;
      case "--temp-unit":
        if (nextArg) result.tempUnit = nextArg as "C" | "F";
        i++;
        break;
      case "--noaa-station":
        if (nextArg) result.noaaStationId = args[++i];
        break;
    }
  }

  return result;
}
