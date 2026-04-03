import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast";
import { WindArrow } from "../ui/WindArrow";
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

const getWindDescription = (kts: number): string => {
  if (kts < 7) return "Light";
  if (kts < 14) return "Moderate";
  if (kts < 21) return "Fresh";
  if (kts < 28) return "Strong";
  return "Gale";
};

const getWindSurfQuality = (deg: number): string => {
  // Typical offshore for a north-facing beach
  if (deg >= 150 && deg <= 210) return "Offshore";
  if ((deg >= 0 && deg <= 45) || (deg >= 315 && deg <= 360)) return "Onshore";
  return "Cross-shore";
};

export const WindMap = ({
  windSpeed,
  windDirection,
  windDirectionDegrees,
  primaryColor,
  secondaryColor,
  backgroundColor,
}: WindMapProps) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width;
  const isSquare = width === height;
  const padding = isPortrait ? 48 : isSquare ? 40 : 64;

  const titleEntry = spring({ frame, fps, config: { damping: 180, stiffness: 90 } });
  const titleOpacity = interpolate(titleEntry, [0, 1], [0, 1]);
  const titleY = interpolate(titleEntry, [0, 1], [-20, 0]);

  const compassEntry = spring({
    frame: Math.max(0, frame - fps * 0.2),
    fps,
    config: { damping: 100, stiffness: 50 },
  });
  const compassScale = interpolate(compassEntry, [0, 1], [0.4, 1]);
  const compassOpacity = interpolate(compassEntry, [0, 1], [0, 1]);

  const statsEntry = spring({
    frame: Math.max(0, frame - fps * 0.5),
    fps,
    config: { damping: 160, stiffness: 80 },
  });
  const statsOpacity = interpolate(statsEntry, [0, 1], [0, 1]);
  const statsX = interpolate(statsEntry, [0, 1], [40, 0]);

  const compassSize = isPortrait ? 280 : isSquare ? 260 : 320;
  const cardinalSize = compassSize * 0.14;

  const cardinals = [
    { label: "N", deg: 0 },
    { label: "E", deg: 90 },
    { label: "S", deg: 180 },
    { label: "W", deg: 270 },
  ];

  // Animated rotation entry for the wind arrow inside compass
  const arrowRot = interpolate(compassEntry, [0, 1], [windDirectionDegrees - 120, windDirectionDegrees]);

  // Streamlines: static positions for visual flair
  const streamlines = [
    { x: 0.15, y: 0.3 }, { x: 0.15, y: 0.5 }, { x: 0.15, y: 0.7 },
    { x: 0.35, y: 0.25 }, { x: 0.35, y: 0.5 }, { x: 0.35, y: 0.75 },
    { x: 0.55, y: 0.3 }, { x: 0.55, y: 0.5 }, { x: 0.55, y: 0.7 },
    { x: 0.75, y: 0.35 }, { x: 0.75, y: 0.55 }, { x: 0.75, y: 0.7 },
  ];

  const vizWidth = isPortrait ? width - padding * 2 : (width - padding * 2) * 0.55;
  const vizHeight = isPortrait ? 260 : isSquare ? 240 : 280;
  const streamEntry = spring({ frame: Math.max(0, frame - fps * 0.3), fps, config: { damping: 200 } });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${backgroundColor} 0%, ${secondaryColor}cc 100%)`,
        padding,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        overflow: "hidden",
      }}
    >
      {/* Title */}
      <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
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
          Wind Conditions
        </h2>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          gap: 40,
          flex: 1,
          alignItems: isPortrait ? "center" : "flex-start",
        }}
      >
        {/* Compass Rose */}
        <div
          style={{
            transform: `scale(${compassScale})`,
            opacity: compassOpacity,
            transformOrigin: "center center",
            position: "relative",
            width: compassSize,
            height: compassSize,
            flexShrink: 0,
          }}
        >
          <svg width={compassSize} height={compassSize} viewBox="0 0 320 320">
            {/* Outer ring */}
            <circle cx="160" cy="160" r="148" fill="none" stroke={primaryColor} strokeWidth="2" opacity="0.3" />
            <circle cx="160" cy="160" r="120" fill={primaryColor} opacity="0.07" />
            <circle cx="160" cy="160" r="120" fill="none" stroke={primaryColor} strokeWidth="1" opacity="0.2" />

            {/* Tick marks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i * 10 * Math.PI) / 180;
              const isMajor = i % 9 === 0;
              const r1 = isMajor ? 130 : 135;
              const r2 = 148;
              const x1 = 160 + r1 * Math.sin(angle);
              const y1 = 160 - r1 * Math.cos(angle);
              const x2 = 160 + r2 * Math.sin(angle);
              const y2 = 160 - r2 * Math.cos(angle);
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={primaryColor}
                  strokeWidth={isMajor ? 2 : 1}
                  opacity={isMajor ? 0.7 : 0.25}
                />
              );
            })}

            {/* Cardinal labels */}
            {cardinals.map(({ label, deg }) => {
              const rad = (deg * Math.PI) / 180;
              const r = 108;
              const x = 160 + r * Math.sin(rad);
              const y = 160 - r * Math.cos(rad) + 5;
              return (
                <text
                  key={label}
                  x={x} y={y}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="18"
                  fontWeight="700"
                  fontFamily="sans-serif"
                >
                  {label}
                </text>
              );
            })}

            {/* Wind direction arrow */}
            <g transform={`rotate(${arrowRot}, 160, 160)`}>
              <polygon
                points="160,40 170,155 160,145 150,155"
                fill={primaryColor}
                opacity={0.9}
              />
              <polygon
                points="160,280 170,165 160,175 150,165"
                fill={primaryColor}
                opacity={0.3}
              />
            </g>

            {/* Center dot */}
            <circle cx="160" cy="160" r="8" fill={primaryColor} opacity={0.9} />
            <circle cx="160" cy="160" r="4" fill="white" opacity={0.8} />
          </svg>

          {/* Direction label over compass */}
          <div
            style={{
              position: "absolute",
              bottom: -32,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {windDirection} ({windDirectionDegrees}°)
            </span>
          </div>
        </div>

        {/* Wind stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
            opacity: statsOpacity,
            transform: `translateX(${statsX}px)`,
          }}
        >
          {/* Speed */}
          <div
            style={{
              background: `${primaryColor}22`,
              border: `1px solid ${primaryColor}55`,
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
            <AnimatedNumber
              value={windSpeed}
              suffix="kts"
              fontSize={isPortrait ? 52 : isSquare ? 48 : 64}
              color="#ffffff"
            />
            <span
              style={{
                fontFamily: "sans-serif",
                fontSize: 15,
                color: primaryColor,
                fontWeight: 600,
              }}
            >
              {getWindDescription(windSpeed)}
            </span>
          </div>

          {/* Surf quality tag */}
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
            <span
              style={{
                fontFamily: "sans-serif",
                fontSize: isPortrait ? 24 : 28,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {getWindSurfQuality(windDirectionDegrees)}
            </span>
          </div>

          {/* Streamline visual */}
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
            {[0, 1, 2, 3].map((row) => {
              const len = interpolate(streamEntry, [0, 1], [0, 60]);
              return (
                <div
                  key={row}
                  style={{
                    position: "absolute",
                    top: 28 + row * 14,
                    left: 16 + (row % 2) * 20,
                    width: len,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${primaryColor}cc)`,
                    borderRadius: 1,
                    transform: `rotate(${windDirectionDegrees - 90}deg)`,
                    transformOrigin: "left center",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
