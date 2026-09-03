import type { AuthorNode, Voxel } from "@photon/author";

export const collect = (root: AuthorNode): Voxel[] => {
  if (root.type === "voxel") {
    return [root];
  }

  return root.children.flatMap(collect);
};
