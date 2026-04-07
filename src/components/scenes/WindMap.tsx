import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast";
import { AnimatedNumber } from "../ui/AnimatedNumber";

type WindMapProps = Pick<
  SurfForecastProps,
  | "windSpeed"
  | "windDirection"
  | "windDirectionDegrees"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
>;

const getWindDescription = (knots: number): string => {
  if (knots < 7) return "Light";
  if (knots < 14) return "Moderate";
  if (knots < 21) return "Fresh";
  if (knots < 28) return "Strong";
  return "Gale";
};

const getWindSurfQuality = (degrees: number): string => {
  const isOffshore = degrees >= 150 && degrees <= 210;
  const isOnshore = (degrees >= 0 && degrees <= 45) || (degrees >= 315 && degrees <= 360);
  if (isOffshore) return "Offshore";
  if (isOnshore) return "Onshore";
  return "Cross-shore";
};

const CompassTick = ({ angle, color, index }: { angle: number; color: string; index: number }) => {
  const isMajor = index % 9 === 0;
  const radiusInner = isMajor ? 130 : 135;
  const radiusOuter = 148;
  const x1 = 160 + radiusInner * Math.sin(angle);
  const y1 = 160 - radiusInner * Math.cos(angle);
  const x2 = 160 + radiusOuter * Math.sin(angle);
  const y2 = 160 - radiusOuter * Math.cos(angle);
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={isMajor ? 2 : 1}
      opacity={isMajor ? 0.7 : 0.25}
    />
  );
};

const CompassRing = ({ color }: { color: string }) => (
  <>
    <circle cx="160" cy="160" r="148" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
    <circle cx="160" cy="160" r="120" fill={color} opacity="0.07" />
    <circle cx="160" cy="160" r="120" fill="none" stroke={color} strokeWidth="1" opacity="0.2" />
    {Array.from({ length: 36 }).map((_, i) => (
      <CompassTick key={i} index={i} angle={(i * 10 * Math.PI) / 180} color={color} />
    ))}
  </>
);

const CardinalLabel = ({ label, degrees }: { label: string; degrees: number }) => {
  const radians = (degrees * Math.PI) / 180;
  const x = 160 + 108 * Math.sin(radians);
  const y = 160 - 108 * Math.cos(radians) + 5;
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill="rgba(255,255,255,0.7)"
      fontSize="18"
      fontWeight="700"
      fontFamily="sans-serif"
    >
      {label}
    </text>
  );
};

const CompassCardinals = () => (
  <>
    <CardinalLabel label="N" degrees={0} />
    <CardinalLabel label="E" degrees={90} />
    <CardinalLabel label="S" degrees={180} />
    <CardinalLabel label="W" degrees={270} />
  </>
);

const CompassArrow = ({ degrees, entry, color }: { degrees: number; entry: number; color: string }) => {
  const rotation = interpolate(entry, [0, 1], [degrees - 120, degrees]);
  return (
    <g transform={`rotate(${rotation}, 160, 160)`}>
      <polygon points="160,40 170,155 160,145 150,155" fill={color} opacity={0.9} />
      <polygon points="160,280 170,165 160,175 150,165" fill={color} opacity={0.3} />
    </g>
  );
};

const Compass = ({ size, color, degrees, entry }: { size: number; color: string; degrees: number; entry: number }) => (
  <div
    style={{
      transform: `scale(${interpolate(entry, [0, 1], [0.4, 1])})`,
      opacity: entry,
      position: "relative",
      width: size,
      height: size,
      flexShrink: 0,
    }}
  >
    <svg width={size} height={size} viewBox="0 0 320 320">
      <CompassRing color={color} />
      <CompassCardinals />
      <CompassArrow degrees={degrees} entry={entry} color={color} />
      <circle cx="160" cy="160" r="8" fill={color} opacity={0.9} />
      <circle cx="160" cy="160" r="4" fill="white" opacity={0.8} />
    </svg>
  </div>
);

const FlowLine = ({ index, color, degrees, length }: { index: number; color: string; degrees: number; length: number }) => (
  <div
    style={{
      position: "absolute",
      top: 28 + index * 14,
      left: 16 + (index % 2) * 20,
      width: length,
      height: 2,
      background: `linear-gradient(90deg, transparent, ${color}cc)`,
      borderRadius: 1,
      transform: `rotate(${degrees - 90}deg)`,
      transformOrigin: "left center",
    }}
  />
);

const WindFlow = ({ color, degrees }: { color: string; degrees: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = spring({ frame: Math.max(0, frame - fps * 0.3), fps, config: { damping: 200 } });
  const length = interpolate(entry, [0, 1], [0, 60]);
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 16,
        position: "relative",
        overflow: "hidden",
        height: 80,
      }}
    >
      <span
        style={{
          fontFamily: "sans-serif",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          position: "absolute",
          top: 10,
          left: 16,
        }}
      >
        Flow
      </span>
      {Array.from({ length: 4 }).map((_, i) => (
        <FlowLine key={i} index={i} color={color} degrees={degrees} length={length} />
      ))}
    </div>
  );
};

const SpeedCard = ({ knots, color, isPortrait, isSquare }: { knots: number; color: string; isPortrait: boolean; isSquare: boolean }) => (
  <div
    style={{
      background: `${color}22`,
      border: `1px solid ${color}55`,
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
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
      Wind Speed
    </span>
    <AnimatedNumber value={knots} suffix="kts" fontSize={isPortrait ? 52 : isSquare ? 48 : 64} color="#ffffff" />
    <span style={{ fontFamily: "sans-serif", fontSize: 15, color, fontWeight: 600 }}>{getWindDescription(knots)}</span>
  </div>
);

const QualityCard = ({ degrees, isPortrait }: { degrees: number; isPortrait: boolean }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 14,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}
  >
    <span
      style={{
        fontFamily: "sans-serif",
        fontSize: 12,
        fontWeight: 600,
        color: "rgba(255,255,255,0.45)",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      }}
    >
      Wind Type
    </span>
    <span style={{ fontFamily: "sans-serif", fontSize: isPortrait ? 24 : 28, fontWeight: 700, color: "#ffffff" }}>
      {getWindSurfQuality(degrees)}
    </span>
  </div>
);

const WindStats = ({ speed, deg, color, isPortrait, isSquare }: { speed: number; deg: number; color: string; isPortrait: boolean; isSquare: boolean }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
    <SpeedCard knots={speed} color={color} isPortrait={isPortrait} isSquare={isSquare} />
    <QualityCard degrees={deg} isPortrait={isPortrait} />
    <WindFlow color={color} degrees={deg} />
  </div>
);

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

const getTitleStyle = (isPortrait: boolean, color: string, entry: number): React.CSSProperties => ({
  opacity: entry,
  transform: `translateY(${interpolate(entry, [0, 1], [-20, 0])}px)`,
  fontFamily: "sans-serif",
  fontSize: isPortrait ? 20 : 22,
  fontWeight: 700,
  color,
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
});

export const WindMap = (props: WindMapProps) => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const isPortrait = height > width;
  const isSquare = width === height;
  const padding = isPortrait ? 48 : isSquare ? 40 : 64;
  const compassSize = isPortrait ? 280 : isSquare ? 260 : 320;
  const titleSpring = spring({ frame, fps, config: { damping: 180, stiffness: 90 } });
  const compassSpring = spring({ frame: Math.max(0, frame - fps * 0.2), fps, config: { damping: 100, stiffness: 50 } });
  const statsSpring = spring({ frame: Math.max(0, frame - fps * 0.5), fps, config: { damping: 160, stiffness: 80 } });

  return (
    <AbsoluteFill style={getContainerStyle(props.backgroundColor, props.secondaryColor, padding)}>
      <h2 style={getTitleStyle(isPortrait, props.primaryColor, titleSpring)}>Wind Conditions</h2>
      <div
        style={{
          display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          gap: 40,
          flex: 1,
          alignItems: isPortrait ? "center" : "flex-start",
        }}
      >
        <Compass size={compassSize} color={props.primaryColor} degrees={props.windDirectionDegrees} entry={compassSpring} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
            opacity: statsSpring,
            transform: `translateX(${interpolate(statsSpring, [0, 1], [40, 0])}px)`,
          }}
        >
          <WindStats speed={props.windSpeed} deg={props.windDirectionDegrees} color={props.primaryColor} isPortrait={isPortrait} isSquare={isSquare} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
