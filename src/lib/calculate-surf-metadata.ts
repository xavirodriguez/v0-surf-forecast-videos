import { CalculateMetadataFunction } from "remotion";
import { SurfForecastProps } from "../schemas/surf-forecast.js";

const FPS = 30;

const SEC = (s: number) => Math.round(s * FPS);

export const SCENE_DURATIONS = {
  intro: SEC(2.5),
  currentConditions: SEC(3.5),
  hourlyForecastBase: SEC(2),
  hourlyForecastPerRow: SEC(0.6),
  swellChart: SEC(3),
  windMap: SEC(3),
  tideChart: SEC(3),
  outro: SEC(2.5),
};

export const getSceneStartFrames = (props: SurfForecastProps) => {
  const hourlyDuration =
    SCENE_DURATIONS.hourlyForecastBase +
    Math.max(props.hourlyForecast.length, 4) *
      SCENE_DURATIONS.hourlyForecastPerRow;

  const intro = 0;
  const currentConditions = intro + SCENE_DURATIONS.intro;
  const hourlyForecast = currentConditions + SCENE_DURATIONS.currentConditions;
  const swellChart = hourlyForecast + hourlyDuration;
  const windMap = swellChart + SCENE_DURATIONS.swellChart;
  const tideChart = windMap + SCENE_DURATIONS.windMap;
  const outro = tideChart + SCENE_DURATIONS.tideChart;
  const total = outro + SCENE_DURATIONS.outro;

  return {
    intro,
    currentConditions,
    hourlyForecast,
    hourlyDuration,
    swellChart,
    windMap,
    tideChart,
    outro,
    total,
  };
};

export const calculateSurfMetadata: CalculateMetadataFunction<
  SurfForecastProps
> = ({ props }) => {
  const { total } = getSceneStartFrames(props);
  return {
    durationInFrames: total,
    fps: FPS,
  };
};
