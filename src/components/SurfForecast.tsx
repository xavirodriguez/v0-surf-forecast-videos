import { AbsoluteFill, useVideoConfig } from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SurfForecastProps } from "../schemas/surf-forecast.js";
import { getSceneStartFrames, SCENE_DURATIONS } from "../lib/calculate-surf-metadata.js";
import { IntroScene } from "./scenes/IntroScene.js";
import { CurrentConditions } from "./scenes/CurrentConditions.js";
import { HourlyForecast } from "./scenes/HourlyForecast.js";
import { SwellChart } from "./scenes/SwellChart.js";
import { WindMap } from "./scenes/WindMap.js";
import { TideChart } from "./scenes/TideChart.js";
import { OutroScene } from "./scenes/OutroScene.js";

const TRANSITION_DURATION = 18; // frames

export const SurfForecast = (props: SurfForecastProps) => {
  const { fps } = useVideoConfig();
  const starts = getSceneStartFrames(props);

  const transitionTiming = linearTiming({ durationInFrames: TRANSITION_DURATION });

  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Intro */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.intro + TRANSITION_DURATION}
          premountFor={fps}
        >
          <IntroScene
            spotName={props.spotName}
            spotLocation={props.spotLocation}
            date={props.date}
            overallRating={props.overallRating}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
            brandName={props.brandName}
            logoUrl={props.logoUrl}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition timing={transitionTiming} presentation={fade()} />

        {/* Current Conditions */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.currentConditions + TRANSITION_DURATION}
          premountFor={fps}
        >
          <CurrentConditions
            currentWaveHeight={props.currentWaveHeight}
            currentWaveHeightUnit={props.currentWaveHeightUnit}
            currentPeriod={props.currentPeriod}
            currentDirection={props.currentDirection}
            currentDirectionDegrees={props.currentDirectionDegrees}
            waterTemp={props.waterTemp}
            waterTempUnit={props.waterTempUnit}
            windSpeed={props.windSpeed}
            windDirection={props.windDirection}
            windDirectionDegrees={props.windDirectionDegrees}
            overallRating={props.overallRating}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition timing={transitionTiming} presentation={slide({ direction: "from-right" })} />

        {/* Hourly Forecast */}
        <TransitionSeries.Sequence
          durationInFrames={starts.hourlyDuration + TRANSITION_DURATION}
          premountFor={fps}
        >
          <HourlyForecast
            hourlyForecast={props.hourlyForecast}
            currentWaveHeightUnit={props.currentWaveHeightUnit}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition timing={transitionTiming} presentation={slide({ direction: "from-right" })} />

        {/* Swell Chart */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.swellChart + TRANSITION_DURATION}
          premountFor={fps}
        >
          <SwellChart
            swellData={props.swellData}
            currentWaveHeightUnit={props.currentWaveHeightUnit}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition timing={transitionTiming} presentation={slide({ direction: "from-right" })} />

        {/* Wind Map */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.windMap + TRANSITION_DURATION}
          premountFor={fps}
        >
          <WindMap
            windSpeed={props.windSpeed}
            windDirection={props.windDirection}
            windDirectionDegrees={props.windDirectionDegrees}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition timing={transitionTiming} presentation={slide({ direction: "from-right" })} />

        {/* Tide Chart */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.tideChart + TRANSITION_DURATION}
          premountFor={fps}
        >
          <TideChart
            tides={props.tides}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition timing={transitionTiming} presentation={fade()} />

        {/* Outro */}
        <TransitionSeries.Sequence
          durationInFrames={SCENE_DURATIONS.outro}
          premountFor={fps}
        >
          <OutroScene
            spotName={props.spotName}
            brandName={props.brandName}
            overallRating={props.overallRating}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
            logoUrl={props.logoUrl}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
