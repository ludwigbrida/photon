import type { Camera } from "../types.ts";

export type RendererConfig = {
  readonly camera: Camera;
  readonly sampling: {
    readonly maxSamples: number;
  };
};

export const RENDERER_DEFAULT_CONFIG: RendererConfig = {
  camera: {
    projection: "orthographic",
    position: [0, 0, 0],
    target: [0, 0, 0],
    orthographicScale: 0,
  },
  sampling: {
    maxSamples: 0,
  },
};
