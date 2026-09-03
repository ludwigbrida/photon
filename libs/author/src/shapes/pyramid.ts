import type { Material } from "../material.ts";
import type { Shape } from "../types/shape.ts";

export type PyramidOptions = {
  readonly height: number;
  readonly material: Material;
};

export const pyramid = ({ height, material }: PyramidOptions): Shape => {
  const baseHalfSize = height - 1;

  return {
    bounds: {
      min: [-baseHalfSize, 0, -baseHalfSize],
      max: [baseHalfSize + 1, height, baseHalfSize + 1],
    },
    sample: (x, y, z) => {
      if (y < 0 || y >= height) {
        return undefined;
      }

      const halfSizeAtY = baseHalfSize - y;

      const isInside =
        x >= -halfSizeAtY && x <= halfSizeAtY && z >= -halfSizeAtY && z <= halfSizeAtY;

      return isInside ? material : undefined;
    },
  };
};
