import type { Camera } from "../camera/types.ts";
import type { Environment } from "../environment/types.ts";

export type RendererConfig = {
  readonly camera: Camera;
  readonly environment: Environment;
  readonly gpuBudget: number;
};
