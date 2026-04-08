import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps, TideEvent } from "../../schemas/surf-forecast";

type TideChartProps = Pick<
  SurfForecastProps,
  "tides" | "primaryColor" | "secondaryColor" | "backgroundColor"
>;

const getLayout = (width: number, height: number) => {
  const isPortrait = height > width;
  const padding = isPortrait ? 48 : width === height ? 40 : 64;
  return { isPortrait, padding };
};

const TideTitle = ({ color, isPortrait }: { color: string; isPortrait: boolean }) => {
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
        Tide Chart
      </h2>
    </div>
  );
};

const TidePoint = ({
  pt,
  tide,
  index,
  primary,
  secondary,
}: {
  pt: { x: number; y: number };
  tide: TideEvent;
  index: number;
  primary: string;
  secondary: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = fps * 0.5 + index * fps * 0.12;
  const entry = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 200, stiffness: 100 } });
  const labelY = tide.type === "high" ? pt.y - 22 : pt.y + 30;
  return (
    <g opacity={entry}>
      <circle cx={pt.x} cy={pt.y} r={8 * entry} fill={tide.type === "high" ? primary : secondary} stroke="white" strokeWidth={2} />
      <text x={pt.x} y={labelY} textAnchor="middle" fill="white" fontSize={13} fontWeight="700" fontFamily="sans-serif">
        {tide.height.toFixed(1)}m
      </text>
      <text x={pt.x} y={labelY + 16} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={11} fontFamily="sans-serif">
        {tide.time}
      </text>
    </g>
  );
};

const TideCardHeader = ({ isHigh, color }: { isHigh: boolean; color: string }) => (
  <div
    style={{
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: isHigh ? `${color}44` : "rgba(255,255,255,0.1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: `2px solid ${isHigh ? color : "rgba(255,255,255,0.3)"}`,
      flexShrink: 0,
    }}
  >
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {isHigh ? <path d="M9 3 L14 13 H4 Z" fill="white" opacity={0.85} /> : <path d="M9 15 L14 5 H4 Z" fill="white" opacity={0.5} />}
    </svg>
  </div>
);

const TideCardLabels = ({ type, time, height }: { type: string; time: string; height: number }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
      {type === "high" ? "High Tide" : "Low Tide"}
    </span>
    <span style={{ fontFamily: "sans-serif", fontSize: 20, fontWeight: 700, color: "#ffffff" }}>{time}</span>
    <span style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{height.toFixed(1)} m</span>
  </div>
);

const TideCard = ({
  tide,
  index,
  isNext,
  color,
  bg,
}: {
  tide: TideEvent;
  index: number;
  isNext: boolean;
  color: string;
  bg: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = fps * 0.7 + index * fps * 0.1;
  const entry = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 160, stiffness: 80 } });
  return (
    <div
      style={{
        flex: 1,
        background: isNext ? `${color}22` : "rgba(255,255,255,0.06)",
        border: `1px solid ${isNext ? color + "55" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: entry,
        transform: `translateY(${interpolate(entry, [0, 1], [20, 0])}px)`,
      }}
    >
      <TideCardHeader isHigh={tide.type === "high"} color={color} />
      <TideCardLabels type={tide.type} time={tide.time} height={tide.height} />
      {isNext && (
        <div style={{ marginLeft: "auto", background: color, borderRadius: 6, padding: "3px 8px" }}>
          <span style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 700, color: bg, textTransform: "uppercase", letterSpacing: "0.1em" }}>Next</span>
        </div>
      )}
    </div>
  );
};

function buildSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6, cp1y = p1.y + (p2.y - p0.y) / 6, cp2x = p2.x - (p3.x - p1.x) / 6, cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

const TideSvgBackground = ({ width, height }: { width: number; height: number }) => (
  <g>
    <line x1={30} y1={30} x2={width - 30} y2={30} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 4" />
    <line x1={30} y1={height - 30} x2={width - 30} y2={height - 30} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 4" />
    <text x={24} y={34} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="sans-serif">HI</text>
    <text x={24} y={height - 26} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="sans-serif">LO</text>
  </g>
);

const TideSvg = ({
  tides,
  primary,
  secondary,
  width,
  height,
  padding,
}: {
  tides: TideEvent[];
  primary: string;
  secondary: string;
  width: number;
  height: number;
  padding: number;
}) => {
  const chartW = width - padding * 2;
  const chartH = height > width ? 260 : width === height ? 240 : 300;
  const plotW = chartW - 60, plotH = chartH - 60;
  const minH = Math.min(...tides.map((t) => t.height));
  const range = Math.max(...tides.map((t) => t.height)) - minH || 1;
  const points = tides.map((t, i) => ({ x: 30 + (i / (tides.length - 1)) * plotW, y: 30 + plotH - ((t.height - minH) / range) * plotH }));
  const linePath = buildSmoothPath(points);
  const areaPath = linePath + ` L ${points[points.length - 1].x},${chartH - 30} L ${points[0].x},${chartH - 30} Z`;
  const progress = interpolate(spring({ frame: Math.max(0, useCurrentFrame() - useVideoConfig().fps * 0.2), fps: useVideoConfig().fps, config: { damping: 160, stiffness: 50 } }), [0, 1], [0, chartW]);
  return (
    <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} style={{ opacity: interpolate(progress, [0, chartW], [0, 1]) }}>
      <defs>
        <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primary} stopOpacity="0.4" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.04" />
        </linearGradient>
        <clipPath id="clip"><rect x={0} y={0} width={progress} height={chartH} /></clipPath>
      </defs>
      <TideSvgBackground width={chartW} height={chartH} />
      <path d={areaPath} fill="url(#areaG)" clipPath="url(#clip)" />
      <path d={linePath} fill="none" stroke={primary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" clipPath="url(#clip)" />
      {points.map((pt, i) => <TidePoint key={i} pt={pt} tide={tides[i]} index={i} primary={primary} secondary={secondary} />)}
    </svg>
  );
};

export const TideChart = (props: TideChartProps) => {
  const { width, height } = useVideoConfig();
  const { isPortrait, padding } = getLayout(width, height);
  const bg = `linear-gradient(160deg, ${props.backgroundColor} 0%, ${props.secondaryColor}cc 100%)`;

  if (props.tides.length === 0) return <TideUnavailableView background={bg} />;

  return (
    <AbsoluteFill style={getTideContainerStyle(bg, padding)}>
      <TideTitle color={props.primaryColor} isPortrait={isPortrait} />
      <TideSvg tides={props.tides} primary={props.primaryColor} secondary={props.secondaryColor} width={width} height={height} padding={padding} />
      <TideCardsList props={props} isPortrait={isPortrait} />
    </AbsoluteFill>
  );
};

const getTideContainerStyle = (bg: string, padding: number): React.CSSProperties => ({
  background: bg,
  padding,
  display: "flex",
  flexDirection: "column",
  gap: 20,
  overflow: "hidden",
});

const TideUnavailableView = ({ background }: { background: string }) => (
  <AbsoluteFill style={{ background, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <h2 style={{ color: "white", fontFamily: "sans-serif" }}>Tide data unavailable</h2>
  </AbsoluteFill>
);

const TideCardsList = ({ props, isPortrait }: { props: TideChartProps; isPortrait: boolean }) => {
  const nextTide = props.tides.find((t) => t.type === "high") ?? props.tides[0];
  return (
    <div style={{ display: "flex", flexDirection: isPortrait ? "column" : "row", gap: 12 }}>
      {props.tides.map((t, i) => (
        <TideCard key={i} tide={t} index={i} isNext={t === nextTide} color={props.primaryColor} bg={props.backgroundColor} />
      ))}
    </div>
  );
};
