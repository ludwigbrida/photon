const TYPE_SHIFT = 30;

const EMPTY = 0b00 << TYPE_SHIFT;
const BRANCH = 0b01 << TYPE_SHIFT;
const LEAF = 0b10 << TYPE_SHIFT;

export const encodeEmpty = (): number => EMPTY;

export const encodeBranch = (firstChild: number): number => BRANCH | firstChild;

export const encodeLeaf = (material: number): number => LEAF | material;
