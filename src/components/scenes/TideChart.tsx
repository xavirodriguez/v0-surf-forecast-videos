import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast";

type TideChartProps = Pick<
  SurfForecastProps,
  "tides" | "primaryColor" | "secondaryColor" | "backgroundColor"
>;

export const TideChart = ({
  tides,
  primaryColor,
  secondaryColor,
  backgroundColor,
}: TideChartProps) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  if (tides.length === 0) {
    return (
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${backgroundColor} 0%, ${secondaryColor}cc 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ color: "white", fontFamily: "sans-serif" }}>Tide data unavailable</h2>
      </AbsoluteFill>
    );
  }

  const isPortrait = height > width;
  const isSquare = width === height;
  const padding = isPortrait ? 48 : isSquare ? 40 : 64;

  const titleEntry = spring({ frame, fps, config: { damping: 180, stiffness: 90 } });
  const titleOpacity = interpolate(titleEntry, [0, 1], [0, 1]);
  const titleY = interpolate(titleEntry, [0, 1], [-20, 0]);

  const chartW = width - padding * 2;
  const chartH = isPortrait ? 260 : isSquare ? 240 : 300;
  const svgPadX = 30;
  const svgPadY = 30;
  const plotW = chartW - svgPadX * 2;
  const plotH = chartH - svgPadY * 2;

  const heights = tides.map((t) => t.height);
  const maxH = Math.max(...heights);
  const minH = Math.min(...heights);
  const range = maxH - minH || 1;

  // Build smooth SVG path through tide points
  const points = tides.map((t, i) => ({
    x: svgPadX + (i / (tides.length - 1)) * plotW,
    y: svgPadY + plotH - ((t.height - minH) / range) * plotH,
  }));

  // Catmull-Rom to bezier approximation
  const buildPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePath = buildPath(points);
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x},${svgPadY + plotH} L ${points[0].x},${svgPadY + plotH} Z`;

  const lineEntry = spring({
    frame: Math.max(0, frame - fps * 0.2),
    fps,
    config: { damping: 160, stiffness: 50 },
  });
  const lineProgress = interpolate(lineEntry, [0, 1], [0, chartW]);
  const lineOpacity = interpolate(lineEntry, [0, 1], [0, 1]);

  const nextTide = tides.find((t) => t.type === "high") ?? tides[0];

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
          Tide Chart
        </h2>
      </div>

      {/* SVG Tide curve */}
      <svg
        width={chartW}
        height={chartH}
        viewBox={`0 0 ${chartW} ${chartH}`}
        style={{ opacity: lineOpacity }}
      >
        <defs>
          <linearGradient id="tideAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.04" />
          </linearGradient>
          <clipPath id="lineClip">
            <rect x={0} y={0} width={lineProgress} height={chartH} />
          </clipPath>
        </defs>

        {/* H/L reference lines */}
        <line
          x1={svgPadX}
          y1={svgPadY}
          x2={chartW - svgPadX}
          y2={svgPadY}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <line
          x1={svgPadX}
          y1={svgPadY + plotH}
          x2={chartW - svgPadX}
          y2={svgPadY + plotH}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text x={svgPadX - 6} y={svgPadY + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="sans-serif">HI</text>
        <text x={svgPadX - 6} y={svgPadY + plotH + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="sans-serif">LO</text>

        {/* Area fill clipped */}
        <path d={areaPath} fill="url(#tideAreaGrad)" clipPath="url(#lineClip)" />

        {/* Tide line clipped */}
        <path
          d={linePath}
          fill="none"
          stroke={primaryColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#lineClip)"
        />

        {/* Data points + labels */}
        {points.map((pt, i) => {
          const tide = tides[i];
          const ptEntry = spring({
            frame: Math.max(0, frame - fps * 0.5 - i * fps * 0.12),
            fps,
            config: { damping: 200, stiffness: 100 },
          });
          const ptOpacity = interpolate(ptEntry, [0, 1], [0, 1]);
          const ptScale = interpolate(ptEntry, [0, 1], [0, 1]);
          const isHigh = tide.type === "high";
          const labelY = isHigh ? pt.y - 22 : pt.y + 30;

          return (
            <g key={i} opacity={ptOpacity}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={8 * ptScale}
                fill={isHigh ? primaryColor : secondaryColor}
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={pt.x}
                y={labelY}
                textAnchor="middle"
                fill="white"
                fontSize={13}
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {tide.height.toFixed(1)}m
              </text>
              <text
                x={pt.x}
                y={labelY + 16}
                textAnchor="middle"
                fill="rgba(255,255,255,0.55)"
                fontSize={11}
                fontFamily="sans-serif"
              >
                {tide.time}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Next tide highlight cards */}
      <div style={{ display: "flex", flexDirection: isPortrait ? "column" : "row", gap: 12 }}>
        {tides.map((tide, i) => {
          const cardEntry = spring({
            frame: Math.max(0, frame - fps * 0.7 - i * fps * 0.1),
            fps,
            config: { damping: 160, stiffness: 80 },
          });
          const cardOpacity = interpolate(cardEntry, [0, 1], [0, 1]);
          const cardY = interpolate(cardEntry, [0, 1], [20, 0]);
          const isNext = tide === nextTide;
          const isHigh = tide.type === "high";

          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: isNext ? `${primaryColor}22` : "rgba(255,255,255,0.06)",
                border: `1px solid ${isNext ? primaryColor + "55" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
              }}
            >
              {/* Tide icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isHigh ? `${primaryColor}44` : "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${isHigh ? primaryColor : "rgba(255,255,255,0.3)"}`,
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  {isHigh ? (
                    <path d="M9 3 L14 13 H4 Z" fill="white" opacity={0.85} />
                  ) : (
                    <path d="M9 15 L14 5 H4 Z" fill="white" opacity={0.5} />
                  )}
                </svg>
              </div>
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
                  {isHigh ? "High Tide" : "Low Tide"}
                </span>
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  {tide.time}
                </span>
                <span
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {tide.height.toFixed(1)} m
                </span>
              </div>
              {isNext && (
                <div
                  style={{
                    marginLeft: "auto",
                    background: primaryColor,
                    borderRadius: 6,
                    padding: "3px 8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      color: backgroundColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Next
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
