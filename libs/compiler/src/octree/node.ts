export type EmptyNode = {
  readonly type: "empty";
};

export type BranchNode = {
  readonly type: "branch";
  readonly children: Node[];
};

export type LeafNode = {
  readonly type: "leaf";
  readonly materialIndex: number;
};

export type Node = EmptyNode | BranchNode | LeafNode;

const createEmptyNode = (): EmptyNode => ({
  type: "empty",
});

export const createBranchNode = (): BranchNode => ({
  type: "branch",
  children: Array.from({ length: 8 }, createEmptyNode),
});

export const createLeafNode = (materialIndex: number): LeafNode => ({
  type: "leaf",
  materialIndex,
});
