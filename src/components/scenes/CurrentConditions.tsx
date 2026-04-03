import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast";
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

const StatCard = ({ label, children, delay = 0, primaryColor, statFontSize }: { label: string, children: React.ReactNode, delay?: number, primaryColor: string, statFontSize: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 160, stiffness: 80 },
  });

  return (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.07)",
        border: `1px solid ${primaryColor}44`,
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        opacity: entry,
        transform: `translateY(${interpolate(entry, [0, 1], [30, 0])}px)`,
      }}
    >
      <span style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
        {label}
      </span>
      {children}
    </div>
  );
};

const HeroHeight = ({ height, unit, color, fontSize, isPortrait }: { height: number, unit: string, color: string, fontSize: number, isPortrait: boolean }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flex: isPortrait ? 0 : 1 }}>
    <WaveIcon size={fontSize * 0.55} color={color} />
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <AnimatedNumber value={height} decimals={1} suffix={unit} fontSize={fontSize} color="#ffffff" />
      <span style={{ fontFamily: "sans-serif", fontSize: isPortrait ? 16 : 18, fontWeight: 400, color: "rgba(255,255,255,0.55)" }}>Wave Height</span>
    </div>
  </div>
);

export const CurrentConditions = ({
  currentWaveHeight,
  currentWaveHeightUnit,
  currentPeriod,
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
  const { width, height } = useVideoConfig();
  const config = getLayoutConfig(width, height);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${backgroundColor} 0%, ${secondaryColor}dd 100%)`, padding: config.padding, display: "flex", flexDirection: "column", gap: config.gap, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontFamily: "sans-serif", fontSize: config.isPortrait ? 20 : 22, fontWeight: 700, color: primaryColor, margin: 0, textTransform: "uppercase", letterSpacing: "0.15em" }}>Current Conditions</h2>
        <ConditionBadge rating={overallRating} fontSize={14} />
      </div>

      <HeroHeight height={currentWaveHeight} unit={currentWaveHeightUnit} color={primaryColor} fontSize={config.heroFontSize} isPortrait={config.isPortrait} />

      <div style={{ display: "flex", flexDirection: config.isPortrait ? "column" : "row", gap: 12, flex: 1 }}>
        <StatCard label="Period" primaryColor={primaryColor} statFontSize={config.statFontSize}>
          <AnimatedNumber value={currentPeriod} suffix="s" fontSize={config.statFontSize} color="#ffffff" />
        </StatCard>
        <StatCard label="Wind" primaryColor={primaryColor} statFontSize={config.statFontSize} delay={10}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AnimatedNumber value={windSpeed} suffix="kts" fontSize={config.statFontSize} color="#ffffff" />
            <WindArrow degrees={windDirectionDegrees} size={32} color={primaryColor} />
            <span style={{ fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.7)" }}>{windDirection}</span>
          </div>
        </StatCard>
        <StatCard label="Water Temp" primaryColor={primaryColor} statFontSize={config.statFontSize} delay={20}>
          <AnimatedNumber value={waterTemp} suffix={`°${waterTempUnit}`} fontSize={config.statFontSize} color="#ffffff" />
        </StatCard>
      </div>
    </AbsoluteFill>
  );
};
