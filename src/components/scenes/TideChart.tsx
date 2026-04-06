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

export const TideChart = ({
  tides,
  primaryColor,
  secondaryColor,
  backgroundColor,
}: TideChartProps) => {
  const { width, height } = useVideoConfig();
  const { isPortrait, padding } = getLayout(width, height);

  if (tides.length === 0) {
    return <TideDataUnavailable bg={backgroundColor} secondary={secondaryColor} />;
  }

  return (
    <AbsoluteFill style={getTideContainerStyle(backgroundColor, secondaryColor, padding)}>
      <TideTitle primaryColor={primaryColor} isPortrait={isPortrait} />
      <TideSvg tides={tides} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      <TideCards tides={tides} primaryColor={primaryColor} secondaryColor={secondaryColor} backgroundColor={backgroundColor} />
    </AbsoluteFill>
  );
};

const getTideContainerStyle = (bg: string, secondary: string, padding: number): React.CSSProperties => ({
  background: `linear-gradient(160deg, ${bg} 0%, ${secondary}cc 100%)`,
  padding,
  display: "flex",
  flexDirection: "column",
  gap: 20,
  overflow: "hidden",
});

const TideDataUnavailable = ({ bg, secondary }: { bg: string, secondary: string }) => (
  <AbsoluteFill style={{ background: `linear-gradient(160deg, ${bg} 0%, ${secondary}cc 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <h2 style={{ color: "white", fontFamily: "sans-serif" }}>Tide data unavailable</h2>
  </AbsoluteFill>
);

const TideTitle = ({ primaryColor, isPortrait }: { primaryColor: string, isPortrait: boolean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleEntry = spring({ frame, fps, config: { damping: 180, stiffness: 90 } });
  const titleOpacity = interpolate(titleEntry, [0, 1], [0, 1]);
  const titleY = interpolate(titleEntry, [0, 1], [-20, 0]);

  return (
    <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
      <h2 style={getTideTitleStyle(primaryColor, isPortrait)}>Tide Chart</h2>
    </div>
  );
};

const getTideTitleStyle = (color: string, isPortrait: boolean): React.CSSProperties => ({
  fontFamily: "sans-serif",
  fontSize: isPortrait ? 20 : 22,
  fontWeight: 700,
  color,
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
});

const TideSvg = ({ tides, primaryColor, secondaryColor }: { tides: TideEvent[], primaryColor: string, secondaryColor: string }) => {
  const { width, height } = useVideoConfig();
  const { padding } = getLayout(width, height);
  const chartW = width - padding * 2;
  const chartH = height > width ? 260 : width === height ? 240 : 300;
  const { points, areaPath, linePath } = getChartPaths(tides, chartW, chartH);
  const lineOpacity = interpolate(spring({ frame: useCurrentFrame(), fps: useVideoConfig().fps }), [0, 1], [0, 1]);

  return (
    <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} style={{ opacity: lineOpacity }}>
      <TideSvgDefs primaryColor={primaryColor} chartW={chartW} chartH={chartH} />
      <TideReferenceLines chartW={chartW} chartH={chartH} />
      <path d={areaPath} fill="url(#tideAreaGrad)" clipPath="url(#lineClip)" />
      <path d={linePath} fill="none" stroke={primaryColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" clipPath="url(#lineClip)" />
      {points.map((pt, i) => <TidePoint key={i} pt={pt} tide={tides[i]} index={i} primaryColor={primaryColor} secondaryColor={secondaryColor} />)}
    </svg>
  );
};

const getChartPaths = (tides: TideEvent[], chartW: number, chartH: number) => {
  const svgPadX = 30, svgPadY = 30;
  const plotW = chartW - svgPadX * 2, plotH = chartH - svgPadY * 2;
  const heights = tides.map((t) => t.height);
  const minH = Math.min(...heights), range = Math.max(...heights) - minH || 1;
  const points = tides.map((t, i) => ({ x: svgPadX + (i / (tides.length - 1)) * plotW, y: svgPadY + plotH - ((t.height - minH) / range) * plotH }));
  const linePath = buildSmoothPath(points);
  const areaPath = linePath + ` L ${points[points.length - 1].x},${svgPadY + plotH} L ${points[0].x},${svgPadY + plotH} Z`;
  return { points, areaPath, linePath };
};

const TideSvgDefs = ({ primaryColor, chartW, chartH }: { primaryColor: string, chartW: number, chartH: number }) => {
  const lineProgress = interpolate(spring({ frame: Math.max(0, useCurrentFrame() - useVideoConfig().fps * 0.2), fps: useVideoConfig().fps }), [0, 1], [0, chartW]);
  return (
    <defs>
      <linearGradient id="tideAreaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
        <stop offset="100%" stopColor={primaryColor} stopOpacity="0.04" />
      </linearGradient>
      <clipPath id="lineClip"><rect x={0} y={0} width={lineProgress} height={chartH} /></clipPath>
    </defs>
  );
};

const TideReferenceLines = ({ chartW, chartH }: { chartW: number, chartH: number }) => {
  const svgPadX = 30, svgPadY = 30, plotH = chartH - svgPadY * 2;
  return (
    <g>
      <line x1={svgPadX} y1={svgPadY} x2={chartW - svgPadX} y2={svgPadY} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 4" />
      <line x1={svgPadX} y1={svgPadY + plotH} x2={chartW - svgPadX} y2={svgPadY + plotH} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 4" />
      <text x={svgPadX - 6} y={svgPadY + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="sans-serif">HI</text>
      <text x={svgPadX - 6} y={svgPadY + plotH + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="sans-serif">LO</text>
    </g>
  );
};

const TidePoint = ({ pt, tide, index, primaryColor, secondaryColor }: { pt: { x: number, y: number }, tide: TideEvent, index: number, primaryColor: string, secondaryColor: string }) => {
  const ptEntry = spring({ frame: Math.max(0, useCurrentFrame() - useVideoConfig().fps * 0.5 - index * useVideoConfig().fps * 0.12), fps: useVideoConfig().fps });
  const isHigh = tide.type === "high";
  const labelY = isHigh ? pt.y - 22 : pt.y + 30;
  return (
    <g opacity={interpolate(ptEntry, [0, 1], [0, 1])}>
      <circle cx={pt.x} cy={pt.y} r={8 * interpolate(ptEntry, [0, 1], [0, 1])} fill={isHigh ? primaryColor : secondaryColor} stroke="white" strokeWidth={2} />
      <text x={pt.x} y={labelY} textAnchor="middle" fill="white" fontSize={13} fontWeight="700" fontFamily="sans-serif">{tide.height.toFixed(1)}m</text>
      <text x={pt.x} y={labelY + 16} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={11} fontFamily="sans-serif">{tide.time}</text>
    </g>
  );
};

const TideCards = ({ tides, primaryColor, secondaryColor, backgroundColor }: { tides: TideEvent[], primaryColor: string, secondaryColor: string, backgroundColor: string }) => {
  const { width, height } = useVideoConfig();
  const { isPortrait } = getLayout(width, height);
  const nextTide = tides.find((t) => t.type === "high") ?? tides[0];
  return (
    <div style={{ display: "flex", flexDirection: isPortrait ? "column" : "row", gap: 12 }}>
      {tides.map((t, i) => <TideCard key={i} tide={t} index={i} isNext={t === nextTide} primaryColor={primaryColor} backgroundColor={backgroundColor} />)}
    </div>
  );
};

const TideCard = ({ tide, index, isNext, primaryColor, backgroundColor }: { tide: TideEvent, index: number, isNext: boolean, primaryColor: string, backgroundColor: string }) => {
  const cardEntry = spring({ frame: Math.max(0, useCurrentFrame() - useVideoConfig().fps * 0.7 - index * useVideoConfig().fps * 0.1), fps: useVideoConfig().fps });
  const cardOpacity = interpolate(cardEntry, [0, 1], [0, 1]), cardY = interpolate(cardEntry, [0, 1], [20, 0]);
  return (
    <div style={getTideCardStyle(isNext, primaryColor, cardOpacity, cardY)}>
      <TideIcon isHigh={tide.type === "high"} primaryColor={primaryColor} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TideCardLabels isHigh={tide.type === "high"} time={tide.time} height={tide.height} />
      </div>
      {isNext && <NextBadge primaryColor={primaryColor} backgroundColor={backgroundColor} />}
    </div>
  );
};

const getTideCardStyle = (isNext: boolean, color: string, opacity: number, y: number): React.CSSProperties => ({
  flex: 1, background: isNext ? `${color}22` : "rgba(255,255,255,0.06)", border: `1px solid ${isNext ? color + "55" : "rgba(255,255,255,0.1)"}`,
  borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, opacity, transform: `translateY(${y}px)`,
});

const TideIcon = ({ isHigh, primaryColor }: { isHigh: boolean, primaryColor: string }) => (
  <div style={{ width: 36, height: 36, borderRadius: "50%", background: isHigh ? `${primaryColor}44` : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${isHigh ? primaryColor : "rgba(255,255,255,0.3)"}`, flexShrink: 0 }}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {isHigh ? <path d="M9 3 L14 13 H4 Z" fill="white" opacity={0.85} /> : <path d="M9 15 L14 5 H4 Z" fill="white" opacity={0.5} />}
    </svg>
  </div>
);

const TideCardLabels = ({ isHigh, time, height }: { isHigh: boolean, time: string, height: number }) => (
  <>
    <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{isHigh ? "High Tide" : "Low Tide"}</span>
    <span style={{ fontFamily: "sans-serif", fontSize: 20, fontWeight: 700, color: "#ffffff" }}>{time}</span>
    <span style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{height.toFixed(1)} m</span>
  </>
);

const NextBadge = ({ primaryColor, backgroundColor }: { primaryColor: string, backgroundColor: string }) => (
  <div style={{ marginLeft: "auto", background: primaryColor, borderRadius: 6, padding: "3px 8px" }}>
    <span style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 700, color: backgroundColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>Next</span>
  </div>
);

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
