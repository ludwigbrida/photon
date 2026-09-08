export type ChunkKey = string;

export type Chunk = {
  // 0 represents an empty cell. Filled cells store their material palette index plus 1.
  readonly voxels: Uint16Array;
};
