import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../../schemas/surf-forecast.js";
import { WaveIcon } from "../ui/WaveIcon.js";
import { ConditionBadge } from "../ui/ConditionBadge.js";

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
  | "logoUrl"
>;

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

  const isPortrait = height > width;
  const isSquare = width === height;

  const brandEntry = spring({ frame, fps, config: { damping: 180, stiffness: 100 } });
  const titleEntry = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 160, stiffness: 80 } });
  const subEntry = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 160, stiffness: 80 } });
  const badgeEntry = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 200, stiffness: 90 } });

  const brandOpacity = interpolate(brandEntry, [0, 1], [0, 1]);
  const brandY = interpolate(brandEntry, [0, 1], [-30, 0]);

  const titleOpacity = interpolate(titleEntry, [0, 1], [0, 1]);
  const titleY = interpolate(titleEntry, [0, 1], [40, 0]);

  const subOpacity = interpolate(subEntry, [0, 1], [0, 1]);
  const subY = interpolate(subEntry, [0, 1], [30, 0]);

  const badgeScale = interpolate(badgeEntry, [0, 1], [0.5, 1]);
  const badgeOpacity = interpolate(badgeEntry, [0, 1], [0, 1]);

  const titleFontSize = isPortrait ? 80 : isSquare ? 68 : 96;
  const subFontSize = isPortrait ? 28 : isSquare ? 24 : 32;
  const locationFontSize = isPortrait ? 24 : isSquare ? 20 : 26;
  const brandFontSize = isPortrait ? 22 : isSquare ? 20 : 24;
  const padding = isPortrait ? 60 : isSquare ? 50 : 80;

  // Animated wave line
  const lineWidth = interpolate(frame, [0, fps * 0.8], [0, width * 0.5], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor}cc 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: isPortrait ? "center" : "flex-start",
        justifyContent: isPortrait ? "center" : "center",
        padding,
        overflow: "hidden",
      }}
    >
      {/* Background decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -height * 0.2,
          right: -width * 0.1,
          width: width * 0.6,
          height: width * 0.6,
          borderRadius: "50%",
          background: primaryColor,
          opacity: 0.06,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -height * 0.15,
          left: -width * 0.05,
          width: width * 0.4,
          height: width * 0.4,
          borderRadius: "50%",
          background: primaryColor,
          opacity: 0.08,
        }}
      />

      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: brandOpacity,
          transform: `translateY(${brandY}px)`,
          marginBottom: isPortrait ? 48 : 32,
        }}
      >
        <WaveIcon size={brandFontSize * 1.6} color={primaryColor} />
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: brandFontSize,
            fontWeight: 700,
            color: primaryColor,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {brandName}
        </span>
      </div>

      {/* Spot name */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: isPortrait ? "center" : "left",
          marginBottom: 12,
        }}
      >
        <h1
          style={{
            fontFamily: "sans-serif",
            fontSize: titleFontSize,
            fontWeight: 900,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
          }}
        >
          {spotName}
        </h1>
      </div>

      {/* Animated divider line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: primaryColor,
          borderRadius: 2,
          marginBottom: 16,
        }}
      />

      {/* Location & date */}
      <div
        style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          textAlign: isPortrait ? "center" : "left",
          marginBottom: isPortrait ? 48 : 32,
        }}
      >
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: subFontSize,
            fontWeight: 400,
            color: "rgba(255,255,255,0.85)",
            margin: 0,
            marginBottom: 8,
          }}
        >
          {spotLocation}
        </p>
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: locationFontSize,
            fontWeight: 300,
            color: "rgba(255,255,255,0.6)",
            margin: 0,
          }}
        >
          {date}
        </p>
      </div>

      {/* Rating badge */}
      <div
        style={{
          transform: `scale(${badgeScale})`,
          opacity: badgeOpacity,
          transformOrigin: isPortrait ? "center" : "left center",
        }}
      >
        <ConditionBadge rating={overallRating} fontSize={isPortrait ? 20 : 18} paddingH={24} paddingV={10} />
      </div>
    </AbsoluteFill>
  );
};
