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
import { WindArrow } from "../ui/WindArrow";
import { ConditionBadge } from "../ui/ConditionBadge";
import { AnimatedNumber } from "../ui/AnimatedNumber";

type CurrentConditionsProps = Pick<
  SurfForecastProps,
  | "currentWaveHeight"
  | "currentWaveHeightUnit"
  | "currentPeriod"
  | "currentDirection"
  | "currentDirectionDegrees"
  | "waterTemp"
  | "waterTempUnit"
  | "windSpeed"
  | "windDirection"
  | "windDirectionDegrees"
  | "overallRating"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
>;

interface LayoutConfig {
  isPortrait: boolean;
  heroFontSize: number;
  statFontSize: number;
  padding: number;
  gap: number;
}

const getLayoutConfig = (width: number, height: number): LayoutConfig => {
  const isPortrait = height > width;
  const isSquare = width === height;
  return {
    isPortrait,
    heroFontSize: isPortrait ? 120 : isSquare ? 100 : 140,
    statFontSize: isPortrait ? 36 : isSquare ? 32 : 44,
    padding: isPortrait ? 48 : isSquare ? 40 : 64,
    gap: isPortrait ? 24 : 20,
  };
};

const getHeaderRowStyle = (color: string): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const getTitleStyle = (isPortrait: boolean, color: string): React.CSSProperties => ({
  fontFamily: "sans-serif",
  fontSize: isPortrait ? 20 : 22,
  fontWeight: 700,
  color,
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
});

const HeaderRow = ({
  color,
  isPortrait,
  rating,
}: {
  color: string;
  isPortrait: boolean;
  rating: RatingValue;
}) => (
  <div style={getHeaderRowStyle(color)}>
    <h2 style={getTitleStyle(isPortrait, color)}>Current Conditions</h2>
    <ConditionBadge rating={rating} fontSize={14} />
  </div>
);

const getCardStyle = (
  entry: number,
  color: string
): React.CSSProperties => ({
  flex: 1,
  background: "rgba(255,255,255,0.07)",
  border: `1px solid ${color}44`,
  borderRadius: 16,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  opacity: entry,
  transform: `translateY(${interpolate(entry, [0, 1], [30, 0])}px)`,
});

const StatLabel = ({ label }: { label: string }) => (
  <span
    style={{
      fontFamily: "sans-serif",
      fontSize: 12,
      fontWeight: 600,
      color: "rgba(255,255,255,0.5)",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
    }}
  >
    {label}
  </span>
);

const StatCard = ({
  label,
  children,
  delay = 0,
  color,
}: {
  label: string;
  children: React.ReactNode;
  delay?: number;
  color: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 160, stiffness: 80 },
  });
  return (
    <div style={getCardStyle(entry, color)}>
      <StatLabel label={label} />
      {children}
    </div>
  );
};

const getHeroStyle = (isPortrait: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "flex-end",
  gap: 20,
  flex: isPortrait ? 0 : 1,
});

const HeroHeight = ({
  height,
  unit,
  color,
  fontSize,
  isPortrait,
}: {
  height: number;
  unit: string;
  color: string;
  fontSize: number;
  isPortrait: boolean;
}) => (
  <div style={getHeroStyle(isPortrait)}>
    <WaveIcon size={fontSize * 0.55} color={color} />
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <AnimatedNumber value={height} decimals={1} suffix={unit} fontSize={fontSize} color="#ffffff" />
      <span
        style={{
          fontFamily: "sans-serif",
          fontSize: isPortrait ? 16 : 18,
          fontWeight: 400,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        Wave Height
      </span>
    </div>
  </div>
);

const getContainerStyle = (
  backgroundColor: string,
  secondaryColor: string,
  padding: number,
  gap: number
): React.CSSProperties => ({
  background: `linear-gradient(160deg, ${backgroundColor} 0%, ${secondaryColor}dd 100%)`,
  padding,
  display: "flex",
  flexDirection: "column",
  gap,
  overflow: "hidden",
});

const getStatsContainerStyle = (isPortrait: boolean): React.CSSProperties => ({
  display: "flex",
  flexDirection: isPortrait ? "column" : "row",
  gap: 12,
  flex: 1,
});

export const CurrentConditions = (props: CurrentConditionsProps) => {
  const { width, height } = useVideoConfig();
  const config = getLayoutConfig(width, height);
  return (
    <AbsoluteFill style={getContainerStyle(props.backgroundColor, props.secondaryColor, config.padding, config.gap)}>
      <HeaderRow color={props.primaryColor} isPortrait={config.isPortrait} rating={props.overallRating} />
      <HeroHeight height={props.currentWaveHeight} unit={props.currentWaveHeightUnit} color={props.primaryColor} fontSize={config.heroFontSize} isPortrait={config.isPortrait} />
      <div style={getStatsContainerStyle(config.isPortrait)}>
        <StatCard label="Period" color={props.primaryColor}>
          <AnimatedNumber value={props.currentPeriod} suffix="s" fontSize={config.statFontSize} color="#ffffff" />
        </StatCard>
        <StatCard label="Wind" color={props.primaryColor} delay={10}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AnimatedNumber value={props.windSpeed} suffix="kts" fontSize={config.statFontSize} color="#ffffff" />
            <WindArrow degrees={props.windDirectionDegrees} size={32} color={props.primaryColor} />
            <span style={{ fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.7)" }}>{props.windDirection}</span>
          </div>
        </StatCard>
        <StatCard label="Water Temp" color={props.primaryColor} delay={20}>
          <AnimatedNumber value={props.waterTemp} suffix={`°${props.waterTempUnit}`} fontSize={config.statFontSize} color="#ffffff" />
        </StatCard>
      </div>
    </AbsoluteFill>
  );
};
