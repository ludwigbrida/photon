import { encodeBranch, encodeEmpty, encodeLeaf } from "./octree.ts";
import { Voxel } from "./types.ts";

export type CompiledScene = {
  readonly voxels: Uint32Array;
  readonly materials: Float32Array;
};

export const compile = (root: Voxel): CompiledScene => {
  const [x, y, z] = root.position;

  const childIndex = x | (y << 1) | (z << 2);

  const voxels = new Uint32Array(9);

  voxels[0] = encodeBranch(1);

  for (let i = 0; i < 8; i++) {
    voxels[i + 1] = i === childIndex ? encodeLeaf(0) : encodeEmpty();
  }

  const materials = new Float32Array([root.color[0], root.color[1], root.color[2], 1]);

  return {
    voxels,
    materials,
  };
};
