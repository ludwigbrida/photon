import type { MaterialIndex } from "./material.ts";

export type VoxelValue = number;

export const EMPTY_VOXEL_VALUE = 0;

export const encodeMaterialIndex = (materialIndex: MaterialIndex): VoxelValue => {
  return materialIndex + 1;
};

export const decodeMaterialIndex = (voxelValue: VoxelValue): MaterialIndex | undefined => {
  return voxelValue === EMPTY_VOXEL_VALUE ? undefined : voxelValue - 1;
};
