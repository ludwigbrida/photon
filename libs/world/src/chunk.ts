import type { Vector3 } from "@photon/core";

export const CHUNK_SIZE = 16;

declare const chunkKeyBrand: unique symbol;

export type ChunkKey = string & {
  readonly [chunkKeyBrand]: true;
};

export const createChunkKey = (coordinates: Vector3): ChunkKey => {
  return coordinates.join(",") as ChunkKey;
};

export const getChunkCoordinates = (key: ChunkKey): Vector3 => {
  const [x, y, z] = key.split(",").map(Number);
  return [x, y, z];
};

export type Chunk = {
  // 0 represents an empty cell. Filled cells store their material index plus 1.
  readonly voxels: Uint16Array;
};
