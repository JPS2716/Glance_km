export const DETECT_IMAGE_URL = "https://glance-km-2.onrender.com/detect/image";
export const DETECT_VIDEO_URL = "https://glance-km-2.onrender.com/detect/video";

export const RESULTS_SESSION_KEY = "glanceDetectionResults";

export type DetectionSessionPayload = {
  url: string;
  time: number;
  detections: number;
  frames: number;
  type: "video" | "image";
  originalName: string;
};
