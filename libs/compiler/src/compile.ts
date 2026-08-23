import { AuthorNode, CompiledScene, CompileOptions, Material } from "@photon/author";
import { createOctree } from "./octree/create.ts";
import { flattenOctree } from "./octree/flatten.ts";
import { collect } from "./scene/collect.ts";

export const compile = (root: AuthorNode, { depth }: CompileOptions): CompiledScene => {
  const voxels = collect(root);

  const materialIndices = new Map<Material, number>();
  const voxelMaterialIndices = voxels.map((voxel) => {
    const existingIndex = materialIndices.get(voxel.material);

    if (existingIndex !== undefined) {
      return existingIndex;
    }

    const materialIndex = materialIndices.size;
    materialIndices.set(voxel.material, materialIndex);

    return materialIndex;
  });

  const octree = createOctree(voxels, voxelMaterialIndices, depth);

  const materials = new Float32Array(
    [...materialIndices.keys()].flatMap((material) => {
      const emission = material.emission;

      return [
        material.color[0],
        material.color[1],
        material.color[2],
        1,
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
  };
};
