import type { Group } from "./group.ts";
import type { Voxel } from "./voxel.ts";

export type CompileOptions = {
  readonly depth: number;
};

export type AuthorNode = Voxel | Group;
