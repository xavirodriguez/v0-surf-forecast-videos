import { Composition, Folder, Still } from "remotion";
import { surfForecastSchema, defaultSurfData } from "./schemas/surf-forecast.js";
import { calculateSurfMetadata } from "./lib/calculate-surf-metadata.js";
import { SurfForecast } from "./components/SurfForecast.js";
import { SurfThumbnail } from "./components/SurfThumbnail.js";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Surf Forecast Videos">
        {/* Landscape — YouTube / Web */}
        <Composition
          id="surf-forecast-landscape"
          component={SurfForecast}
          schema={surfForecastSchema}
          defaultProps={defaultSurfData}
          calculateMetadata={calculateSurfMetadata}
          width={1920}
          height={1080}
          fps={30}
          durationInFrames={300}
        />

        {/* Portrait — Instagram Stories */}
        <Composition
          id="surf-forecast-portrait"
          component={SurfForecast}
          schema={surfForecastSchema}
          defaultProps={defaultSurfData}
          calculateMetadata={calculateSurfMetadata}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={300}
        />

        {/* Square — Instagram Feed */}
        <Composition
          id="surf-forecast-square"
          component={SurfForecast}
          schema={surfForecastSchema}
          defaultProps={defaultSurfData}
          calculateMetadata={calculateSurfMetadata}
          width={1080}
          height={1080}
          fps={30}
          durationInFrames={300}
        />

        {/* Shorts — YouTube Shorts */}
        <Composition
          id="surf-forecast-shorts"
          component={SurfForecast}
          schema={surfForecastSchema}
          defaultProps={defaultSurfData}
          calculateMetadata={calculateSurfMetadata}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={300}
        />

        {/* TikTok */}
        <Composition
          id="surf-forecast-tiktok"
          component={SurfForecast}
          schema={surfForecastSchema}
          defaultProps={defaultSurfData}
          calculateMetadata={calculateSurfMetadata}
          width={1080}
          height={1920}
          fps={30}
          durationInFrames={300}
        />
      </Folder>

      <Folder name="Surf Forecast Thumbnails">
        {/* Still thumbnail */}
        <Still
          id="surf-forecast-thumbnail"
          component={SurfThumbnail}
          schema={surfForecastSchema}
          defaultProps={defaultSurfData}
          width={1280}
          height={720}
        />
      </Folder>
    </>
  );
};
