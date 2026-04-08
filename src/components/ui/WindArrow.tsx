import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type WindArrowProps = {
  degrees: number;
  size?: number;
  color?: string;
};

export const WindArrow = ({
  degrees,
  size = 40,
  color = "#ffffff",
}: WindArrowProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame,
    fps,
    config: { damping: 120, stiffness: 80 },
  });

  const startRotation = (degrees || 0) - 90;
  const endRotation = degrees || 0;
  const rotation = interpolate(entry, [0, 1], [startRotation, endRotation]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Circle background */}
      <circle cx="20" cy="20" r="18" fill={color} opacity={0.15} />
      <circle cx="20" cy="20" r="18" stroke={color} strokeWidth={1.5} opacity={0.4} />
      {/* Arrow pointing up = wind coming FROM that direction */}
      <path
        d="M20 6 L26 22 L20 18 L14 22 Z"
        fill={color}
        opacity={0.95}
      />
      <line
        x1="20"
        y1="18"
        x2="20"
        y2="34"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.7}
      />
    </svg>
  );
};
