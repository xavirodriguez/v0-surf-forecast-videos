import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import {
  SurfForecastProps,
  HourlyForecastItem,
} from "../../schemas/surf-forecast";
import { WindArrow } from "../ui/WindArrow";
import { getRatingColor, getRatingLabel } from "../../lib/rating";
import { SCENE_DURATIONS } from "../../lib/calculate-surf-metadata";

type HourlyForecastProps = Pick<
  SurfForecastProps,
  | "hourlyForecast"
  | "currentWaveHeightUnit"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
>;

const HourlyTitle = ({
  color,
  isPortrait,
}: {
  color: string;
  isPortrait: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = spring({ frame, fps, config: { damping: 180, stiffness: 90 } });
  return (
    <div style={{ opacity: entry, transform: `translateY(${interpolate(entry, [0, 1], [-20, 0])}px)` }}>
      <h2
        style={{
          fontFamily: "sans-serif",
          fontSize: isPortrait ? 20 : 22,
          fontWeight: 700,
          color,
          margin: 0,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
        }}
      >
        Hourly Forecast
      </h2>
    </div>
  );
};

const getHeaderStyle = (isPortrait: boolean, color: string): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: isPortrait ? "1.4fr 1fr 0.8fr 0.8fr" : "1.4fr 1fr 0.8fr 0.8fr 1.2fr",
  gap: 8,
  paddingBottom: 8,
  borderBottom: `1px solid ${color}44`,
  opacity: 0.6,
});

const HourlyHeader = ({
  color,
  isPortrait,
  fontSize,
}: {
  color: string;
  isPortrait: boolean;
  fontSize: number;
}) => (
  <div style={getHeaderStyle(isPortrait, color)}>
    {["Time", "Waves", "Period", "Wind", ...(isPortrait ? [] : ["Rating"])].map((col) => (
      <span
        key={col}
        style={{
          fontFamily: "sans-serif",
          fontSize,
          fontWeight: 600,
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        {col}
      </span>
    ))}
  </div>
);

const getBadgeStyle = (color: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: color + "33",
  border: `1px solid ${color}`,
  borderRadius: 999,
  padding: "3px 10px",
  alignSelf: "center",
  maxWidth: 120,
});

const RatingBadge = ({ color, label }: { color: string; label: string }) => (
  <div style={getBadgeStyle(color)}>
    <span
      style={{
        fontFamily: "sans-serif",
        fontSize: 12,
        fontWeight: 700,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {label}
    </span>
  </div>
);

const getRowStyle = (
  isPortrait: boolean,
  color: string,
  isHigh: boolean,
  entry: number
): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: isPortrait ? "1.4fr 1fr 0.8fr 0.8fr" : "1.4fr 1fr 0.8fr 0.8fr 1.2fr",
  gap: 8,
  alignItems: "center",
  background: isHigh ? `${color}22` : "rgba(255,255,255,0.04)",
  border: isHigh ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.06)",
  borderRadius: 10,
  padding: isPortrait ? "10px 12px" : "12px 16px",
  opacity: entry,
  transform: `translateX(${interpolate(entry, [0, 1], [-40, 0])}px)`,
});

const HourlyRow = ({
  row,
  index,
  unit,
  color,
  isPortrait,
  fontSize,
}: {
  row: HourlyForecastItem;
  index: number;
  unit: string;
  color: string;
  isPortrait: boolean;
  fontSize: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = fps * 0.4 + index * SCENE_DURATIONS.hourlyForecastPerRow;
  const entry = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 160, stiffness: 80 } });
  const isHigh = index === 0 || index === 1;
  return (
    <div style={getRowStyle(isPortrait, color, isHigh, entry)}>
      <span style={{ fontFamily: "sans-serif", fontSize, fontWeight: isHigh ? 700 : 400, color: isHigh ? "#ffffff" : "rgba(255,255,255,0.75)" }}>{row.hour}</span>
      <span style={{ fontFamily: "sans-serif", fontSize, fontWeight: 700, color: "#ffffff" }}>{row.waveHeight.toFixed(1)} {unit}</span>
      <span style={{ fontFamily: "sans-serif", fontSize, color: "rgba(255,255,255,0.75)" }}>{row.period}s</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <WindArrow degrees={row.windDirectionDegrees} size={20} color={color} />
        <span style={{ fontFamily: "sans-serif", fontSize: fontSize - 2, color: "rgba(255,255,255,0.75)" }}>{row.windSpeed}kts</span>
      </div>
      {!isPortrait && <RatingBadge color={getRatingColor(row.rating)} label={getRatingLabel(row.rating)} />}
    </div>
  );
};

const getContainerStyle = (
  backgroundColor: string,
  secondaryColor: string,
  padding: number
): React.CSSProperties => ({
  background: `linear-gradient(160deg, ${backgroundColor} 0%, ${secondaryColor}cc 100%)`,
  padding,
  display: "flex",
  flexDirection: "column",
  gap: 20,
  overflow: "hidden",
});

export const HourlyForecast = (props: HourlyForecastProps) => {
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;
  const isSquare = width === height;
  const padding = isPortrait ? 48 : isSquare ? 40 : 64;
  const rowSize = isPortrait ? 18 : isSquare ? 16 : 20;

  return (
    <AbsoluteFill style={getContainerStyle(props.backgroundColor, props.secondaryColor, padding)}>
      <HourlyTitle color={props.primaryColor} isPortrait={isPortrait} />
      <HourlyHeader color={props.primaryColor} isPortrait={isPortrait} fontSize={isPortrait ? 12 : 13} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {props.hourlyForecast.map((row, index) => (
          <HourlyRow key={row.hour} row={row} index={index} unit={props.currentWaveHeightUnit} color={props.primaryColor} isPortrait={isPortrait} fontSize={rowSize} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
