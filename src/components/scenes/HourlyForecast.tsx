import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast.js";
import { WindArrow } from "../ui/WindArrow.js";
import { getRatingColor, getRatingLabel } from "../../lib/rating.js";
import { SCENE_DURATIONS } from "../../lib/calculate-surf-metadata.js";

type HourlyForecastProps = Pick<
  SurfForecastProps,
  | "hourlyForecast"
  | "currentWaveHeightUnit"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
>;

export const HourlyForecast = ({
  hourlyForecast,
  currentWaveHeightUnit,
  primaryColor,
  secondaryColor,
  backgroundColor,
}: HourlyForecastProps) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width;
  const isSquare = width === height;

  const padding = isPortrait ? 48 : isSquare ? 40 : 64;
  const rowFontSize = isPortrait ? 18 : isSquare ? 16 : 20;
  const headerFontSize = isPortrait ? 12 : 13;

  const titleEntry = spring({ frame, fps, config: { damping: 180, stiffness: 90 } });
  const titleOpacity = interpolate(titleEntry, [0, 1], [0, 1]);
  const titleY = interpolate(titleEntry, [0, 1], [-20, 0]);

  const perRowFrames = SCENE_DURATIONS.hourlyForecastPerRow;
  const baseDelay = fps * 0.4;

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
      <div
        style={{
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
          Hourly Forecast
        </h2>
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isPortrait
            ? "1.4fr 1fr 0.8fr 0.8fr"
            : "1.4fr 1fr 0.8fr 0.8fr 1.2fr",
          gap: 8,
          paddingBottom: 8,
          borderBottom: `1px solid ${primaryColor}44`,
          opacity: 0.6,
        }}
      >
        {["Time", "Waves", "Period", "Wind", ...(isPortrait ? [] : ["Rating"])].map(
          (col) => (
            <span
              key={col}
              style={{
                fontFamily: "sans-serif",
                fontSize: headerFontSize,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {col}
            </span>
          )
        )}
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {hourlyForecast.map((row, i) => {
          const rowDelay = baseDelay + i * perRowFrames;
          const rowEntry = spring({
            frame: Math.max(0, frame - rowDelay),
            fps,
            config: { damping: 160, stiffness: 80 },
          });
          const rowOpacity = interpolate(rowEntry, [0, 1], [0, 1]);
          const rowX = interpolate(rowEntry, [0, 1], [-40, 0]);
          const ratingColor = getRatingColor(row.rating);
          const isHighlighted = i === 0 || i === 1;

          return (
            <div
              key={row.hour}
              style={{
                display: "grid",
                gridTemplateColumns: isPortrait
                  ? "1.4fr 1fr 0.8fr 0.8fr"
                  : "1.4fr 1fr 0.8fr 0.8fr 1.2fr",
                gap: 8,
                alignItems: "center",
                background: isHighlighted
                  ? `${primaryColor}22`
                  : "rgba(255,255,255,0.04)",
                border: isHighlighted
                  ? `1px solid ${primaryColor}55`
                  : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: isPortrait ? "10px 12px" : "12px 16px",
                opacity: rowOpacity,
                transform: `translateX(${rowX}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: "sans-serif",
                  fontSize: rowFontSize,
                  fontWeight: isHighlighted ? 700 : 400,
                  color: isHighlighted ? "#ffffff" : "rgba(255,255,255,0.75)",
                }}
              >
                {row.hour}
              </span>
              <span
                style={{
                  fontFamily: "sans-serif",
                  fontSize: rowFontSize,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {row.waveHeight.toFixed(1)} {currentWaveHeightUnit}
              </span>
              <span
                style={{
                  fontFamily: "sans-serif",
                  fontSize: rowFontSize,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {row.period}s
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <WindArrow degrees={0} size={20} color={primaryColor} />
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: rowFontSize - 2,
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  {row.windSpeed}kts
                </span>
              </div>
              {!isPortrait && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: ratingColor + "33",
                    border: `1px solid ${ratingColor}`,
                    borderRadius: 999,
                    padding: "3px 10px",
                    alignSelf: "center",
                    maxWidth: 120,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      color: ratingColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {getRatingLabel(row.rating)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
