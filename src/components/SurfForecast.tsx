import { AbsoluteFill, useVideoConfig } from "remotion";
import {
  TransitionSeries,
  linearTiming,
  Presentation,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SurfForecastProps } from "../schemas/surf-forecast";
import {
  getSceneStartFrames,
  SCENE_DURATIONS,
} from "../lib/calculate-surf-metadata";
import { IntroScene } from "./scenes/IntroScene";
import { CurrentConditions } from "./scenes/CurrentConditions";
import { HourlyForecast } from "./scenes/HourlyForecast";
import { SwellChart } from "./scenes/SwellChart";
import { WindMap } from "./scenes/WindMap";
import { TideChart } from "./scenes/TideChart";
import { OutroScene } from "./scenes/OutroScene";

const TRANSITION_DURATION = 18; // frames

export const SurfForecast = (props: SurfForecastProps) => {
  const { fps } = useVideoConfig();
  const starts = getSceneStartFrames(props);
  const transitionTiming = linearTiming({
    durationInFrames: TRANSITION_DURATION,
  });

  const renderTransition = (presentation: Presentation) => (
    <TransitionSeries.Transition
      timing={transitionTiming}
      presentation={presentation}
    />
  );

  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.intro + TRANSITION_DURATION} premountFor={fps}>
          <IntroScene
            spotName={props.spotName}
            spotLocation={props.spotLocation}
            date={props.date}
            overallRating={props.overallRating}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
            brandName={props.brandName}
          />
        </TransitionSeries.Sequence>

        {renderTransition(fade())}

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

        {renderTransition(slide({ direction: "from-right" }))}

        <TransitionSeries.Sequence durationInFrames={starts.hourlyDuration + TRANSITION_DURATION} premountFor={fps}>
          <HourlyForecast
            hourlyForecast={props.hourlyForecast}
            currentWaveHeightUnit={props.currentWaveHeightUnit}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
          />
        </TransitionSeries.Sequence>

        {renderTransition(slide({ direction: "from-right" }))}

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.swellChart + TRANSITION_DURATION} premountFor={fps}>
          <SwellChart
            swellData={props.swellData}
            currentWaveHeightUnit={props.currentWaveHeightUnit}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
          />
        </TransitionSeries.Sequence>

        {renderTransition(slide({ direction: "from-right" }))}

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.windMap + TRANSITION_DURATION} premountFor={fps}>
          <WindMap
            windSpeed={props.windSpeed}
            windDirection={props.windDirection}
            windDirectionDegrees={props.windDirectionDegrees}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
          />
        </TransitionSeries.Sequence>

        {renderTransition(slide({ direction: "from-right" }))}

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.tideChart + TRANSITION_DURATION} premountFor={fps}>
          <TideChart
            tides={props.tides}
            primaryColor={props.primaryColor}
            secondaryColor={props.secondaryColor}
            backgroundColor={props.backgroundColor}
          />
        </TransitionSeries.Sequence>

        {renderTransition(fade())}

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.outro} premountFor={fps}>
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
