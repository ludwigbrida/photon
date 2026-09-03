import type { Scene } from "@photon/core";
import type { RenderSchedulingOptions } from "./scheduling.ts";
import type { RendererTelemetry } from "./types/telemetry.ts";

export { Projection } from "./camera/types.ts";
export type { Camera } from "./camera/types.ts";
export { createRenderer } from "./create.ts";
export {
  DEFAULT_RENDER_SCHEDULING,
  type RenderScheduling,
  type RenderSchedulingOptions,
} from "./scheduling.ts";
export type { RendererConfig } from "./types/config.ts";
export type { RendererHandle } from "./types/handle.ts";
export type { RendererTelemetry } from "./types/telemetry.ts";

export type RendererOptions = {
  readonly canvas: HTMLCanvasElement;
  readonly scene: Scene;
  readonly scheduling?: RenderSchedulingOptions;
  readonly onTelemetryChange?: (telemetry: RendererTelemetry) => void;
};

export type Renderer = { setGpuBudget: (gpuBudget: number) => void };

export const DEFAULT_MAX_SAMPLES = 256;
