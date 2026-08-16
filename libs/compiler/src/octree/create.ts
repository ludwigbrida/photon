import { Voxel } from "@photon/author";
import { createBranchNode, createLeafNode, Node } from "./node.ts";
import { getChildIndex } from "./position.ts";

export const createOctree = (voxel: Voxel, depth: number): Node => {
  const root = createBranchNode();

  let branch = root;

  for (let level = depth - 1; level >= 0; level--) {
    const childIndex = getChildIndex(voxel.position, level);

    if (level === 0) {
      branch.children[childIndex] = createLeafNode(0);
      break;
    }

    const childBranch = createBranchNode();

    branch.children[childIndex] = childBranch;

    branch = childBranch;
  }

  return root;
};
