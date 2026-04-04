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

interface RatingConditions {
  height: number;
  period: number;
  windSpeed: number;
}

const RATING_RULES = [
  {
    rating: "epic" as SurfRating,
    isSatisfiedBy: ({ height, period, windSpeed }: RatingConditions) =>
      height >= 6 && period >= 14 && windSpeed < 10,
  },
  {
    rating: "good" as SurfRating,
    isSatisfiedBy: ({ height, period, windSpeed }: RatingConditions) =>
      height >= 4 && period >= 12 && windSpeed < 15,
  },
  {
    rating: "fair-good" as SurfRating,
    isSatisfiedBy: ({ height, period }: RatingConditions) =>
      height >= 3 && period >= 10,
  },
  {
    rating: "fair" as SurfRating,
    isSatisfiedBy: ({ height, period }: RatingConditions) =>
      height >= 2 && period >= 8,
  },
  {
    rating: "poor-fair" as SurfRating,
    isSatisfiedBy: ({ height }: RatingConditions) => height >= 1,
  },
  {
    rating: "poor" as SurfRating,
    isSatisfiedBy: ({ height }: RatingConditions) => height > 0,
  },
];

export function ratingFromWaveData(
  height: number,
  period: number,
  windSpeed: number
): SurfRating {
  const conditions = { height, period, windSpeed };
  const matchedRule = RATING_RULES.find((rule) =>
    rule.isSatisfiedBy(conditions)
  );

  return matchedRule?.rating ?? "flat";
}
