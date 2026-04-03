import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
};

export const AnimatedNumber = ({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  fontSize = 48,
  color = "#ffffff",
  fontWeight = 700,
}: AnimatedNumberProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 80 },
  });

  const displayed = interpolate(entry, [0, 1], [0, value]);

  const formatted = decimals > 0
    ? displayed.toFixed(decimals)
    : Math.round(displayed).toString();

  return (
    <span
      style={{
        fontFamily: "sans-serif",
        fontSize,
        fontWeight,
        color,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {prefix}
      {formatted}
      {suffix && (
        <span
          style={{
            fontSize: fontSize * 0.55,
            fontWeight: 500,
            opacity: 0.8,
            marginLeft: 3,
          }}
        >
          {suffix}
        </span>
      )}
    </span>
  );
};
