import { AuthorNode, CompiledScene, CompileOptions } from "@photon/author";
import { createOctree } from "./octree/create.ts";
import { flattenOctree } from "./octree/flatten.ts";
import { collect } from "./scene/collect.ts";

export const compile = (root: AuthorNode, { depth }: CompileOptions): CompiledScene => {
  const voxels = collect(root);
  const octree = createOctree(voxels, depth);

  const materials = new Float32Array(
    voxels.flatMap((voxel) => [voxel.color[0], voxel.color[1], voxel.color[2], 1]),
  );

  return {
    depth,
    voxels: flattenOctree(octree),
    materials,
  };
};
