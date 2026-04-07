import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast";
import { WaveIcon } from "../ui/WaveIcon";
import { ConditionBadge } from "../ui/ConditionBadge";

type OutroSceneProps = Pick<
  SurfForecastProps,
  | "spotName"
  | "brandName"
  | "overallRating"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
  | "logoUrl"
>;

const RippleCircle = ({
  size,
  color,
  opacity,
  scale,
}: {
  size: number;
  color: string;
  opacity: number;
  scale: number;
}) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2px solid ${color}`,
      opacity,
      transform: `scale(${scale})`,
    }}
  />
);

const Ripple = ({ width, color, entry }: { width: number; color: string; entry: number }) => {
  const scale = interpolate(entry, [0, 1], [0.6, 1.2]);
  const opacity = interpolate(entry, [0, 1], [0, 0.12]);
  return (
    <>
      <RippleCircle size={width * 0.8} color={color} opacity={opacity} scale={scale} />
      <RippleCircle size={width * 0.55} color={color} opacity={opacity * 0.7} scale={scale * 0.85} />
    </>
  );
};

const OutroBrand = ({
  name,
  color,
  fontSize,
  entry,
}: {
  name: string;
  color: string;
  fontSize: number;
  entry: number;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      opacity: entry,
      transform: `translateY(${interpolate(entry, [0, 1], [30, 0])}px)`,
      marginBottom: 32,
    }}
  >
    <WaveIcon size={fontSize * 1.8} color={color} />
    <span
      style={{
        fontFamily: "sans-serif",
        fontSize,
        fontWeight: 700,
        color,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      {name}
    </span>
  </div>
);

const MainCTA = ({
  spotName,
  color,
  titleFontSize,
  subFontSize,
  entry,
}: {
  spotName: string;
  color: string;
  titleFontSize: number;
  subFontSize: number;
  entry: number;
}) => (
  <div
    style={{
      opacity: entry,
      transform: `translateY(${interpolate(entry, [0, 1], [40, 0])}px)`,
      textAlign: "center",
      marginBottom: 32,
    }}
  >
    <h2
      style={{
        fontFamily: "sans-serif",
        fontSize: titleFontSize,
        fontWeight: 900,
        color: "#ffffff",
        margin: 0,
        marginBottom: 12,
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
      }}
    >
      Check the Surf at
      <br />
      <span style={{ color }}>{spotName}</span>
    </h2>
    <p
      style={{
        fontFamily: "sans-serif",
        fontSize: subFontSize,
        fontWeight: 400,
        color: "rgba(255,255,255,0.6)",
        margin: 0,
      }}
    >
      Daily forecasts. Updated every 3 hours.
    </p>
  </div>
);

export const OutroScene = (props: OutroSceneProps) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const isPortrait = height > width, isSquare = width === height, padding = isPortrait ? 60 : isSquare ? 50 : 80;
  const titleSize = isPortrait ? 52 : isSquare ? 44 : 64, subSize = isPortrait ? 22 : isSquare ? 20 : 26, brandSize = isPortrait ? 20 : isSquare ? 18 : 22;
  const getSpring = (d: number, s: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 180, stiffness: s } });
  const badgeSpring = getSpring(22, 90);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${props.backgroundColor} 0%, ${props.secondaryColor}cc 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding,
        overflow: "hidden",
      }}
    >
      <Ripple width={width} color={props.primaryColor} entry={getSpring(0, 60)} />
      <OutroBrand name={props.brandName} color={props.primaryColor} fontSize={brandSize} entry={getSpring(6, 160)} />
      <MainCTA spotName={props.spotName} color={props.primaryColor} titleFontSize={titleSize} subFontSize={subSize} entry={getSpring(14, 70)} />
      <div style={{ transform: `scale(${interpolate(badgeSpring, [0, 1], [0.5, 1])})`, opacity: badgeSpring }}>
        <ConditionBadge rating={props.overallRating} fontSize={isPortrait ? 18 : 16} paddingH={24} paddingV={10} />
      </div>
    </AbsoluteFill>
  );
};
