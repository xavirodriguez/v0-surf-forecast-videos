import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { SurfForecastProps } from "../schemas/surf-forecast.js";
import { WaveIcon } from "./ui/WaveIcon.js";
import { ConditionBadge } from "./ui/ConditionBadge.js";
import { AnimatedNumber } from "./ui/AnimatedNumber.js";
import { WindArrow } from "./ui/WindArrow.js";

export const SurfThumbnail = ({
  spotName,
  spotLocation,
  date,
  currentWaveHeight,
  currentWaveHeightUnit,
  currentPeriod,
  overallRating,
  primaryColor,
  secondaryColor,
  backgroundColor,
  brandName,
}: SurfForecastProps) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const entry = spring({ frame, fps, config: { damping: 200, stiffness: 80 } });
  const opacity = interpolate(entry, [0, 1], [0, 1]);
  const scale = interpolate(entry, [0, 1], [0.96, 1]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor}ee 100%)`,
        overflow: "hidden",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Background circle accent */}
      <div
        style={{
          position: "absolute",
          top: -180,
          right: -140,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: primaryColor,
          opacity: 0.08,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: primaryColor,
          opacity: 0.05,
        }}
      />

      {/* Left column — brand + spot info */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          width: "52%",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <WaveIcon size={28} color={primaryColor} />
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: primaryColor,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
            }}
          >
            {brandName}
          </span>
        </div>

        {/* Spot name */}
        <h1
          style={{
            fontFamily: "sans-serif",
            fontSize: 72,
            fontWeight: 900,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.0,
          }}
        >
          {spotName}
        </h1>

        {/* Location */}
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: 22,
            fontWeight: 400,
            color: "rgba(255,255,255,0.65)",
            margin: 0,
          }}
        >
          {spotLocation}
        </p>

        {/* Date */}
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: 17,
            fontWeight: 300,
            color: "rgba(255,255,255,0.45)",
            margin: 0,
          }}
        >
          {date}
        </p>

        {/* Rating */}
        <div style={{ marginTop: 4 }}>
          <ConditionBadge rating={overallRating} fontSize={16} paddingH={20} paddingV={8} />
        </div>
      </div>

      {/* Right column — wave stat card */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.07)",
          border: `2px solid ${primaryColor}55`,
          borderRadius: 24,
          padding: "36px 44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          width: "32%",
          backdropFilter: "blur(4px)",
        }}
      >
        <WaveIcon size={64} color={primaryColor} />

        <AnimatedNumber
          value={currentWaveHeight}
          decimals={1}
          suffix={currentWaveHeightUnit}
          fontSize={86}
          color="#ffffff"
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Period
          </span>
          <span
            style={{
              fontFamily: "sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: primaryColor,
            }}
          >
            {currentPeriod}s
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "70%",
            height: 1,
            background: `${primaryColor}44`,
          }}
        />

        {/* Wave icon label */}
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Wave Height
        </span>
      </div>
    </AbsoluteFill>
  );
};
