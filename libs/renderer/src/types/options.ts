import type { Scene } from "@photon/core";
import type { RendererTelemetry } from "./telemetry.ts";

export type RendererOptions = {
  readonly canvas: HTMLCanvasElement;
  readonly scene: Scene;
  readonly onTelemetryChange?: (telemetry: RendererTelemetry) => void;
};
