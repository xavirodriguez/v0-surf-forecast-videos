import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { RatingValue } from "../../schemas/surf-forecast.js";
import { getRatingColor, getRatingLabel } from "../../lib/rating.js";

type ConditionBadgeProps = {
  rating: RatingValue;
  fontSize?: number;
  paddingH?: number;
  paddingV?: number;
};

export const ConditionBadge = ({
  rating,
  fontSize = 14,
  paddingH = 14,
  paddingV = 6,
}: ConditionBadgeProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame,
    fps,
    config: { damping: 160, stiffness: 100 },
  });

  const scale = interpolate(entry, [0, 1], [0.6, 1]);
  const opacity = interpolate(entry, [0, 1], [0, 1]);

  const color = getRatingColor(rating);
  const label = getRatingLabel(rating);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: color + "33",
        border: `2px solid ${color}`,
        borderRadius: 999,
        paddingTop: paddingV,
        paddingBottom: paddingV,
        paddingLeft: paddingH,
        paddingRight: paddingH,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <span
        style={{
          color,
          fontWeight: 700,
          fontSize,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
};
