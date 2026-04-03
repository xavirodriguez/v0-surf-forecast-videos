import { RatingValue } from "../schemas/surf-forecast.js";

export const RATING_COLORS: Record<RatingValue, string> = {
  flat: "#999999",
  poor: "#e74c3c",
  "poor-fair": "#e67e22",
  fair: "#f39c12",
  "fair-good": "#27ae60",
  good: "#2ecc71",
  epic: "#9b59b6",
};

export const RATING_LABELS: Record<RatingValue, string> = {
  flat: "Flat",
  poor: "Poor",
  "poor-fair": "Poor–Fair",
  fair: "Fair",
  "fair-good": "Fair–Good",
  good: "Good",
  epic: "Epic",
};

export const RATING_ORDER: RatingValue[] = [
  "flat",
  "poor",
  "poor-fair",
  "fair",
  "fair-good",
  "good",
  "epic",
];

export const getRatingColor = (rating: RatingValue): string =>
  RATING_COLORS[rating];

export const getRatingLabel = (rating: RatingValue): string =>
  RATING_LABELS[rating];

export const getRatingScore = (rating: RatingValue): number =>
  RATING_ORDER.indexOf(rating);
