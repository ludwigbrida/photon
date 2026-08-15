import { Color, Vec3, Voxel } from "./types.ts";

export type VoxelOptions = {
  readonly position: Vec3;
  readonly color: Color;
};

export const voxel = ({ position, color }: VoxelOptions): Voxel => ({
  type: "voxel",
  position,
  color,
});
