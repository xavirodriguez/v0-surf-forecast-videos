import { z } from 'zod';

const RatingEnum = z.enum([
  'flat',
  'poor',
  'poor-fair',
  'fair',
  'fair-good',
  'good',
  'epic',
]);

export type SurfRating = z.infer<typeof RatingEnum>;

/**
 * Calculate surf rating based on wave height, period, and wind speed
 * Rules:
 * - epic: height >= 6 && period >= 14 && windSpeed < 10
 * - good: height >= 4 && period >= 12 && windSpeed < 15
 * - fair-good: height >= 3 && period >= 10
 * - fair: height >= 2 && period >= 8
 * - poor-fair: height >= 1
 * - poor: height > 0
 * - flat: height === 0
 */
export function ratingFromWaveData(
  height: number,
  period: number,
  windSpeed: number
): SurfRating {
  if (height === 0) {
    return 'flat';
  }

  if (height >= 6 && period >= 14 && windSpeed < 10) {
    return 'epic';
  }

  if (height >= 4 && period >= 12 && windSpeed < 15) {
    return 'good';
  }

  if (height >= 3 && period >= 10) {
    return 'fair-good';
  }

  if (height >= 2 && period >= 8) {
    return 'fair';
  }

  if (height >= 1) {
    return 'poor-fair';
  }

  if (height > 0) {
    return 'poor';
  }

  return 'flat';
}
