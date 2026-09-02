import type { Scene } from "@photon/core";
import type { Camera } from "./camera/types.ts";
import type { Environment } from "./environment/types.ts";
import type { RenderScheduling } from "./scheduling.ts";

export { Projection } from "./camera/types.ts";
export { createRenderer } from "./create.ts";
export { DEFAULT_RENDER_SCHEDULING } from "./scheduling.ts";
export type { RendererConfig } from "./types/config.ts";
export type { RendererHandle } from "./types/handle.ts";

export type RendererOptions = {
  readonly canvas: HTMLCanvasElement;
  readonly camera: Camera;
  readonly environment: Environment;
  readonly scene: Scene;
  readonly maxSamples: number;
  readonly scheduling?: RenderScheduling;
  readonly onStatsChange?: (stats: RendererStats) => void;
};

export type RendererStats = {
  readonly isRunning: boolean;
  readonly sampleCount: number;
  readonly elapsedMilliseconds: number;
  readonly maxSamples: number;
  readonly scheduling: RenderScheduling;
};

export type Renderer = {
  start: () => void;
  stop: () => void;
  setMaxSamples: (maxSamples: number) => void;
  setScheduling: (scheduling: RenderScheduling) => void;
  setGpuBudget: (gpuBudget: number) => void;
};

export const DEFAULT_MAX_SAMPLES = 256;
