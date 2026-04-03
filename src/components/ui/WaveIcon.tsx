import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

type WaveIconProps = {
  size?: number;
  color?: string;
};

export const WaveIcon = ({ size = 48, color = "#00b4d8" }: WaveIconProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const swell = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 40 },
  });

  const waveOffset = interpolate(swell, [0, 1], [6, 0]);
  const crestScale = interpolate(swell, [0, 1], [0.85, 1]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wave body */}
      <path
        d={`M2 ${28 + waveOffset} 
           C8 ${22 + waveOffset} 14 ${34 + waveOffset} 20 ${28 + waveOffset} 
           C26 ${22 + waveOffset} 32 ${34 + waveOffset} 38 ${28 + waveOffset} 
           C41 ${25 + waveOffset} 44 ${26 + waveOffset} 46 ${28 + waveOffset}
           L46 44 L2 44 Z`}
        fill={color}
        opacity={0.7}
      />
      {/* Wave crest */}
      <path
        d={`M12 ${18 - waveOffset * 0.5}
           C16 ${10 - waveOffset * 0.5 * crestScale} 
           22 ${8 - waveOffset * 0.5 * crestScale} 
           28 ${16 - waveOffset * 0.5}
           C24 ${20 - waveOffset * 0.5} 16 ${22 - waveOffset * 0.5} 12 ${18 - waveOffset * 0.5} Z`}
        fill={color}
        opacity={0.9}
      />
      {/* Foam tip */}
      <path
        d={`M14 ${16 - waveOffset * 0.5}
           C17 ${11 - waveOffset * 0.5 * crestScale}
           21 ${10 - waveOffset * 0.5 * crestScale}
           25 ${14 - waveOffset * 0.5}`}
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={0.85}
      />
    </svg>
  );
};
