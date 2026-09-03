import type { Bounds } from "../types/bounds.ts";
import type { Shape } from "../types/shape.ts";

const contains = (bounds: Bounds, x: number, y: number, z: number): boolean => {
  return (
    x >= bounds.min[0] &&
    x < bounds.max[0] &&
    y >= bounds.min[1] &&
    y < bounds.max[1] &&
    z >= bounds.min[2] &&
    z < bounds.max[2]
  );
};

export const union = (...shapes: readonly [Shape, ...Shape[]]): Shape => {
  let minX = shapes[0].bounds.min[0];
  let minY = shapes[0].bounds.min[1];
  let minZ = shapes[0].bounds.min[2];
  let maxX = shapes[0].bounds.max[0];
  let maxY = shapes[0].bounds.max[1];
  let maxZ = shapes[0].bounds.max[2];

  for (let i = 1; i < shapes.length; i++) {
    const { min, max } = shapes[i].bounds;

    minX = Math.min(minX, min[0]);
    minY = Math.min(minY, min[1]);
    minZ = Math.min(minZ, min[2]);
    maxX = Math.max(maxX, max[0]);
    maxY = Math.max(maxY, max[1]);
    maxZ = Math.max(maxZ, max[2]);
  }

  return {
    bounds: {
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
    },
    sample: (x, y, z) => {
      // TODO: Later operands take precedence in overlapping shapes (correct?)
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];

        if (!contains(shape.bounds, x, y, z)) {
          continue;
        }

        const material = shape.sample(x, y, z);

        if (material !== undefined) {
          return material;
        }
      }

      return undefined;
    },
  };
};
