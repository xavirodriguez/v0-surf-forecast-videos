import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const surfForecastSchema = z.object({
  spotName: z.string(),
  spotLocation: z.string(),
  date: z.string(),

  currentWaveHeight: z.number().min(0).max(20),
  currentWaveHeightUnit: z.enum(["ft", "m"]),
  currentPeriod: z.number().min(0).max(25),
  currentDirection: z.string(),
  currentDirectionDegrees: z.number().min(0).max(360),
  waterTemp: z.number(),
  waterTempUnit: z.enum(["C", "F"]),
  windSpeed: z.number().min(0),
  windDirection: z.string(),
  windDirectionDegrees: z.number().min(0).max(360),

  overallRating: z.enum([
    "flat",
    "poor",
    "poor-fair",
    "fair",
    "fair-good",
    "good",
    "epic",
  ]),

  hourlyForecast: z.array(
    z.object({
      hour: z.string(),
      waveHeight: z.number(),
      period: z.number(),
      windSpeed: z.number(),
      windDirection: z.string(),
      rating: z.enum([
        "flat",
        "poor",
        "poor-fair",
        "fair",
        "fair-good",
        "good",
        "epic",
      ]),
    })
  ),

  swellData: z.array(
    z.object({
      height: z.number(),
      period: z.number(),
      direction: z.string(),
      directionDegrees: z.number(),
    })
  ),

  tides: z.array(
    z.object({
      time: z.string(),
      height: z.number(),
      type: z.enum(["high", "low"]),
    })
  ),

  primaryColor: zColor(),
  secondaryColor: zColor(),
  backgroundColor: zColor(),

  logoUrl: z.string().optional(),
  brandName: z.string(),
});

export type SurfForecastProps = z.infer<typeof surfForecastSchema>;

export type RatingValue = SurfForecastProps["overallRating"];

export const defaultSurfData: SurfForecastProps = {
  spotName: "Pipeline",
  spotLocation: "North Shore, Oahu, Hawaii",
  date: "Thursday, April 3, 2026",

  currentWaveHeight: 8,
  currentWaveHeightUnit: "ft",
  currentPeriod: 14,
  currentDirection: "NNW",
  currentDirectionDegrees: 340,
  waterTemp: 76,
  waterTempUnit: "F",
  windSpeed: 12,
  windDirection: "ENE",
  windDirectionDegrees: 70,

  overallRating: "good",

  hourlyForecast: [
    {
      hour: "6:00 AM",
      waveHeight: 6.5,
      period: 13,
      windSpeed: 8,
      windDirection: "E",
      rating: "fair-good",
    },
    {
      hour: "7:00 AM",
      waveHeight: 7.0,
      period: 14,
      windSpeed: 9,
      windDirection: "ENE",
      rating: "fair-good",
    },
    {
      hour: "8:00 AM",
      waveHeight: 7.5,
      period: 14,
      windSpeed: 10,
      windDirection: "ENE",
      rating: "good",
    },
    {
      hour: "9:00 AM",
      waveHeight: 8.0,
      period: 14,
      windSpeed: 12,
      windDirection: "ENE",
      rating: "good",
    },
    {
      hour: "10:00 AM",
      waveHeight: 8.5,
      period: 15,
      windSpeed: 13,
      windDirection: "NE",
      rating: "good",
    },
    {
      hour: "11:00 AM",
      waveHeight: 8.5,
      period: 15,
      windSpeed: 14,
      windDirection: "NE",
      rating: "good",
    },
    {
      hour: "12:00 PM",
      waveHeight: 8.0,
      period: 14,
      windSpeed: 15,
      windDirection: "NE",
      rating: "fair-good",
    },
    {
      hour: "1:00 PM",
      waveHeight: 7.5,
      period: 13,
      windSpeed: 16,
      windDirection: "NE",
      rating: "fair-good",
    },
    {
      hour: "2:00 PM",
      waveHeight: 7.0,
      period: 13,
      windSpeed: 17,
      windDirection: "NNE",
      rating: "fair",
    },
    {
      hour: "3:00 PM",
      waveHeight: 6.5,
      period: 12,
      windSpeed: 18,
      windDirection: "NNE",
      rating: "fair",
    },
  ],

  swellData: [
    {
      height: 8.5,
      period: 15,
      direction: "NNW",
      directionDegrees: 340,
    },
    {
      height: 3.2,
      period: 9,
      direction: "NE",
      directionDegrees: 45,
    },
    {
      height: 1.5,
      period: 7,
      direction: "N",
      directionDegrees: 0,
    },
  ],

  tides: [
    { time: "2:14 AM", height: 0.4, type: "low" },
    { time: "8:32 AM", height: 2.1, type: "high" },
    { time: "2:47 PM", height: 0.2, type: "low" },
    { time: "8:58 PM", height: 1.9, type: "high" },
  ],

  primaryColor: "#00b4d8",
  secondaryColor: "#0077b6",
  backgroundColor: "#03045e",

  brandName: "SurfCast",
};
