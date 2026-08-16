import { CompiledScene, CompileOptions, Voxel } from "@photon/author";
import { createOctree } from "./octree/create.ts";
import { flattenOctree } from "./octree/flatten.ts";

export const compile = (root: Voxel, { depth }: CompileOptions): CompiledScene => {
  const octree = createOctree(root, depth);

  const materials = new Float32Array([root.color[0], root.color[1], root.color[2], 1]);

  return {
    voxels: flattenOctree(octree),
    materials,
  };
};
