import React from "react";
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

interface LayoutConfig {
  isPortrait: boolean;
  padding: number;
  chartHeight: number;
}

const getLayout = (width: number, height: number): LayoutConfig => {
  const isPortrait = height > width;
  const isSquare = width === height;
  return {
    isPortrait,
    padding: isPortrait ? 48 : isSquare ? 40 : 64,
    chartHeight: isPortrait ? 280 : isSquare ? 260 : 320,
  };
};

const SwellTitle = ({
  color,
  isPortrait,
}: {
  color: string;
  isPortrait: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = spring({ frame, fps, config: { damping: 180, stiffness: 90 } });
  return (
    <div style={{ opacity: interpolate(entry, [0, 1], [0, 1]), transform: `translateY(${interpolate(entry, [0, 1], [-20, 0])}px)` }}>
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
        Swell Analysis
      </h2>
    </div>
  );
};

const ChartGrid = ({ maxHeight, width, height }: { maxHeight: number; width: number; height: number }) => {
  const frame = useCurrentFrame();
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  return (
    <>
      {gridLines.map((pct) => {
        const y = height - pct * (height - 40) - 20;
        const opacity = interpolate(frame, [4, 12], [0, 0.25], { extrapolateRight: "clamp" });
        return (
          <g key={pct}>
            <line x1={0} y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.2)" strokeWidth={1} opacity={opacity} strokeDasharray="4 4" />
            <text x={-8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={11} fontFamily="sans-serif" opacity={opacity}>
              {(pct * maxHeight).toFixed(1)}
            </text>
          </g>
        );
      })}
    </>
  );
};

const SwellBar = ({
  swell,
  index,
  maxHeight,
  chartHeight,
  barWidth,
  groupWidth,
  pad,
  primary,
  secondary,
  unit,
}: {
  swell: SurfForecastProps["swellData"][number];
  index: number;
  maxHeight: number;
  chartHeight: number;
  barWidth: number;
  groupWidth: number;
  pad: number;
  primary: string;
  secondary: string;
  unit: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = spring({ frame: Math.max(0, frame - fps * 0.3 - index * fps * 0.2), fps, config: { damping: 160, stiffness: 60 } });
  const h = interpolate(entry, [0, 1], [0, 1]) * ((swell.height / maxHeight) * (chartHeight - 60));
  const x = index * groupWidth + pad;
  const y = chartHeight - 20 - h;
  const labelOp = interpolate(entry, [0.7, 1], [0, 1]);
  return (
    <g>
      <rect x={x} y={y} width={barWidth} height={h} rx={6} fill={`url(#barGrad${index})`} />
      <defs>
        <linearGradient id={`barGrad${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primary} stopOpacity={0.95} />
          <stop offset="100%" stopColor={secondary} stopOpacity={0.6} />
        </linearGradient>
      </defs>
      <text x={x + barWidth / 2} y={Math.max(y - 8, 16)} textAnchor="middle" fill="white" fontSize={14} fontWeight="700" opacity={labelOp}>
        {swell.height.toFixed(1)} {unit}
      </text>
      <text x={x + barWidth / 2} y={chartHeight - 2} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={12} opacity={labelOp}>
        {swell.direction}
      </text>
    </g>
  );
};

const getSwellCardStyle = (isPrimary: boolean, color: string, entry: number): React.CSSProperties => ({
  flex: 1,
  background: isPrimary ? `${color}22` : "rgba(255,255,255,0.06)",
  border: `1px solid ${isPrimary ? color + "66" : "rgba(255,255,255,0.1)"}`,
  borderRadius: 14,
  padding: "14px 18px",
  display: "flex",
  alignItems: "center",
  gap: 14,
  opacity: entry,
  transform: `translateY(${interpolate(entry, [0, 1], [20, 0])}px)`,
});

const SwellCard = ({
  swell,
  index,
  unit,
  color,
}: {
  swell: SurfForecastProps["swellData"][number];
  index: number;
  unit: string;
  color: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entry = spring({ frame: Math.max(0, frame - fps * 0.6 - index * fps * 0.15), fps, config: { damping: 160, stiffness: 80 } });
  return (
    <div style={getSwellCardStyle(index === 0, color, entry)}>
      <WindArrow degrees={swell.directionDegrees} size={36} color={color} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: "sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {index === 0 ? "Primary Swell" : `Swell ${index + 1}`}
        </span>
        <span style={{ fontFamily: "sans-serif", fontSize: 20, fontWeight: 700, color: "#ffffff" }}>
          {swell.height.toFixed(1)} {unit} @ {swell.period}s
        </span>
        <span style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
          {swell.direction} ({swell.directionDegrees}°)
        </span>
      </div>
    </div>
  );
};

export const SwellChart = (props: SwellChartProps) => {
  const { width, height } = useVideoConfig();
  const layout = getLayout(width, height);
  const bg = `linear-gradient(160deg, ${props.backgroundColor} 0%, ${props.secondaryColor}cc 100%)`;
  const containerStyle: React.CSSProperties = { background: bg, padding: layout.padding, display: "flex", flexDirection: "column", gap: 20, overflow: "hidden" };

  return (
    <AbsoluteFill style={containerStyle}>
      <SwellTitle color={props.primaryColor} isPortrait={layout.isPortrait} />
      <SwellSvgChart props={props} width={width} layout={layout} />
      <SwellCardsList props={props} isPortrait={layout.isPortrait} />
    </AbsoluteFill>
  );
};

const SwellSvgChart = ({ props, width, layout }: { props: SwellChartProps; width: number; layout: LayoutConfig }) => {
  const chartW = width - layout.padding * 2;
  const maxH = Math.max(...props.swellData.map((s) => s.height)) || 1;
  const groupW = chartW / props.swellData.length;
  const pad = groupW * 0.25;
  const barW = groupW - pad * 2;

  return (
    <svg width={chartW} height={layout.chartHeight} viewBox={`0 0 ${chartW} ${layout.chartHeight}`}>
      <ChartGrid maxHeight={maxH} width={chartW} height={layout.chartHeight} />
      {props.swellData.map((swell, i) => (
        <SwellBar key={i} swell={swell} index={i} maxHeight={maxH} chartHeight={layout.chartHeight} barWidth={barW} groupWidth={groupW} pad={pad} primary={props.primaryColor} secondary={props.secondaryColor} unit={props.currentWaveHeightUnit} />
      ))}
    </svg>
  );
};

const SwellCardsList = ({ props, isPortrait }: { props: SwellChartProps; isPortrait: boolean }) => (
  <div style={{ display: "flex", flexDirection: isPortrait ? "column" : "row", gap: 12, flex: 1 }}>
    {props.swellData.map((swell, i) => (
      <SwellCard key={i} swell={swell} index={i} unit={props.currentWaveHeightUnit} color={props.primaryColor} />
    ))}
  </div>
);
