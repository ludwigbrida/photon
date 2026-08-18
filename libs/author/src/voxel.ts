import { type Vector3 } from "@photon/core";
import { type Material } from "./material.ts";

export type VoxelOptions = {
  readonly position: Vector3;
  readonly material: Material;
};

export type Voxel = {
  readonly type: "voxel";
  readonly position: Vector3;
  readonly material: Material;
};

export const voxel = ({ position, material }: VoxelOptions): Voxel => ({
  type: "voxel",
  position,
  material,
});
