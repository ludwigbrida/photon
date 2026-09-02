import { type Bounds, type CompileOptions, type Material, type Shape } from "@photon/author";
import type { Scene } from "@photon/core";
import { createOctree, insertVoxel } from "./octree/create.ts";
import { flattenOctree } from "./octree/flatten.ts";

const assertBoundsFitOctree = (bounds: Bounds, depth: number): void => {
  if (!Number.isInteger(depth) || depth < 1 || depth > 30) {
    throw new Error("Octree depth must be an integer between 1 and 30.");
  }

  if (
    bounds.min[0] > bounds.max[0] ||
    bounds.min[1] > bounds.max[1] ||
    bounds.min[2] > bounds.max[2]
  ) {
    throw new Error("Shape bounds must have min <= max.");
  }

  const halfExtent = 1 << (depth - 1);
  const coordinates = [...bounds.min, ...bounds.max];

  if (!coordinates.every(Number.isInteger)) {
    throw new Error("Shape bounds must use integer voxel coordinates.");
  }

  if (
    bounds.min[0] < -halfExtent ||
    bounds.min[1] < -halfExtent ||
    bounds.min[2] < -halfExtent ||
    bounds.max[0] > halfExtent ||
    bounds.max[1] > halfExtent ||
    bounds.max[2] > halfExtent
  ) {
    throw new Error(`Shape bounds must fit within [-${halfExtent}, ${halfExtent}).`);
  }
};

export const compile = (shape: Shape, { depth }: CompileOptions): Scene => {
  assertBoundsFitOctree(shape.bounds, depth);

  const octree = createOctree();
  const materialIndices = new Map<Material, number>();
  const emitters: number[] = [];

  const getMaterialIndex = (material: Material): number => {
    const existingIndex = materialIndices.get(material);

    if (existingIndex !== undefined) {
      return existingIndex;
    }

    const materialIndex = materialIndices.size;

    materialIndices.set(material, materialIndex);

    return materialIndex;
  };

  const { min, max } = shape.bounds;

  for (let x = min[0]; x < max[0]; x++) {
    for (let y = min[1]; y < max[1]; y++) {
      for (let z = min[2]; z < max[2]; z++) {
        const material = shape.sample(x, y, z);

        if (material === undefined) {
          continue;
        }

        const materialIndex = getMaterialIndex(material);

        insertVoxel(octree, x, y, z, materialIndex, depth);

        if (material.emission !== undefined) {
          emitters.push(x, y, z, materialIndex);
        }
      }
    }
  }

  const materials = new Float32Array(
    [...materialIndices.keys()].flatMap((material) => {
      const emission = material.emission;

      return [
        material.color[0],
        material.color[1],
        material.color[2],
        material.metallic,
        emission ? emission.color[0] * emission.strength : 0,
        emission ? emission.color[1] * emission.strength : 0,
        emission ? emission.color[2] * emission.strength : 0,
        0,
      ];
    }),
  );

  return {
    depth,
    voxels: flattenOctree(octree),
    materials,
    emitters: new Float32Array(emitters),
  };
};
