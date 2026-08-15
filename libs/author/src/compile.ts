import { Voxel } from "./types.ts";

export type CompiledScene = {
  readonly octree: Uint32Array;
};

export const compile = (root: Voxel): CompiledScene => {
  throw new Error("Not implemented");
};
