import { encodeBranch, encodeEmpty, encodeLeaf } from "./octree.ts";
import { Voxel } from "./types.ts";

export type CompiledScene = {
  readonly octree: Uint32Array;
};

export const compile = (root: Voxel): CompiledScene => {
  const [x, y, z] = root.position;

  const childIndex = x | (y << 1) | (z << 2);

  const nodes = new Uint32Array(9);

  nodes[0] = encodeBranch(1);

  for (let i = 0; i < 8; i++) {
    nodes[i + 1] = i === childIndex ? encodeLeaf(0) : encodeEmpty();
  }

  return {
    octree: nodes,
  };
};
