import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Sequence,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast.js";
import { WaveIcon } from "../ui/WaveIcon.js";
import { WindArrow } from "../ui/WindArrow.js";
import { ConditionBadge } from "../ui/ConditionBadge.js";
import { AnimatedNumber } from "../ui/AnimatedNumber.js";

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

type StatCardProps = {
  label: string;
  children: React.ReactNode;
  delay?: number;
  primaryColor: string;
  backgroundColor: string;
  flex?: number;
};

const StatCard = ({
  label,
  children,
  delay = 0,
  primaryColor,
  backgroundColor,
  flex = 1,
}: StatCardProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 160, stiffness: 80 },
  });

  const opacity = interpolate(entry, [0, 1], [0, 1]);
  const translateY = interpolate(entry, [0, 1], [30, 0]);

  return (
    <div
      style={{
        flex,
        background: "rgba(255,255,255,0.07)",
        border: `1px solid ${primaryColor}44`,
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
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
      {children}
    </div>
  );
};

export const CurrentConditions = ({
  currentWaveHeight,
  currentWaveHeightUnit,
  currentPeriod,
  currentDirection,
  currentDirectionDegrees,
  waterTemp,
  waterTempUnit,
  windSpeed,
  windDirection,
  windDirectionDegrees,
  overallRating,
  primaryColor,
  secondaryColor,
  backgroundColor,
}: CurrentConditionsProps) => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const isPortrait = height > width;
  const isSquare = width === height;

  const titleEntry = spring({ frame, fps, config: { damping: 180, stiffness: 90 } });
  const titleOpacity = interpolate(titleEntry, [0, 1], [0, 1]);
  const titleY = interpolate(titleEntry, [0, 1], [-20, 0]);

  const heroFontSize = isPortrait ? 120 : isSquare ? 100 : 140;
  const statFontSize = isPortrait ? 36 : isSquare ? 32 : 44;
  const padding = isPortrait ? 48 : isSquare ? 40 : 64;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${backgroundColor} 0%, ${secondaryColor}dd 100%)`,
        padding,
        display: "flex",
        flexDirection: "column",
        gap: isPortrait ? 24 : 20,
        overflow: "hidden",
      }}
    >
      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <h2
          style={{
            fontFamily: "sans-serif",
            fontSize: isPortrait ? 20 : 22,
            fontWeight: 700,
            color: primaryColor,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
          }}
        >
          Current Conditions
        </h2>
        <Sequence from={8} premountFor={fps}>
          <ConditionBadge rating={overallRating} fontSize={14} />
        </Sequence>
      </div>

      {/* Hero wave height */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 20,
          flex: isPortrait ? 0 : 1,
        }}
      >
        <WaveIcon size={heroFontSize * 0.55} color={primaryColor} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Sequence from={4} premountFor={fps}>
            <AnimatedNumber
              value={currentWaveHeight}
              decimals={1}
              suffix={currentWaveHeightUnit}
              fontSize={heroFontSize}
              color="#ffffff"
            />
          </Sequence>
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
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <WindArrow degrees={currentDirectionDegrees} size={isPortrait ? 48 : 56} color={primaryColor} />
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {currentDirection}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          gap: 12,
          flex: 1,
        }}
      >
        <Sequence from={6} premountFor={fps}>
          <StatCard label="Period" delay={0} primaryColor={primaryColor} backgroundColor={backgroundColor}>
            <AnimatedNumber value={currentPeriod} suffix="s" fontSize={statFontSize} color="#ffffff" />
          </StatCard>
        </Sequence>

        <Sequence from={10} premountFor={fps}>
          <StatCard label="Wind" delay={0} primaryColor={primaryColor} backgroundColor={backgroundColor}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AnimatedNumber value={windSpeed} suffix="kts" fontSize={statFontSize} color="#ffffff" />
              <WindArrow degrees={windDirectionDegrees} size={32} color={primaryColor} />
              <span style={{ fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.7)" }}>
                {windDirection}
              </span>
            </div>
          </StatCard>
        </Sequence>

        <Sequence from={14} premountFor={fps}>
          <StatCard label="Water Temp" delay={0} primaryColor={primaryColor} backgroundColor={backgroundColor}>
            <AnimatedNumber value={waterTemp} suffix={`°${waterTempUnit}`} fontSize={statFontSize} color="#ffffff" />
          </StatCard>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
