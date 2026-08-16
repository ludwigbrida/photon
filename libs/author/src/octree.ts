const NODE_TYPE_SHIFT = 30;

const NODE_TYPE_EMPTY = 0b00;
const NODE_TYPE_BRANCH = 0b01;
const NODE_TYPE_LEAF = 0b10;

export const encodeEmpty = (): number => NODE_TYPE_EMPTY << NODE_TYPE_SHIFT;

export const encodeBranch = (firstChild: number): number =>
  (NODE_TYPE_BRANCH << NODE_TYPE_SHIFT) | firstChild;

export const encodeLeaf = (materialIndex: number): number =>
  (NODE_TYPE_LEAF << NODE_TYPE_SHIFT) | materialIndex;
