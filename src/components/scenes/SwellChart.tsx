import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast";
import { WindArrow } from "../ui/WindArrow";

type SwellChartProps = Pick<
  SurfForecastProps,
  | "swellData"
  | "currentWaveHeightUnit"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
>;

export const SwellChart = ({
  swellData,
  currentWaveHeightUnit,
  primaryColor,
  secondaryColor,
  backgroundColor,
}: SwellChartProps) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width;
  const isSquare = width === height;
  const padding = isPortrait ? 48 : isSquare ? 40 : 64;
  const chartHeight = isPortrait ? 280 : isSquare ? 260 : 320;

  const titleEntry = spring({ frame, fps, config: { damping: 180, stiffness: 90 } });
  const titleOpacity = interpolate(titleEntry, [0, 1], [0, 1]);
  const titleY = interpolate(titleEntry, [0, 1], [-20, 0]);

  const maxHeight = Math.max(...swellData.map((s) => s.height));
  const chartWidth = width - padding * 2;
  const barGroupWidth = chartWidth / swellData.length;
  const barPad = barGroupWidth * 0.25;
  const barWidth = barGroupWidth - barPad * 2;

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
          Swell Analysis
        </h2>
      </div>

      {/* SVG Bar Chart */}
      <svg
        width={chartWidth}
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = chartHeight - pct * (chartHeight - 40) - 20;
          const gridOpacity = interpolate(frame, [4, 12], [0, 0.25], {
            extrapolateRight: "clamp",
          });
          return (
            <g key={pct}>
              <line
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                opacity={gridOpacity}
                strokeDasharray="4 4"
              />
              <text
                x={-8}
                y={y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.4)"
                fontSize={11}
                fontFamily="sans-serif"
                opacity={gridOpacity}
              >
                {(pct * maxHeight).toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {swellData.map((swell, i) => {
          const barEntry = spring({
            frame: Math.max(0, frame - fps * 0.3 - i * fps * 0.2),
            fps,
            config: { damping: 160, stiffness: 60 },
          });

          const barHeightPx =
            interpolate(barEntry, [0, 1], [0, 1]) *
            ((swell.height / maxHeight) * (chartHeight - 60));

          const x = i * barGroupWidth + barPad;
          const y = chartHeight - 20 - barHeightPx;

          const labelOpacity = interpolate(barEntry, [0.7, 1], [0, 1]);

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeightPx}
                rx={6}
                fill={`url(#barGrad${i})`}
              />
              <defs>
                <linearGradient
                  id={`barGrad${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={primaryColor} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.6} />
                </linearGradient>
              </defs>

              {/* Height label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={Math.max(y - 8, 16)}
                textAnchor="middle"
                fill="white"
                fontSize={14}
                fontFamily="sans-serif"
                fontWeight="700"
                opacity={labelOpacity}
              >
                {swell.height.toFixed(1)} {currentWaveHeightUnit}
              </text>

              {/* X-axis labels */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 2}
                textAnchor="middle"
                fill="rgba(255,255,255,0.55)"
                fontSize={12}
                fontFamily="sans-serif"
                opacity={labelOpacity}
              >
                {swell.direction}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Swell detail cards */}
      <div
        style={{
          display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          gap: 12,
          flex: 1,
        }}
      >
        {swellData.map((swell, i) => {
          const cardEntry = spring({
            frame: Math.max(0, frame - fps * 0.6 - i * fps * 0.15),
            fps,
            config: { damping: 160, stiffness: 80 },
          });
          const cardOpacity = interpolate(cardEntry, [0, 1], [0, 1]);
          const cardY = interpolate(cardEntry, [0, 1], [20, 0]);

          const isPrimary = i === 0;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: isPrimary ? `${primaryColor}22` : "rgba(255,255,255,0.06)",
                border: `1px solid ${isPrimary ? primaryColor + "66" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
              }}
            >
              <WindArrow degrees={swell.directionDegrees} size={36} color={primaryColor} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.45)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {isPrimary ? "Primary Swell" : `Swell ${i + 1}`}
                </span>
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  {swell.height.toFixed(1)} {currentWaveHeightUnit} @ {swell.period}s
                </span>
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {swell.direction} ({swell.directionDegrees}°)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
