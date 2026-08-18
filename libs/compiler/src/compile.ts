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
    [...materialIndices.keys()].flatMap((material) => [
      material.color[0],
      material.color[1],
      material.color[2],
      1,
    ]),
  );

  return {
    depth,
    voxels: flattenOctree(octree),
    materials,
  };
};
