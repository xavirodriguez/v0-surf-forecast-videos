export type FormatType = "video" | "still";

export type FormatConfig = {
  id: string;
  width: number;
  height: number;
  fps: number;
  type: FormatType;
  outputFilename: string;
};

export const FORMAT_CONFIGS: FormatConfig[] = [
  {
    id: "surf-forecast-landscape",
    width: 1920,
    height: 1080,
    fps: 30,
    type: "video",
    outputFilename: "surf-forecast-landscape.mp4",
  },
  {
    id: "surf-forecast-portrait",
    width: 1080,
    height: 1920,
    fps: 30,
    type: "video",
    outputFilename: "surf-forecast-portrait.mp4",
  },
  {
    id: "surf-forecast-square",
    width: 1080,
    height: 1080,
    fps: 30,
    type: "video",
    outputFilename: "surf-forecast-square.mp4",
  },
  {
    id: "surf-forecast-shorts",
    width: 1080,
    height: 1920,
    fps: 30,
    type: "video",
    outputFilename: "surf-forecast-shorts.mp4",
  },
  {
    id: "surf-forecast-tiktok",
    width: 1080,
    height: 1920,
    fps: 30,
    type: "video",
    outputFilename: "surf-forecast-tiktok.mp4",
  },
];

export const STILL_CONFIG: FormatConfig = {
  id: "surf-forecast-thumbnail",
  width: 1280,
  height: 720,
  fps: 30,
  type: "still",
  outputFilename: "surf-forecast-thumbnail.jpg",
};

export const VIDEO_FORMATS = FORMAT_CONFIGS.filter((f) => f.type === "video");
export const STILL_FORMATS = FORMAT_CONFIGS.filter((f) => f.type === "still");
