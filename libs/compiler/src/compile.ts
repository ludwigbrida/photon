import { CompiledScene, CompileOptions, Voxel } from "@photon/author";
import { encodeBranch, encodeEmpty, encodeLeaf } from "./octree/encode.ts";
import { getChildIndex } from "./octree/position.ts";

export const compile = (root: Voxel, { depth }: CompileOptions): CompiledScene => {
  const nodes: number[] = [];

  const buildLevel = (level: number): number => {
    const nodeIndex = nodes.length;

    // Reserve space for this node.
    nodes.push(0);

    if (level < 0) {
      nodes[nodeIndex] = encodeLeaf(0);
      return nodeIndex;
    }

    const firstChild = nodes.length;

    // Reserve eight consecutive child nodes.
    for (let i = 0; i < 8; i++) {
      nodes.push(encodeEmpty());
    }

    nodes[nodeIndex] = encodeBranch(firstChild);

    const occupiedChild = getChildIndex(root.position, level);

    const childSlot = firstChild + occupiedChild;

    if (level === 0) {
      nodes[childSlot] = encodeLeaf(0);
    } else {
      const branchIndex = buildLevel(level - 1);

      // buildLevel appended the branch elsewhere, so copy its encoded
      // branch value into the reserved child slot.
      nodes[childSlot] = nodes[branchIndex];
    }

    return nodeIndex;
  };

  buildLevel(depth - 1);

  const materials = new Float32Array([root.color[0], root.color[1], root.color[2], 1]);

  return {
    voxels: new Uint32Array(nodes),
    materials,
  };
};
