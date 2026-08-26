import { type Vector3 } from "@photon/core";
import { type Material } from "../material.ts";
import { type Shape } from "../types/shape.ts";

export type CubeOptions = {
  readonly size: Vector3;
  readonly material: Material;
};

export const cube = ({ size, material }: CubeOptions): Shape => {
  return {
    bounds: {
      min: [0, 0, 0],
      max: size,
    },
    sample: (x, y, z) => {
      const isWithinBounds =
        x >= 0 && x < size[0] && y >= 0 && y < size[1] && z >= 0 && z < size[2];

      return isWithinBounds ? material : undefined;
    },
  };
};
