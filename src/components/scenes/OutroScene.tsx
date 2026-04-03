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

type OutroSceneProps = Pick<
  SurfForecastProps,
  | "spotName"
  | "brandName"
  | "overallRating"
  | "primaryColor"
  | "secondaryColor"
  | "backgroundColor"
  | "logoUrl"
>;

export const OutroScene = ({
  spotName,
  brandName,
  overallRating,
  primaryColor,
  secondaryColor,
  backgroundColor,
}: OutroSceneProps) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isPortrait = height > width;
  const isSquare = width === height;
  const padding = isPortrait ? 60 : isSquare ? 50 : 80;

  const bgEntry = spring({ frame, fps, config: { damping: 200, stiffness: 60 } });
  const brandEntry = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 160, stiffness: 80 } });
  const ctaEntry = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 160, stiffness: 70 } });
  const badgeEntry = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 200, stiffness: 90 } });

  const brandOpacity = interpolate(brandEntry, [0, 1], [0, 1]);
  const brandY = interpolate(brandEntry, [0, 1], [30, 0]);

  const ctaOpacity = interpolate(ctaEntry, [0, 1], [0, 1]);
  const ctaY = interpolate(ctaEntry, [0, 1], [40, 0]);

  const badgeScale = interpolate(badgeEntry, [0, 1], [0.5, 1]);
  const badgeOpacity = interpolate(badgeEntry, [0, 1], [0, 1]);

  const rippleScale = interpolate(bgEntry, [0, 1], [0.6, 1.2]);
  const rippleOpacity = interpolate(bgEntry, [0, 1], [0, 0.12]);

  const titleFontSize = isPortrait ? 52 : isSquare ? 44 : 64;
  const subFontSize = isPortrait ? 22 : isSquare ? 20 : 26;
  const brandFontSize = isPortrait ? 20 : isSquare ? 18 : 22;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor}cc 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding,
        overflow: "hidden",
      }}
    >
      {/* Pulsing background ripple */}
      <div
        style={{
          position: "absolute",
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: "50%",
          border: `2px solid ${primaryColor}`,
          opacity: rippleOpacity,
          transform: `scale(${rippleScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: width * 0.55,
          height: width * 0.55,
          borderRadius: "50%",
          border: `1px solid ${primaryColor}`,
          opacity: rippleOpacity * 0.7,
          transform: `scale(${rippleScale * 0.85})`,
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
          marginBottom: 32,
        }}
      >
        <WaveIcon size={brandFontSize * 1.8} color={primaryColor} />
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

      {/* Main CTA */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontFamily: "sans-serif",
            fontSize: titleFontSize,
            fontWeight: 900,
            color: "#ffffff",
            margin: 0,
            marginBottom: 12,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Check the Surf at
          <br />
          <span style={{ color: primaryColor }}>{spotName}</span>
        </h2>
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: subFontSize,
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            margin: 0,
          }}
        >
          Daily forecasts. Updated every 3 hours.
        </p>
      </div>

      {/* Badge */}
      <div
        style={{
          transform: `scale(${badgeScale})`,
          opacity: badgeOpacity,
        }}
      >
        <ConditionBadge
          rating={overallRating}
          fontSize={isPortrait ? 18 : 16}
          paddingH={24}
          paddingV={10}
        />
      </div>
    </AbsoluteFill>
  );
};
