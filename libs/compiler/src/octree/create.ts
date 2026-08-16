import { Voxel } from "@photon/author";
import { BranchNode, createBranchNode, createLeafNode, Node } from "./node.ts";
import { getChildIndex } from "./position.ts";

export const createOctree = (voxels: readonly Voxel[], depth: number): Node => {
  const root = createBranchNode();

  for (let materialIndex = 0; materialIndex < voxels.length; materialIndex++) {
    const voxel = voxels[materialIndex];

    insertVoxel(root, voxel, materialIndex, depth);
  }

  return root;
};

const insertVoxel = (
  root: BranchNode,
  voxel: Voxel,
  materialIndex: number,
  depth: number,
): void => {
  let branch = root;

  for (let level = depth - 1; level >= 0; level--) {
    const childIndex = getChildIndex(voxel.position, level);

    if (level === 0) {
      branch.children[childIndex] = createLeafNode(materialIndex);

      return;
    }

    const child = branch.children[childIndex];

    if (child.type === "empty") {
      const childBranch = createBranchNode();

      branch.children[childIndex] = childBranch;
      branch = childBranch;

      continue;
    }

    if (child.type === "branch") {
      branch = child;
      continue;
    }

    throw new Error(`Cannot subdivide occupied voxel at ${voxel.position.join(", ")}`);
  }
};
