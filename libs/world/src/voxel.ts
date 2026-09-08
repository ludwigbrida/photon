import type { MaterialId } from "./material.ts";

export type Voxel = number;

export const EMPTY_VOXEL = 0;

export const createVoxel = (materialId: MaterialId): Voxel => {
  return materialId + 1;
};

export const getVoxelMaterialId = (voxel: Voxel): MaterialId | undefined => {
  return voxel === EMPTY_VOXEL ? undefined : voxel - 1;
};
