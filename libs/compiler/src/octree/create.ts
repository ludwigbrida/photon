import { Voxel } from "@photon/author";
import { BranchNode, createBranchNode, createLeafNode, Node } from "./node.ts";
import { getChildIndex } from "./position.ts";

export const createOctree = (
  voxels: readonly Voxel[],
  materialIndices: readonly number[],
  depth: number,
): Node => {
  const root = createBranchNode();

  for (let voxelIndex = 0; voxelIndex < voxels.length; voxelIndex++) {
    insertVoxel(root, voxels[voxelIndex], materialIndices[voxelIndex], depth);
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

  const halfExtent = 1 << (depth - 1);

  const octreePosition = [
    voxel.position[0] + halfExtent,
    voxel.position[1] + halfExtent,
    voxel.position[2] + halfExtent,
  ] as const;

  for (let level = depth - 1; level >= 0; level--) {
    const childIndex = getChildIndex(octreePosition, level);

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
