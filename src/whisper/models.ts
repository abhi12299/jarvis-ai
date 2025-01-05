export const AVAILABLE_MODELS = [
  "tiny",
  "tiny.en",
  "base",
  "base.en",
  "small",
  "small.en",
  "medium",
  "medium.en",
  "large-v1",
  "large",
] as const;

export type WhisperModel = (typeof AVAILABLE_MODELS)[number];
