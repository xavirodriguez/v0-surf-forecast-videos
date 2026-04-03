import { z } from "zod";

const RatingEnum = z.enum([
  "flat",
  "poor",
  "poor-fair",
  "fair",
  "fair-good",
  "good",
  "epic",
]);

export type SurfRating = z.infer<typeof RatingEnum>;

interface RatingRule {
  rating: SurfRating;
  test: (height: number, period: number, windSpeed: number) => boolean;
}

const RATING_RULES: RatingRule[] = [
  {
    rating: "epic",
    test: (h, p, w) => h >= 6 && p >= 14 && w < 10,
  },
  {
    rating: "good",
    test: (h, p, w) => h >= 4 && p >= 12 && w < 15,
  },
  {
    rating: "fair-good",
    test: (h, p) => h >= 3 && p >= 10,
  },
  {
    rating: "fair",
    test: (h, p) => h >= 2 && p >= 8,
  },
  {
    rating: "poor-fair",
    test: (h) => h >= 1,
  },
  {
    rating: "poor",
    test: (h) => h > 0,
  },
];

/**
 * Calculate surf rating based on wave height, period, and wind speed.
 * Returns the highest matching rating based on defined rules.
 */
export function ratingFromWaveData(
  height: number,
  period: number,
  windSpeed: number
): SurfRating {
  const matchedRule = RATING_RULES.find((rule) =>
    rule.test(height, period, windSpeed)
  );

  return matchedRule?.rating ?? "flat";
}
