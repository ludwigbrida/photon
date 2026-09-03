import type { RenderScheduling } from "../scheduling.ts";

export type RendererTelemetry = {
  readonly isRunning: boolean;
  readonly sampleCount: number;
  readonly elapsedMilliseconds: number;
  readonly maxSamples: number;
  readonly scheduling: RenderScheduling;
};
