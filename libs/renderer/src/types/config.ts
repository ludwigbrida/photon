import type { Camera } from "@photon/core";
import type { Environment } from "../environment/types.ts";

export type RendererConfig = {
  readonly camera: Camera;
  readonly environment: Environment;
  readonly gpuBudget: number;
};
