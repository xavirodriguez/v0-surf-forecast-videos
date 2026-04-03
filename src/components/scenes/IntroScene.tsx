import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast";
import { WaveIcon } from "../ui/WaveIcon";
import { ConditionBadge } from "../ui/ConditionBadge";

type IntroSceneProps = Pick<
  SurfForecastProps,
  | "spotName"
  | "spotLocation"
  | "date"
  | "overallRating"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
  | "brandName"
>;

interface LayoutConfig {
  isPortrait: boolean;
  titleFontSize: number;
  brandFontSize: number;
  subFontSize: number;
  locationFontSize: number;
  padding: number;
}

const getLayoutConfig = (width: number, height: number): LayoutConfig => {
  const isPortrait = height > width;
  const isSquare = width === height;
  return {
    isPortrait,
    titleFontSize: isPortrait ? 80 : isSquare ? 68 : 96,
    brandFontSize: isPortrait ? 22 : isSquare ? 20 : 24,
    subFontSize: isPortrait ? 28 : isSquare ? 24 : 32,
    locationFontSize: isPortrait ? 24 : isSquare ? 20 : 26,
    padding: isPortrait ? 60 : isSquare ? 50 : 80,
  };
};

const BrandHeader = ({ name, color, fontSize, entry, isPortrait }: { name: string, color: string, fontSize: number, entry: number, isPortrait: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      opacity: entry,
      transform: `translateY(${interpolate(entry, [0, 1], [-30, 0])}px)`,
      marginBottom: isPortrait ? 48 : 32,
    }}
  >
    <WaveIcon size={fontSize * 1.6} color={color} />
    <span
      style={{
        fontFamily: "sans-serif",
        fontSize,
        fontWeight: 700,
        color,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      {name}
    </span>
  </div>
);

const SpotInfo = ({ name, location, date, config, entry }: { name: string, location: string, date: string, config: LayoutConfig, entry: number }) => (
  <div
    style={{
      opacity: entry,
      transform: `translateY(${interpolate(entry, [0, 1], [40, 0])}px)`,
      textAlign: config.isPortrait ? "center" : "left",
      marginBottom: config.isPortrait ? 48 : 32,
    }}
  >
    <h1 style={{ fontFamily: "sans-serif", fontSize: config.titleFontSize, fontWeight: 900, color: "#ffffff", margin: 0, lineHeight: 1.0, letterSpacing: "-0.02em" }}>
      {name}
    </h1>
    <p style={{ fontFamily: "sans-serif", fontSize: config.subFontSize, fontWeight: 400, color: "rgba(255,255,255,0.85)", margin: "16px 0 8px" }}>
      {location}
    </p>
    <p style={{ fontFamily: "sans-serif", fontSize: config.locationFontSize, fontWeight: 300, color: "rgba(255,255,255,0.6)", margin: 0 }}>
      {date}
    </p>
  </div>
);

export const IntroScene = ({
  spotName,
  spotLocation,
  date,
  overallRating,
  primaryColor,
  secondaryColor,
  backgroundColor,
  brandName,
}: IntroSceneProps) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const config = getLayoutConfig(width, height);

  const getSpring = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 180, stiffness: 100 } });

  const brandEntry = getSpring(0);
  const titleEntry = getSpring(6);
  const badgeEntry = getSpring(18);

  const lineWidth = interpolate(frame, [0, fps * 0.8], [0, width * 0.5], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor}cc 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: config.isPortrait ? "center" : "flex-start",
        justifyContent: "center",
        padding: config.padding,
        overflow: "hidden",
      }}
    >
      <BrandHeader name={brandName} color={primaryColor} fontSize={config.brandFontSize} entry={brandEntry} isPortrait={config.isPortrait} />
      <SpotInfo name={spotName} location={spotLocation} date={date} config={config} entry={titleEntry} />

      {!config.isPortrait && <div style={{ width: lineWidth, height: 3, background: primaryColor, borderRadius: 2, marginBottom: 32 }} />}

      <div style={{ transform: `scale(${interpolate(badgeEntry, [0, 1], [0.5, 1])})`, opacity: badgeEntry, transformOrigin: config.isPortrait ? "center" : "left center" }}>
        <ConditionBadge rating={overallRating} fontSize={config.isPortrait ? 20 : 18} paddingH={24} paddingV={10} />
      </div>
    </AbsoluteFill>
  );
};
