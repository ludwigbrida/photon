import { type BranchNode, createBranchNode, createLeafNode } from "./node.ts";
import { getChildIndex } from "./position.ts";

export const createOctree = (): BranchNode => {
  return createBranchNode();
};

export const insertVoxel = (
  root: BranchNode,
  x: number,
  y: number,
  z: number,
  materialIndex: number,
  depth: number,
): void => {
  let branch = root;

  const halfExtent = 1 << (depth - 1);

  const octreePosition = [x + halfExtent, y + halfExtent, z + halfExtent] as const;

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

    throw new Error(`Cannot subdivide occupied voxel at ${x}, ${y}, ${z}`);
  }
};
