import { Group } from "./group.ts";
import { Voxel } from "./voxel.ts";

export type CompileOptions = {
  readonly depth: number;
};

export type CompiledScene = {
  readonly depth: number;
  readonly voxels: Uint32Array;
  readonly materials: Float32Array;
};

export type AuthorNode = Voxel | Group;
