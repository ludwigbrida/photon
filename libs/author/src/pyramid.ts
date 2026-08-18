import { Vector3 } from "@photon/core";
import { group, Group } from "./group.ts";
import { Material } from "./material.ts";
import { voxel, Voxel } from "./voxel.ts";

export type PyramidOptions = {
  readonly position: Vector3;
  readonly material: Material;
  readonly height: number;
};

export const pyramid = ({ position, material, height }: PyramidOptions): Group => {
  const voxels: Voxel[] = [];

  for (let y = 0; y < height; y++) {
    const sideLength = (height - y) * 2 - 1;
    const halfSide = Math.floor(sideLength / 2);

    for (let x = -halfSide; x <= halfSide; x++) {
      for (let z = -halfSide; z <= halfSide; z++) {
        voxels.push(
          voxel({
            position: [position[0] + x, position[1] + y, position[2] + z],
            material,
          }),
        );
      }
    }
  }

  return group(...voxels);
};
