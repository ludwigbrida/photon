import { Group } from "./group.ts";

export type Vec3 = readonly [number, number, number];

export type Color = readonly [number, number, number];

export type Voxel = {
  readonly type: "voxel";
  readonly position: Vec3;
  readonly color: Color;
};

export type CompileOptions = {
  readonly depth: number;
};

export type CompiledScene = {
  readonly depth: number;
  readonly voxels: Uint32Array;
  readonly materials: Float32Array;
};

export type AuthorNode = Voxel | Group;
