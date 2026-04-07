import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps, RatingValue } from "../../schemas/surf-forecast";
import { WaveIcon } from "../ui/WaveIcon";
import { ConditionBadge } from "../ui/ConditionBadge";

type IntroSceneProps = Pick<
  SurfForecastProps,
  | "spotName"
  | "spotLocation"
  | "date"
  | "overallRating"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
  | "brandName"
>;

interface LayoutConfig {
  isPortrait: boolean;
  titleFontSize: number;
  brandFontSize: number;
  subFontSize: number;
  locationFontSize: number;
  padding: number;
}

const getLayoutConfig = (width: number, height: number): LayoutConfig => {
  const isPortrait = height > width;
  const isSquare = width === height;
  return {
    isPortrait,
    titleFontSize: isPortrait ? 80 : isSquare ? 68 : 96,
    brandFontSize: isPortrait ? 22 : isSquare ? 20 : 24,
    subFontSize: isPortrait ? 28 : isSquare ? 24 : 32,
    locationFontSize: isPortrait ? 24 : isSquare ? 20 : 26,
    padding: isPortrait ? 60 : isSquare ? 50 : 80,
  };
};

const getBrandHeaderStyle = (entry: number, isPortrait: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  opacity: entry,
  transform: `translateY(${interpolate(entry, [0, 1], [-30, 0])}px)`,
  marginBottom: isPortrait ? 48 : 32,
});

const getBrandNameStyle = (fontSize: number, color: string): React.CSSProperties => ({
  fontFamily: "sans-serif",
  fontSize,
  fontWeight: 700,
  color,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
});

const BrandHeader = ({
  name,
  color,
  fontSize,
  entry,
  isPortrait,
}: {
  name: string;
  color: string;
  fontSize: number;
  entry: number;
  isPortrait: boolean;
}) => (
  <div style={getBrandHeaderStyle(entry, isPortrait)}>
    <WaveIcon size={fontSize * 1.6} color={color} />
    <span style={getBrandNameStyle(fontSize, color)}>{name}</span>
  </div>
);

const getSpotTitleStyle = (fontSize: number, isPortrait: boolean): React.CSSProperties => ({
  fontFamily: "sans-serif",
  fontSize,
  fontWeight: 900,
  color: "#ffffff",
  margin: 0,
  lineHeight: 1.0,
  letterSpacing: "-0.02em",
  textAlign: isPortrait ? "center" : "left",
});

const SpotTitle = ({
  name,
  fontSize,
  isPortrait,
}: {
  name: string;
  fontSize: number;
  isPortrait: boolean;
}) => <h1 style={getSpotTitleStyle(fontSize, isPortrait)}>{name}</h1>;

const SpotDetails = ({
  location,
  date,
  config,
}: {
  location: string;
  date: string;
  config: LayoutConfig;
}) => (
  <div style={{ textAlign: config.isPortrait ? "center" : "left", marginTop: 16 }}>
    <p
      style={{
        fontFamily: "sans-serif",
        fontSize: config.subFontSize,
        fontWeight: 400,
        color: "rgba(255,255,255,0.85)",
        margin: "0 0 8px",
      }}
    >
      {location}
    </p>
    <p
      style={{
        fontFamily: "sans-serif",
        fontSize: config.locationFontSize,
        fontWeight: 300,
        color: "rgba(255,255,255,0.6)",
        margin: 0,
      }}
    >
      {date}
    </p>
  </div>
);

const SeparatorLine = ({ color, width }: { color: string; width: number }) => (
  <div
    style={{
      width,
      height: 3,
      background: color,
      borderRadius: 2,
      marginBottom: 32,
    }}
  />
);

const IntroBadge = ({
  rating,
  entry,
  isPortrait,
}: {
  rating: RatingValue;
  entry: number;
  isPortrait: boolean;
}) => (
  <div
    style={{
      transform: `scale(${interpolate(entry, [0, 1], [0.5, 1])})`,
      opacity: entry,
      transformOrigin: isPortrait ? "center" : "left center",
    }}
  >
    <ConditionBadge
      rating={rating}
      fontSize={isPortrait ? 20 : 18}
      paddingH={24}
      paddingV={10}
    />
  </div>
);

const SpotInfoSection = ({
  props,
  config,
  entry,
}: {
  props: IntroSceneProps;
  config: LayoutConfig;
  entry: number;
}) => (
  <div
    style={{
      opacity: entry,
      transform: `translateY(${interpolate(entry, [0, 1], [40, 0])}px)`,
      marginBottom: config.isPortrait ? 48 : 32,
    }}
  >
    <SpotTitle name={props.spotName} fontSize={config.titleFontSize} isPortrait={config.isPortrait} />
    <SpotDetails location={props.spotLocation} date={props.date} config={config} />
  </div>
);

const getContainerStyle = (
  backgroundColor: string,
  secondaryColor: string,
  padding: number,
  isPortrait: boolean
): React.CSSProperties => ({
  background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor}cc 100%)`,
  display: "flex",
  flexDirection: "column",
  alignItems: isPortrait ? "center" : "flex-start",
  justifyContent: "center",
  padding,
  overflow: "hidden",
});

export const IntroScene = (props: IntroSceneProps) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const config = getLayoutConfig(width, height);
  const getEntry = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 180, stiffness: 100 } });
  const lineWidth = interpolate(frame, [0, fps * 0.8], [0, width * 0.5], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={getContainerStyle(props.backgroundColor, props.secondaryColor, config.padding, config.isPortrait)}>
      <BrandHeader name={props.brandName} color={props.primaryColor} fontSize={config.brandFontSize} entry={getEntry(0)} isPortrait={config.isPortrait} />
      <SpotInfoSection props={props} config={config} entry={getEntry(6)} />
      {!config.isPortrait && <SeparatorLine color={props.primaryColor} width={lineWidth} />}
      <IntroBadge rating={props.overallRating} entry={getEntry(18)} isPortrait={config.isPortrait} />
    </AbsoluteFill>
  );
};
